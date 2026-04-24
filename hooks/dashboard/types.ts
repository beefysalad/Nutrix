export type UnitSystem = 'metric' | 'imperial'
export type AiModel = 'gemini-2.5-flash-lite' | 'gemini-2.5-flash'
export type GoalMode = 'cutting' | 'maintenance' | 'bulking' | 'custom'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
export type SuggestionStyle = 'quick' | 'lutong-bahay' | 'budget' | 'high-protein'
export type EntrySource = 'manual' | 'search' | 'ai' | 'telegram'
export type AiMealFeedback = 'accurate' | 'inaccurate'

export type PreferencesResponse = {
  preferences: {
    unitSystem: UnitSystem
    aiModel: AiModel
    aiModelPersistencePendingMigration?: boolean
  }
}

export type TelegramIntegrationResponse = {
  connection: {
    status: 'connected' | 'disconnected' | 'error'
    username: string | null
    externalUserId: string | null
    connectedAt: string | null
    chatId: string | null
  }
  webhook: {
    configured: boolean
    expectedUrl: string | null
    registeredUrl: string | null
    registered: boolean
    pendingUpdateCount: number | null
    lastErrorMessage: string | null
  }
}

export type GoalResponse = {
  goal: {
    id: string
    mode: GoalMode
    dailyCalories: number | null
    proteinGrams: number | null
    carbsGrams: number | null
    fatGrams: number | null
    startsAt: string | null
    endsAt: string | null
  } | null
  profile: {
    gender: 'male' | 'female' | null
    age: number | null
    weightKg: number | null
    heightCm: number | null
    activityLevel:
      | 'sedentary'
      | 'lightly-active'
      | 'moderately-active'
      | 'very-active'
      | null
  } | null
}

export type ParsedMeal = {
  mealType: MealType
  notes?: string | null
  confidence?: number
  assumptions?: string[]
  needsReview?: boolean
  items: Array<{
    foodName: string
    canonicalFoodName?: string
    quantity?: number | null
    unit?: string | null
    calories: number
    proteinGrams?: number | null
    carbsGrams?: number | null
    fatGrams?: number | null
  }>
}

export type ParseMealResponse = {
  model: string
  fallbackFrom?: string
  parsed: ParsedMeal
}

export type MealSuggestionResponse = {
  usage: {
    dailyLimit: number
    usedToday: number
    remainingToday: number
    resetAtLabel: string
    suggestionDate: string
  }
  payload: {
    model: string
    basedOn: {
      goalMode: GoalMode | null
      recentFoods: string[]
      generatedForMealType: MealType | null
      suggestionStyle: SuggestionStyle | null
    }
    suggestions: Array<{
      id: string
      recipeId: string
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
      isSaved: boolean
    }>
  } | null
}

export type SavedMealSuggestionsResponse = {
  suggestions: NonNullable<MealSuggestionResponse['payload']>['suggestions']
}

export type MealItemResponse = {
  id: string
  foodNameSnapshot: string
  quantity: string | number | null
  unit: string | null
  calories: number
  proteinGrams: string | number | null
  carbsGrams: string | number | null
  fatGrams: string | number | null
}

export type MealResponse = {
  id: string
  loggedAt: string
  mealType: MealType
  notes: string | null
  source: EntrySource
  aiFeedback: AiMealFeedback | null
  items: MealItemResponse[]
}

export type MealsResponse = {
  meals: MealResponse[]
}

export type DashboardSummaryResponse = {
  onBoarded: boolean
  date: string
  hasAnyMealHistory: boolean
  goal: {
    id: string
    dailyCalories: number | null
    proteinGrams: number | null
    carbsGrams: number | null
    fatGrams: number | null
    mode: GoalMode
  } | null
  totals: {
    calories: number
    proteinGrams: number
    carbsGrams: number
    fatGrams: number
    mealCount: number
  }
  remainingCalories: number | null
  meals: MealResponse[]
  recentMeals: MealResponse[]
}

export type DashboardTrendsResponse = {
  days: 7
  goalCalories: number | null
  points: Array<{
    date: string
    label: string
    calories: number
    protein: number
    carbs: number
    fat: number
  }>
}

export type DashboardInsightsResponse = {
  hasData: boolean
  insight: {
    daysLogged: number
    mealCount: number
    mostCommonMealType: string | null
    averageCalories: number
    remainingCalories: number | null
    averageProteinPerMeal: number
    averageCarbsPerMeal: number
    averageFatPerMeal: number
    topFoods: Array<{
      name: string
      count: number
    }>
    primaryInsight: string
    secondaryInsight: string | null
    actionInsight: string | null
  } | null
}

export type DailyReportResponse = {
  report: {
    id: string
    reportDate: string
    rating: number | null
    note: string | null
  } | null
  totals: {
    calories: number
    proteinGrams: number
    carbsGrams: number
    fatGrams: number
    mealCount: number
  }
  meals: MealResponse[]
}

export type ExportFormat = 'csv' | 'json'
