import { Prisma } from '@/app/generated/prisma/client'

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
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured yet')
    }

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
}
