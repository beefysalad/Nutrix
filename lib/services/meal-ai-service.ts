import { Prisma } from '@/app/generated/prisma/client'

import { recipeCatalog, type RecipeCatalogItem, type SuggestionStyle } from '@/lib/data/recipe-catalog'
import { env } from '@/lib/env'
import prisma from '@/lib/prisma'
import {
  aiModelSchema,
  parsedMealResultSchema,
} from '@/lib/validations/nutrition'
import type { z } from 'zod'

const systemPrompt = `
You are a nutrition meal parser for Nutrix.
Convert the user's free-text meal description into a JSON object only.
Return valid JSON with this exact shape:
{
  "mealType": "breakfast" | "lunch" | "dinner" | "snack" | "other",
  "notes": string | null,
  "items": [
    {
      "foodName": string,
      "quantity": number | null,
      "unit": string | null,
      "calories": number,
      "proteinGrams": number,
      "carbsGrams": number,
      "fatGrams": number
    }
  ]
}
Rules:
- Return JSON only. No markdown.
- Split combo meals into distinct items when helpful.
- Always provide best-effort estimates for calories, protein, carbs, and fat for every item.
- Prefer whole numbers for calories and up to 1 decimal place for macros.
- If quantity or unit is unclear, use null.
- Always return at least one item.
`.trim()

const geminiResponseSchema = {
  type: 'OBJECT',
  properties: {
    mealType: {
      type: 'STRING',
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'other'],
    },
    notes: {
      type: 'STRING',
      nullable: true,
    },
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          foodName: { type: 'STRING' },
          quantity: { type: 'NUMBER', nullable: true },
          unit: { type: 'STRING', nullable: true },
          calories: { type: 'NUMBER' },
          proteinGrams: { type: 'NUMBER' },
          carbsGrams: { type: 'NUMBER' },
          fatGrams: { type: 'NUMBER' },
        },
        required: ['foodName', 'quantity', 'unit', 'calories', 'proteinGrams', 'carbsGrams', 'fatGrams'],
      },
    },
  },
  required: ['mealType', 'items'],
} as const

type GeminiModel = z.infer<typeof aiModelSchema>

function isMissingAiModelColumn(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2022' &&
    typeof error.meta?.column === 'string' &&
    error.meta.column.includes('aiModel')
  )
}

function normalizeJsonText(text: string) {
  const trimmed = text.trim()

  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  }

  return trimmed
}

function normalizeParsedMeal(payload: unknown) {
  const parsed = parsedMealResultSchema.safeParse(payload)

  if (!parsed.success) {
    return null
  }

  return {
    mealType: parsed.data.mealType,
    notes: parsed.data.notes ?? null,
    items: parsed.data.items.map((item) => ({
      foodName: item.foodName.trim(),
      quantity: item.quantity ?? null,
      unit: item.unit?.trim() || null,
      calories: Math.round(item.calories),
      proteinGrams: Number(item.proteinGrams.toFixed(1)),
      carbsGrams: Number(item.carbsGrams.toFixed(1)),
      fatGrams: Number(item.fatGrams.toFixed(1)),
    })),
  }
}

function getSuggestionDate(timezone?: string | null) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone || 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

type CachedSuggestionPayload = {
  model: string
  basedOn: {
    goalMode: 'cutting' | 'maintenance' | 'bulking' | 'custom' | null
    recentFoods: string[]
    generatedForMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other' | null
    suggestionStyle: SuggestionStyle | null
  }
  suggestions: Array<{
    id: string
    name: string
    description: string
    calories: number
    protein: number
    carbs: number
    fat: number
    tags: string[]
    reasoning: string
    prepTime: string
    difficulty: 'easy' | 'medium'
    sourceLabel: string
    sourceUrl: string
  }>
}

async function callGemini(model: GeminiModel, text: string, mealType?: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\nRequested meal type: ${mealType ?? 'infer from text'}\nMeal text: ${text}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: geminiResponseSchema,
          temperature: 0.2,
        },
      }),
    },
  )

  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      details: await response.text(),
    }
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>
      }
    }>
  }

  const textPart = payload.candidates?.[0]?.content?.parts?.[0]?.text

  if (!textPart) {
    return {
      ok: false as const,
      status: 502,
      details: 'Gemini returned no parseable content',
    }
  }

  try {
    const normalizedText = normalizeJsonText(textPart)
    const parsedPayload = JSON.parse(normalizedText)
    const normalizedMeal = normalizeParsedMeal(parsedPayload)

    if (!normalizedMeal) {
      return {
        ok: false as const,
        status: 502,
        details: 'Gemini returned JSON in an unexpected shape',
      }
    }

    return {
      ok: true as const,
      parsed: normalizedMeal,
    }
  } catch {
    return {
      ok: false as const,
      status: 502,
      details: 'Gemini returned invalid JSON',
    }
  }
}

function tokenize(values: string[]) {
  return new Set(
    values
      .flatMap((value) => value.toLowerCase().split(/[^a-z0-9]+/))
      .map((value) => value.trim())
      .filter((value) => value.length >= 3),
  )
}

