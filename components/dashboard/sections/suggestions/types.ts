import { type MealSuggestionResponse } from '@/hooks/dashboard'

export const suggestionStyleOptions = [
  {
    id: 'quick',
    label: 'Quick',
    description: 'Fast meals and easy assemblies for busy days.',
  },
  {
    id: 'lutong-bahay',
    label: 'Lutong Bahay',
    description: 'Comforting home-style ideas that still fit your targets.',
  },
  {
    id: 'budget',
    label: 'Budget',
    description: 'Affordable combinations using practical ingredients.',
  },
  {
    id: 'high-protein',
    label: 'High Protein',
    description: 'Protein-forward ideas without making the meal feel plain.',
  },
] as const

export const mealTypeOptions = [
  { id: 'any', label: 'Any meal' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
  { id: 'other', label: 'Other' },
] as const

export type SuggestionStyle = (typeof suggestionStyleOptions)[number]['id']
export type MealTypePreference = (typeof mealTypeOptions)[number]['id']
export type SuggestionPayload = NonNullable<MealSuggestionResponse['payload']>
export type SuggestionCard = SuggestionPayload['suggestions'][number]
export type GoalMode = SuggestionPayload['basedOn']['goalMode']

export function formatStyleLabel(style: SuggestionStyle) {
  switch (style) {
    case 'lutong-bahay':
      return 'Lutong Bahay'
    case 'high-protein':
      return 'High Protein'
    default:
      return style.charAt(0).toUpperCase() + style.slice(1)
  }
}

export function formatMealPreference(mealType: MealTypePreference) {
  return mealTypeOptions.find((option) => option.id === mealType)?.label ?? 'Any meal'
}

export function formatGoalMode(goalMode: GoalMode | undefined) {
  switch (goalMode) {
    case 'cutting':
      return 'Cutting'
    case 'maintenance':
      return 'Maintenance'
    case 'bulking':
      return 'Bulking'
    case 'custom':
      return 'Custom'
    default:
      return 'Not set'
  }
}
