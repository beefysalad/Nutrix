export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other'
export type AiModel = 'gemini-2.5-flash-lite' | 'gemini-2.5-flash'
export type AiFeedback = 'accurate' | 'inaccurate' | null
export type SheetLogMode = 'ai' | 'manual' | null

export const mealTags: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'other']

export function getDefaultMealTypeForCurrentTime(): MealType {
  const hour = new Date().getHours()

  if (hour < 11) return 'breakfast'
  if (hour < 15) return 'lunch'
  if (hour < 18) return 'snack'
  return 'dinner'
}

export function formatMealType(mealType: MealType | string) {
  return mealType.charAt(0).toUpperCase() + mealType.slice(1)
}
