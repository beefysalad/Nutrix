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
  items: z.array(parsedMealItemSchema).min(1),
})
