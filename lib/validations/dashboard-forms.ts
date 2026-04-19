import { z } from 'zod'

const optionalNumberField = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }

  return Number(value)
}, z.number().finite().nonnegative().optional())

const optionalPositiveIntegerField = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }

  return Number(value)
}, z.number().int().positive().optional())

const optionalNonNegativeIntegerField = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }

  return Number(value)
}, z.number().int().nonnegative().optional())

export const settingsFormSchema = z.object({
  unitSystem: z.enum(['metric', 'imperial']),
  aiModel: z.enum(['gemini-2.5-flash-lite', 'gemini-2.5-flash']),
  language: z.enum(['English', 'Spanish', 'French', 'German']),
})

export const aiMealParseFormSchema = z.object({
  text: z.string().trim().min(5, 'Add a fuller meal description'),
})

export const manualMealFormSchema = z.object({
  foodName: z.string().trim().min(1, 'Food name is required'),
  calories: z.preprocess(
    (value) => Number(value),
    z.number().int().nonnegative('Calories must be 0 or more'),
  ),
  proteinGrams: optionalNumberField,
  carbsGrams: optionalNumberField,
  fatGrams: optionalNumberField,
  servingSize: z.string().trim().optional(),
})

export const goalsFormSchema = z.object({
  mode: z.enum(['cutting', 'maintenance', 'bulking', 'custom']),
  dailyCalories: optionalPositiveIntegerField,
  proteinGrams: optionalNonNegativeIntegerField,
  carbsGrams: optionalNonNegativeIntegerField,
  fatGrams: optionalNonNegativeIntegerField,
  reportTime: z.string().optional(),
  telegramReminders: z.boolean().default(false),
})

export const tdeeCalculatorSchema = z.object({
  sex: z.enum(['male', 'female']),
  age: z.preprocess((value) => Number(value), z.number().int().min(13).max(100)),
  weightKg: z.preprocess((value) => Number(value), z.number().positive().max(500)),
  heightCm: z.preprocess((value) => Number(value), z.number().positive().max(300)),
  activityLevel: z.enum([
    'sedentary',
    'lightly-active',
    'moderately-active',
    'very-active',
  ]),
})

export const dailyReportFormSchema = z.object({
  rating: z.number().int().min(1).max(5),
  note: z.string().trim().max(2000).optional(),
})

export type SettingsFormValues = z.infer<typeof settingsFormSchema>
export type AiMealParseFormValues = z.infer<typeof aiMealParseFormSchema>
export type ManualMealFormValues = z.infer<typeof manualMealFormSchema>
export type GoalsFormValues = z.infer<typeof goalsFormSchema>
export type ManualMealFormInput = z.input<typeof manualMealFormSchema>
export type GoalsFormInput = z.input<typeof goalsFormSchema>
export type TdeeCalculatorValues = z.infer<typeof tdeeCalculatorSchema>
export type TdeeCalculatorInput = z.input<typeof tdeeCalculatorSchema>
export type DailyReportFormValues = z.infer<typeof dailyReportFormSchema>
