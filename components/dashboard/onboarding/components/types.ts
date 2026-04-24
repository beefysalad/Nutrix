export type Step = 0 | 1 | 2 | 3 | 4 | 5

export const genderOptions = ['male', 'female'] as const

export const activityOptions = [
  {
    id: 'sedentary',
    label: 'Sedentary',
    desc: 'Minimal movement, office life',
  },
  {
    id: 'lightly-active',
    label: 'Lightly Active',
    desc: '1-3 days of exercise',
  },
  {
    id: 'moderately-active',
    label: 'Moderately Active',
    desc: '3-5 days of hard work',
  },
  {
    id: 'very-active',
    label: 'Very Active',
    desc: '6-7 days of intense training',
  },
  {
    id: 'extra-active',
    label: 'Extra Active',
    desc: 'Physical job & pro athlete',
  },
] as const

export const goalOptions = [
  {
    id: 'lose-weight',
    label: 'Lose Weight',
    desc: 'Aggressive calorie deficit for fat loss',
  },
  {
    id: 'maintain-weight',
    label: 'Maintenance',
    desc: 'Optimize performance and vitality',
  },
  {
    id: 'gain-weight',
    label: 'Gain Muscle',
    desc: 'Calorie surplus geared for hypertrophy',
  },
] as const

export const featureOptions = [
  {
    label: 'Search',
    desc: 'Look up foods quickly and add them with portions.',
  },
  {
    label: 'AI parsing',
    desc: 'Type meals like "4 siomai and rice" and Nutrix estimates the entry.',
  },
  {
    label: 'Custom',
    desc: 'Manually add exact calories and macros when you already know them.',
  },
  {
    label: 'Telegram',
    desc: 'Send meals to @NutrrixBot when you want to log from chat.',
  },
] as const