function extractMinutes(prepTime: string) {
  const hourMatch = /(\d+)\s*hr/i.exec(prepTime)
  const minuteMatch = /(\d+)\s*min/i.exec(prepTime)

  const hours = hourMatch ? Number(hourMatch[1]) * 60 : 0
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0

  return hours + minutes
}

function scoreRecipe(input: {
  recipe: RecipeCatalogItem
  suggestionStyle: SuggestionStyle
  goalMode: 'cutting' | 'maintenance' | 'bulking' | 'custom' | null
  mealTypeFocus: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other' | null
  recentFoodTokens: Set<string>
}) {
  const { recipe, suggestionStyle, goalMode, mealTypeFocus, recentFoodTokens } = input
  let score = 0

  if (recipe.styles.includes(suggestionStyle)) {
    score += 6
  }

  if (mealTypeFocus && recipe.mealTypes.includes(mealTypeFocus)) {
    score += 3
  }

  const recipeTokens = tokenize([recipe.name, recipe.description, ...recipe.tags])
  const overlapCount = Array.from(recipeTokens).filter((token) => recentFoodTokens.has(token)).length
  score += overlapCount * 2

  if (suggestionStyle === 'quick' && extractMinutes(recipe.prepTime) <= 30) {
    score += 3
  }

  if (suggestionStyle === 'budget' && recipe.tags.includes('Budget')) {
    score += 3
  }

  if (suggestionStyle === 'lutong-bahay' && recipe.tags.includes('Lutong Bahay')) {
    score += 3
  }

  if (suggestionStyle === 'high-protein' && recipe.protein >= 25) {
    score += 4
  }

  switch (goalMode) {
    case 'cutting':
      if (recipe.calories <= 450) score += 3
      if (recipe.protein >= 20) score += 2
      if (recipe.fat <= 20) score += 1
      break
    case 'maintenance':
      if (recipe.calories >= 280 && recipe.calories <= 550) score += 2
      if (recipe.protein >= 18) score += 1
      break
    case 'bulking':
      if (recipe.calories >= 420) score += 3
      if (recipe.protein >= 25) score += 2
      if (recipe.carbs >= 30) score += 1
      break
    case 'custom':
    case null:
      if (recipe.protein >= 18) score += 1
      break
  }

  return score
}

function buildReasoning(input: {
  recipe: RecipeCatalogItem
  suggestionStyle: SuggestionStyle
  goalMode: 'cutting' | 'maintenance' | 'bulking' | 'custom' | null
  mealTypeFocus: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other' | null
  recentFoodTokens: Set<string>
}) {
  const parts: string[] = []
  const { recipe, suggestionStyle, goalMode, mealTypeFocus, recentFoodTokens } = input

  parts.push(`This is a real source-backed ${formatStyleLabel(suggestionStyle)} pick`)

  if (mealTypeFocus && recipe.mealTypes.includes(mealTypeFocus)) {
    parts.push(`that lines up with your usual ${mealTypeFocus} logging`)
  }

  if (goalMode === 'cutting' && recipe.protein >= 20 && recipe.calories <= 450) {
    parts.push('with a leaner calorie profile for your cutting target')
  } else if (goalMode === 'bulking' && recipe.protein >= 25) {
    parts.push('with solid calories and protein for your bulking target')
  } else if (goalMode === 'maintenance') {
    parts.push('that stays balanced for day-to-day maintenance')
  } else if (goalMode === 'custom' && recipe.protein >= 18) {
    parts.push('with a solid protein baseline for your custom goals')
  }

  const recipeTokens = tokenize([recipe.name, recipe.description, ...recipe.tags])
  const hasOverlap = Array.from(recipeTokens).some((token) => recentFoodTokens.has(token))

  if (hasOverlap) {
    parts.push('and it stays fairly close to foods you already seem comfortable logging')
  }

  return `${parts.join(' ')}.`
}

function formatStyleLabel(style: SuggestionStyle) {
  switch (style) {
    case 'lutong-bahay':
      return 'lutong-bahay'
    case 'high-protein':
      return 'high-protein'
    default:
      return style
  }
}

