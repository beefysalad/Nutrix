import { Prisma } from '@/app/generated/prisma/client'
import { type z } from 'zod'
import { env } from '@/lib/env'
import prisma from '@/lib/prisma'
import {
  aiModelSchema,
  generatedMealSuggestionsSchema,
  parsedMealResultSchema,
} from '@/lib/validations/nutrition'
import type { SuggestionStyle } from '@/lib/data/recipe-catalog'
import { mealRepository } from '@/lib/repositories/meal-repository'
import { goalRepository } from '@/lib/repositories/goal-repository'
import { userRepository } from '@/lib/repositories/user-repository'
import { suggestionRepository } from '@/lib/repositories/suggestion-repository'

const systemPrompt = `
You are a nutrition meal parser for Nutrix.
Convert the user's free-text meal description into a JSON object only.
Nutrix users often log Filipino foods, fast-food meals, and short shorthand messages.
Return valid JSON with this exact shape:
{
  "mealType": "breakfast" | "lunch" | "dinner" | "snack" | "other",
  "notes": string | null,
  "confidence": number,
  "assumptions": string[],
  "needsReview": boolean,
  "items": [
    {
      "foodName": string,
      "canonicalFoodName": string,
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
- foodName should preserve what the user meant; canonicalFoodName should be normalized for clean logs.
- Prefer common Filipino/local names when relevant: pork siomai, cooked white rice, chicken adobo, pork sinigang, tinola, pancit canton, lumpia, tapsilog, chicken inasal.
- Use assumptions for unclear serving sizes, cooking style, flavor, or brand.
- Set confidence from 0 to 1. Use needsReview=true when serving size, food identity, or calories are uncertain.
- Always return at least one item.
Examples:
- "2 eggs and rice" -> boiled egg, cooked white rice. Assume 1 cup rice if not specified.
- "4 siomai" -> pork siomai, quantity 4, unit pieces.
- "jollibee chickenjoy with rice" -> Chickenjoy fried chicken and steamed rice as separate items.
- "mango float one big cup" -> mango float, quantity 1, unit large cup, needsReview true.
- "Del Monte Four Season Juice" -> Del Monte Four Seasons Juice, quantity 1, unit serving/can if amount is unclear.
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
    confidence: {
      type: 'NUMBER',
    },
    assumptions: {
      type: 'ARRAY',
      items: {
        type: 'STRING',
      },
    },
    needsReview: {
      type: 'BOOLEAN',
    },
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          foodName: { type: 'STRING' },
          canonicalFoodName: { type: 'STRING' },
          quantity: { type: 'NUMBER', nullable: true },
          unit: { type: 'STRING', nullable: true },
          calories: { type: 'NUMBER' },
          proteinGrams: { type: 'NUMBER' },
          carbsGrams: { type: 'NUMBER' },
          fatGrams: { type: 'NUMBER' },
        },
        required: [
          'foodName',
          'canonicalFoodName',
          'quantity',
          'unit',
          'calories',
          'proteinGrams',
          'carbsGrams',
          'fatGrams',
        ],
      },
    },
  },
  required: ['mealType', 'confidence', 'assumptions', 'needsReview', 'items'],
} as const

const geminiMealSuggestionsResponseSchema = {
  type: 'OBJECT',
  properties: {
    suggestions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          name: { type: 'STRING' },
          description: { type: 'STRING' },
          calories: { type: 'NUMBER' },
          protein: { type: 'NUMBER' },
          carbs: { type: 'NUMBER' },
          fat: { type: 'NUMBER' },
          tags: {
            type: 'ARRAY',
            items: {
              type: 'STRING',
            },
          },
          reasoning: { type: 'STRING' },
          ingredients: {
            type: 'ARRAY',
            items: {
              type: 'STRING',
            },
          },
          instructions: {
            type: 'ARRAY',
            items: {
              type: 'STRING',
            },
          },
          cookingNotes: {
            type: 'STRING',
            nullable: true,
          },
          prepTime: { type: 'STRING' },
          difficulty: {
            type: 'STRING',
            enum: ['easy', 'medium'],
          },
          sourceLabel: {
            type: 'STRING',
            nullable: true,
          },
          sourceUrl: {
            type: 'STRING',
            nullable: true,
          },
        },
        required: [
          'id',
          'name',
          'description',
          'calories',
          'protein',
          'carbs',
          'fat',
          'tags',
          'reasoning',
          'ingredients',
          'instructions',
          'prepTime',
          'difficulty',
        ],
      },
    },
  },
  required: ['suggestions'],
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

function canonicalizeFoodName(foodName: string) {
  const normalized = foodName.trim().replace(/\s+/g, ' ')
  const key = normalized.toLowerCase()

  const aliases: Array<[RegExp, string]> = [
    [/\bsiomai\b/, 'Pork siomai'],
    [/\bwhite rice\b|\brice\b|\bkanin\b/, 'Cooked white rice'],
    [/\bboiled egg\b|\begg\b|\bitlog\b/, 'Boiled egg'],
    [/\badobo\b/, 'Chicken adobo'],
    [/\bsinigang\b/, 'Pork sinigang'],
    [/\btinola\b/, 'Chicken tinola'],
    [/\bpancit canton\b/, 'Pancit canton'],
    [/\blumpia\b|\bspring roll\b/, 'Lumpia'],
    [/\btapsilog\b/, 'Tapsilog'],
    [/\bchicken inasal\b|\binasal\b/, 'Chicken inasal'],
    [/\bmango float\b/, 'Mango float'],
    [/\bfour season/, 'Del Monte Four Seasons Juice'],
  ]

  return aliases.find(([pattern]) => pattern.test(key))?.[1] ?? normalized
}

function normalizeParsedMeal(payload: unknown) {
  const parsed = parsedMealResultSchema.safeParse(payload)

  if (!parsed.success) {
    return null
  }

  return {
    mealType: parsed.data.mealType,
    notes: parsed.data.notes ?? null,
    confidence: parsed.data.confidence ?? 0.75,
    assumptions: parsed.data.assumptions ?? [],
    needsReview: parsed.data.needsReview ?? false,
    items: parsed.data.items.map((item) => ({
      foodName: canonicalizeFoodName(item.canonicalFoodName ?? item.foodName),
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

type SuggestionGoalMode =
  | 'cutting'
  | 'maintenance'
  | 'bulking'
  | 'custom'
  | null
type SuggestionMealType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'other'
  | null

type MealSuggestionsPayload = {
  model: string
  basedOn: {
    goalMode: SuggestionGoalMode
    recentFoods: string[]
    generatedForMealType: SuggestionMealType
    suggestionStyle: SuggestionStyle | null
  }
  suggestions: Array<{
    id: string
    recipeId?: string
    name: string
    description: string
    calories: number
    protein: number
    carbs: number
    fat: number
    tags: string[]
    reasoning: string
    ingredients: string[]
    instructions: string[]
    cookingNotes: string | null
    prepTime: string
    difficulty: 'easy' | 'medium'
    sourceLabel: string | null
    sourceUrl: string | null
  }>
}

function getStringArrayFromJson(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

function buildPayloadFromSuggestionRows(
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[]
): MealSuggestionsPayload | null {
  if (rows.length === 0) {
    return null
  }

  const firstSuggestion = rows[0]

  return {
    model:
      firstSuggestion.sourceLabel === 'Nutrix AI'
        ? 'gemini-ai-suggestions'
        : 'stored-suggestions',
    basedOn: {
      goalMode: firstSuggestion.goalMode as SuggestionGoalMode,
      recentFoods: getStringArrayFromJson(firstSuggestion.recentFoods),
      generatedForMealType:
        firstSuggestion.generatedForMealType as SuggestionMealType,
      suggestionStyle: firstSuggestion.style as SuggestionStyle,
    },
    suggestions: rows.map((suggestion) => ({
      id: suggestion.id,
      recipeId: suggestion.recipeId,
      name: suggestion.name,
      description: suggestion.description,
      calories: suggestion.calories,
      protein: Number(suggestion.protein),
      carbs: Number(suggestion.carbs),
      fat: Number(suggestion.fat),
      tags: getStringArrayFromJson(suggestion.tags),
      reasoning: suggestion.reasoning,
      ingredients: getStringArrayFromJson(suggestion.ingredients),
      instructions: getStringArrayFromJson(suggestion.instructions),
      cookingNotes: suggestion.cookingNotes || null,
      prepTime: suggestion.prepTime,
      difficulty: suggestion.difficulty as 'easy' | 'medium',
      sourceLabel: suggestion.sourceLabel || null,
      sourceUrl: suggestion.sourceUrl || null,
      isSaved: suggestion.isSaved,
    })),
  }
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
    }
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

function slugifySuggestionId(value: string, fallback: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || fallback
}

function normalizeGeneratedSuggestions(payload: unknown) {
  const parsed = generatedMealSuggestionsSchema.safeParse(
    Array.isArray(payload) ? { suggestions: payload } : payload
  )

  if (!parsed.success) {
    return null
  }

  return parsed.data.suggestions.slice(0, 3).map((suggestion, index) => ({
    id: slugifySuggestionId(
      suggestion.id ?? suggestion.name,
      `ai-suggestion-${index + 1}`
    ),
    name: suggestion.name.trim(),
    description: suggestion.description.trim().slice(0, 400),
    calories: Math.round(suggestion.calories),
    protein: Number(suggestion.protein.toFixed(1)),
    carbs: Number(suggestion.carbs.toFixed(1)),
    fat: Number(suggestion.fat.toFixed(1)),
    tags: Array.from(
      new Set(suggestion.tags.map((tag) => tag.trim()).filter(Boolean))
    ).slice(0, 4),
    reasoning: suggestion.reasoning.trim().slice(0, 400),
    ingredients: suggestion.ingredients
      .map((ingredient) => ingredient.trim())
      .filter(Boolean)
      .slice(0, 12)
      .map((ingredient) => ingredient.slice(0, 160)),
    instructions: suggestion.instructions
      .map((step) => step.trim())
      .filter(Boolean)
      .slice(0, 10)
      .map((step) => step.slice(0, 300)),
    cookingNotes: suggestion.cookingNotes?.trim().slice(0, 500) || null,
    prepTime: suggestion.prepTime.trim().slice(0, 50),
    difficulty: suggestion.difficulty,
    sourceLabel: suggestion.sourceLabel?.trim() || 'Nutrix AI',
    sourceUrl: suggestion.sourceUrl?.trim() || '',
  }))
}

function formatGoalContext(
  goalMode: SuggestionGoalMode,
  activeGoal: {
    dailyCalories?: number | null
    proteinGrams?: number | null
    carbsGrams?: number | null
    fatGrams?: number | null
  } | null
) {
  return {
    mode: goalMode ?? 'custom',
    dailyCalories: activeGoal?.dailyCalories ?? null,
    proteinGrams: activeGoal?.proteinGrams ?? null,
    carbsGrams: activeGoal?.carbsGrams ?? null,
    fatGrams: activeGoal?.fatGrams ?? null,
  }
}

async function callGeminiMealSuggestions(input: {
  model: GeminiModel
  suggestionStyle: SuggestionStyle
  goalMode: SuggestionGoalMode
  activeGoal: {
    dailyCalories?: number | null
    proteinGrams?: number | null
    carbsGrams?: number | null
    fatGrams?: number | null
  } | null
  mealTypeFocus: SuggestionMealType
  recentFoods: string[]
}) {
  if (!env.GEMINI_API_KEY) {
    return {
      ok: false as const,
      status: 500,
      details: 'Gemini API key is not configured',
    }
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${input.model}:generateContent?key=${env.GEMINI_API_KEY}`,
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
                text: [
                  'You are the Nutrix smart meal suggestion engine.',
                  'Generate 3 complete, cookable meal recipes tailored to the user context below.',
                  'These should be original recipes, not linked recipes and not selected from a fixed catalog.',
                  'Keep the meals realistic for Filipino users, using common ingredients, home-style meals, or practical takeout patterns when helpful.',
                  'Return JSON only.',
                  'Rules:',
                  '- Generate exactly 3 recipes.',
                  '- Do not mention external websites or recipe publishers.',
                  '- Keep each description concise and useful.',
                  '- Keep reasoning specific to the user context, not generic nutrition advice.',
                  '- Include practical ingredients with quantities for one serving.',
                  '- Include clear step-by-step cooking instructions a normal user can follow.',
                  '- Include a short cookingNotes value with substitutions, timing, or meal-prep guidance.',
                  '- Avoid repeating the exact same protein or meal base across all 3 suggestions.',
                  '- Match the requested style strongly.',
                  '- If style is high-protein, aim for at least 25g protein in most suggestions.',
                  '- If style is quick, bias toward 10 to 25 minutes or easy assembly.',
                  '- If style is budget, favor affordable ingredients and simple combinations.',
                  '- If style is lutong-bahay, make the meals feel comforting and home-cooked.',
                  '- Macros should be plausible estimates for one serving.',
                  '- Use sourceLabel "Nutrix AI" and sourceUrl "" unless a real source is truly required.',
                  `User context: ${JSON.stringify({
                    suggestionStyle: input.suggestionStyle,
                    goal: formatGoalContext(input.goalMode, input.activeGoal),
                    mealTypeFocus: input.mealTypeFocus,
                    recentFoods: input.recentFoods,
                  })}`,
                ].join('\n'),
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: geminiMealSuggestionsResponseSchema,
          temperature: 0.8,
        },
      }),
    }
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
      details: 'Gemini returned no suggestion content',
    }
  }

  try {
    const normalizedText = normalizeJsonText(textPart)
    const parsedPayload = JSON.parse(normalizedText)
    const normalizedSuggestions = normalizeGeneratedSuggestions(parsedPayload)

    if (!normalizedSuggestions) {
      return {
        ok: false as const,
        status: 502,
        details: 'Gemini returned suggestions in an unexpected shape',
      }
    }

    return {
      ok: true as const,
      suggestions: normalizedSuggestions,
    }
  } catch {
    return {
      ok: false as const,
      status: 502,
      details: 'Gemini returned invalid JSON for suggestions',
    }
  }
}

