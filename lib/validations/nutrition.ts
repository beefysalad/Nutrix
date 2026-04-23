import { z } from 'zod'

export const aiModelSchema = z.enum(['gemini-2.5-flash-lite', 'gemini-2.5-flash'])
export const aiMealFeedbackSchema = z.enum(['accurate', 'inaccurate'])

export const mealItemInputSchema = z.object({
  foodId: z.string().cuid().optional(),
  foodName: z.string().min(1).max(200),
  quantity: z.number().positive().optional(),
  unit: z.string().max(50).optional(),
  calories: z.number().int().nonnegative(),
  proteinGrams: z.number().nonnegative().optional(),
  carbsGrams: z.number().nonnegative().optional(),
  fatGrams: z.number().nonnegative().optional(),
})

export const createMealSchema = z.object({
  loggedAt: z.string().datetime().optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'other']),
  source: z.enum(['manual', 'search', 'ai', 'telegram']).default('manual'),
  aiFeedback: aiMealFeedbackSchema.optional(),
  notes: z.string().max(2000).optional(),
  items: z.array(mealItemInputSchema).min(1),
})

export const upsertGoalSchema = z.object({
  mode: z.enum(['cutting', 'maintenance', 'bulking', 'custom']).default('custom'),
  dailyCalories: z.number().int().positive().nullable().optional(),
  proteinGrams: z.number().int().nonnegative().nullable().optional(),
  carbsGrams: z.number().int().nonnegative().nullable().optional(),
  fatGrams: z.number().int().nonnegative().nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
})

export const updatePreferencesSchema = z.object({
  unitSystem: z.enum(['metric', 'imperial']).optional(),
  aiModel: aiModelSchema.optional(),
})

export const parseMealSchema = z.object({
  text: z.string().min(5).max(4000),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'other']).optional(),
})

export const updateMealAiFeedbackSchema = z.object({
  aiFeedback: aiMealFeedbackSchema.nullable(),
})

export const parsedMealItemSchema = z.object({
  foodName: z.string().min(1).max(200),
  canonicalFoodName: z.string().min(1).max(200).optional(),
  quantity: z.number().positive().nullable(),
  unit: z.string().max(50).nullable(),
  calories: z.number().nonnegative(),
  proteinGrams: z.number().nonnegative(),
  carbsGrams: z.number().nonnegative(),
  fatGrams: z.number().nonnegative(),
})

export const parsedMealResultSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'other']),
  notes: z.string().max(2000).nullable().optional(),
  confidence: z.number().min(0).max(1).optional(),
  assumptions: z.array(z.string().min(1).max(220)).max(5).optional(),
  needsReview: z.boolean().optional(),
  items: z.array(parsedMealItemSchema).min(1),
})

export const mealSuggestionSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(400),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  tags: z.array(z.string().min(1).max(50)).min(1).max(4),
  reasoning: z.string().min(1).max(400),
  prepTime: z.string().min(1).max(50),
  difficulty: z.enum(['easy', 'medium']),
  sourceLabel: z.string().min(1).max(120),
  sourceUrl: z.url().max(500),
})

export const mealSuggestionsResultSchema = z.object({
  basedOn: z.object({
    goalMode: z.enum(['cutting', 'maintenance', 'bulking', 'custom']).nullable(),
    recentFoods: z.array(z.string()).max(8),
    generatedForMealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'other']).nullable(),
    suggestionStyle: z.enum(['quick', 'lutong-bahay', 'budget', 'high-protein']).nullable(),
  }),
  suggestions: z.array(mealSuggestionSchema).min(1).max(4),
})