export const mealAiService = {
  async getUserPreferredModel(userId: string) {
    let selectedModel: GeminiModel = 'gemini-2.5-flash-lite'

    try {
      const profile = await prisma.userProfile.findUnique({
        where: { userId },
        select: { aiModel: true },
      })

      selectedModel = aiModelSchema.parse(profile?.aiModel ?? 'gemini-2.5-flash-lite')
    } catch (error) {
      if (!isMissingAiModelColumn(error)) {
        throw error
      }
    }

    return selectedModel
  },

  async parseMealForUser(input: { userId: string; text: string; mealType?: string }) {
    const selectedModel = await this.getUserPreferredModel(input.userId)
    const primaryAttempt = await callGemini(selectedModel, input.text, input.mealType)

    if (primaryAttempt.ok) {
      return {
        model: selectedModel,
        parsed: primaryAttempt.parsed,
      }
    }

    if (selectedModel === 'gemini-2.5-flash-lite') {
      const fallbackModel: GeminiModel = 'gemini-2.5-flash'
      const fallbackAttempt = await callGemini(fallbackModel, input.text, input.mealType)

      if (fallbackAttempt.ok) {
        return {
          model: fallbackModel,
          fallbackFrom: selectedModel,
          parsed: fallbackAttempt.parsed,
        }
      }

      throw new Error(fallbackAttempt.details)
    }

    throw new Error(primaryAttempt.details)
  },

  async getMealSuggestionsForUser(input: {
    userId: string
    suggestionStyle?: SuggestionStyle
  }) {
    const [profile, user] = await Promise.all([
      prisma.userProfile.findUnique({
        where: { userId: input.userId },
        select: { timezone: true },
      }),
      prisma.user.findUnique({
        where: { id: input.userId },
        select: { foodSuggestionLimit: true },
      }),
    ])
    const suggestionDate = getSuggestionDate(profile?.timezone)
    const usageCount = user?.foodSuggestionLimit ?? 0

    return {
      usage: {
        dailyLimit: 3,
        usedToday: usageCount,
        remainingToday: Math.max(3 - usageCount, 0),
        resetAtLabel: '12:00 AM',
        suggestionDate,
      },
      payload: null,
    }
  },

  async generateMealSuggestionsForUser(input: {
    userId: string
    suggestionStyle?: SuggestionStyle
  }) {
    const selectedStyle = input.suggestionStyle ?? 'quick'
    const [profile, user] = await Promise.all([
      prisma.userProfile.findUnique({
        where: { userId: input.userId },
        select: { timezone: true },
      }),
      prisma.user.findUnique({
        where: { id: input.userId },
        select: { foodSuggestionLimit: true },
      }),
    ])
    const suggestionDate = getSuggestionDate(profile?.timezone)
    const usageCount = user?.foodSuggestionLimit ?? 0

    if (usageCount >= 3) {
      throw new Error('Daily smart suggestion limit reached')
    }

    const [activeGoal, recentMeals] = await Promise.all([
      prisma.goal.findFirst({
        where: {
          userId: input.userId,
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          mode: true,
          dailyCalories: true,
          proteinGrams: true,
          carbsGrams: true,
          fatGrams: true,
        },
      }),
      prisma.mealEntry.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          items: true,
        },
        orderBy: {
          loggedAt: 'desc',
        },
        take: 12,
      }),
    ])

    const recentFoods = Array.from(
      new Set(
        recentMeals
          .flatMap((meal) => meal.items.map((item) => item.foodNameSnapshot.trim()))
          .filter(Boolean),
      ),
    ).slice(0, 8)

    const mealTypeCounts = recentMeals.reduce<Record<string, number>>((accumulator, meal) => {
      accumulator[meal.mealType] = (accumulator[meal.mealType] ?? 0) + 1
      return accumulator
    }, {})

    const mealTypeFocus =
      Object.entries(mealTypeCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? null

    const recentFoodTokens = tokenize(recentFoods)
    const scoredRecipes = recipeCatalog
      .map((recipe) => ({
        recipe,
        score: scoreRecipe({
          recipe,
          suggestionStyle: selectedStyle,
          goalMode: activeGoal?.mode ?? null,
          mealTypeFocus: mealTypeFocus as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other' | null,
          recentFoodTokens,
        }),
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, 3)

    const payload: CachedSuggestionPayload = {
      model: 'curated-recipe-library',
      basedOn: {
        goalMode: activeGoal?.mode ?? null,
        recentFoods,
        generatedForMealType:
          (mealTypeFocus as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other' | null) ?? null,
        suggestionStyle: selectedStyle,
      },
      suggestions: scoredRecipes.map(({ recipe }) => ({
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        tags: recipe.tags,
        reasoning: buildReasoning({
          recipe,
          suggestionStyle: selectedStyle,
          goalMode: activeGoal?.mode ?? null,
          mealTypeFocus:
            (mealTypeFocus as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other' | null) ?? null,
          recentFoodTokens,
        }),
        prepTime: recipe.prepTime,
        difficulty: recipe.difficulty,
          sourceLabel: recipe.sourceLabel,
          sourceUrl: recipe.sourceUrl,
      })),
    }

    await prisma.user.update({
      where: { id: input.userId },
      data: {
        foodSuggestionLimit: {
          increment: 1,
        },
      },
    })

    return {
      usage: {
        dailyLimit: 3,
        usedToday: usageCount + 1,
        remainingToday: Math.max(3 - (usageCount + 1), 0),
        resetAtLabel: '12:00 AM',
        suggestionDate,
      },
      payload,
    }
  },

  async resetDailySuggestionUsage() {
    await prisma.user.updateMany({
      data: {
        foodSuggestionLimit: 0,
      },
    })

    return {
      ok: true,
      resetCountForAllUsers: true,
    }
  },
}