export const mealAiService = {
  async getUserPreferredModel(userId: string) {
    let selectedModel: GeminiModel = 'gemini-2.5-flash-lite'

    try {
      const profile = await userRepository.findProfileByUserId(userId)
      selectedModel = aiModelSchema.parse(
        profile?.aiModel ?? 'gemini-2.5-flash-lite'
      )
    } catch (error) {
      if (!isMissingAiModelColumn(error)) {
        throw error
      }
    }

    return selectedModel
  },

  async parseMealForUser(input: {
    userId: string
    text: string
    mealType?: string
  }) {
    const selectedModel = await this.getUserPreferredModel(input.userId)
    const primaryAttempt = await callGemini(
      selectedModel,
      input.text,
      input.mealType
    )

    if (primaryAttempt.ok) {
      return {
        model: selectedModel,
        parsed: primaryAttempt.parsed,
      }
    }

    if (selectedModel === 'gemini-2.5-flash-lite') {
      const fallbackModel: GeminiModel = 'gemini-2.5-flash'
      const fallbackAttempt = await callGemini(
        fallbackModel,
        input.text,
        input.mealType
      )

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
    mealType?: Exclude<SuggestionMealType, null>
  }) {
    const selectedStyle = input.suggestionStyle ?? 'quick'
    const [profile, usageCount] = await Promise.all([
      userRepository.findProfileByUserId(input.userId),
      userRepository.getFoodSuggestionLimit(input.userId),
    ])

    const suggestionDate = getSuggestionDate(profile?.timezone)
    const generationId = await suggestionRepository.findLatestGenerationId(
      input.userId,
      selectedStyle,
      input.mealType
    )

    const latestSuggestions = generationId
      ? await suggestionRepository.findSuggestionsByGenerationId(
          input.userId,
          generationId
        )
      : []

    return {
      usage: {
        dailyLimit: 3,
        usedToday: usageCount,
        remainingToday: Math.max(3 - usageCount, 0),
        resetAtLabel: '12:00 AM',
        suggestionDate,
      },
      payload: buildPayloadFromSuggestionRows(latestSuggestions),
    }
  },

  async generateMealSuggestionsForUser(input: {
    userId: string
    suggestionStyle?: SuggestionStyle
    mealType?: Exclude<SuggestionMealType, null>
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
          .flatMap((meal) =>
            meal.items.map((item) => item.foodNameSnapshot.trim())
          )
          .filter(Boolean)
      )
    ).slice(0, 8)

    const mealTypeCounts = recentMeals.reduce<Record<string, number>>(
      (accumulator, meal) => {
        accumulator[meal.mealType] = (accumulator[meal.mealType] ?? 0) + 1
        return accumulator
      },
      {}
    )

    const inferredMealTypeFocus =
      Object.entries(mealTypeCounts).sort(
        (left, right) => right[1] - left[1]
      )[0]?.[0] ?? null
    const mealTypeFocus = input.mealType ?? inferredMealTypeFocus

    const selectedModel = await this.getUserPreferredModel(input.userId)
    let modelUsed: GeminiModel = selectedModel
    const primaryAttempt = await callGeminiMealSuggestions({
      model: modelUsed,
      suggestionStyle: selectedStyle,
      goalMode: activeGoal?.mode ?? null,
      activeGoal,
      mealTypeFocus: mealTypeFocus as SuggestionMealType,
      recentFoods,
    })

    let suggestionBatch = primaryAttempt

    if (!primaryAttempt.ok && selectedModel === 'gemini-2.5-flash-lite') {
      modelUsed = 'gemini-2.5-flash'
      suggestionBatch = await callGeminiMealSuggestions({
        model: modelUsed,
        suggestionStyle: selectedStyle,
        goalMode: activeGoal?.mode ?? null,
        activeGoal,
        mealTypeFocus: mealTypeFocus as SuggestionMealType,
        recentFoods,
      })
    }

    if (!suggestionBatch.ok) {
      throw new Error(suggestionBatch.details)
    }

    const generationId = crypto.randomUUID()
    const payloadBase = {
      model: modelUsed,
      basedOn: {
        goalMode: activeGoal?.mode ?? null,
        recentFoods,
        generatedForMealType: (mealTypeFocus as SuggestionMealType) ?? null,
        suggestionStyle: selectedStyle,
      },
      suggestions: suggestionBatch.suggestions,
    }

    const createdSuggestions = await prisma.$transaction(
      async (transaction) => {
        const currentUser = await transaction.user.findUnique({
          where: { id: input.userId },
          select: { foodSuggestionLimit: true },
        })
        const currentUsageCount = currentUser?.foodSuggestionLimit ?? 0

        if (currentUsageCount >= 3) {
          throw new Error('Daily smart suggestion limit reached')
        }

        await transaction.user.update({
          where: { id: input.userId },
          data: {
            foodSuggestionLimit: {
              increment: 1,
            },
          },
        })

        await transaction.foodSuggestion.deleteMany({
          where: {
            userId: input.userId,
            style: selectedStyle,
            isSaved: false,
          },
        })

        return Promise.all(
          payloadBase.suggestions.map((suggestion) =>
            transaction.foodSuggestion.create({
              data: {
                userId: input.userId,
                generationId,
                style: selectedStyle,
                recipeId: suggestion.id,
                name: suggestion.name,
                description: suggestion.description,
                calories: suggestion.calories,
                protein: new Prisma.Decimal(suggestion.protein),
                carbs: new Prisma.Decimal(suggestion.carbs),
                fat: new Prisma.Decimal(suggestion.fat),
                tags: suggestion.tags,
                reasoning: suggestion.reasoning,
                ingredients: suggestion.ingredients,
                instructions: suggestion.instructions,
                cookingNotes: suggestion.cookingNotes ?? '',
                prepTime: suggestion.prepTime,
                difficulty: suggestion.difficulty,
                sourceLabel: suggestion.sourceLabel,
                sourceUrl: suggestion.sourceUrl,
                goalMode: payloadBase.basedOn.goalMode,
                recentFoods: payloadBase.basedOn.recentFoods,
                generatedForMealType: payloadBase.basedOn.generatedForMealType,
              },
            })
          )
        )
      }
    )

    return {
      usage: {
        dailyLimit: 3,
        usedToday: usageCount + 1,
        remainingToday: Math.max(3 - (usageCount + 1), 0),
        resetAtLabel: '12:00 AM',
        suggestionDate,
      },
      payload: buildPayloadFromSuggestionRows(createdSuggestions),
    }
  },

  async saveMealSuggestionForUser(input: {
    userId: string
    suggestionId: string
    isSaved?: boolean
  }) {
    const updateResult = await suggestionRepository.updateSaveStatus(
      input.userId,
      input.suggestionId,
      input.isSaved ?? true
    )

    if (updateResult.count === 0) {
      throw new Error('Suggestion not found')
    }

    const suggestion = await suggestionRepository.findById(
      input.suggestionId,
      input.userId
    )

    return {
      suggestion,
    }
  },

  async getSavedMealSuggestionsForUser(input: { userId: string }) {
    const suggestions = await suggestionRepository.findSavedSuggestions(
      input.userId
    )

    return {
      suggestions:
        buildPayloadFromSuggestionRows(suggestions)?.suggestions ?? [],
    }
  },

  async resetDailySuggestionUsage() {
    // This is admin/internal, but let's keep it consistent
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
