import type { DashboardSectionKey } from '@/components/dashboard/types'

export const navItems: Array<{ key: DashboardSectionKey; href: string; label: string }> = [
  { key: 'overview', href: '/dashboard', label: 'Overview' },
  { key: 'log', href: '/dashboard/log', label: 'Log Meal' },
  { key: 'meals', href: '/dashboard/meals', label: 'Meals' },
  { key: 'calendar', href: '/dashboard/calendar', label: 'Calendar' },
  { key: 'trends', href: '/dashboard/trends', label: 'Trends' },
  { key: 'insights', href: '/dashboard/insights', label: 'Insights' },
  { key: 'daily-report', href: '/dashboard/report/daily', label: 'Daily Report' },
  { key: 'weekly-summary', href: '/dashboard/report/weekly', label: 'Weekly Summary' },
  { key: 'goals', href: '/dashboard/goals', label: 'Goals' },
  { key: 'settings', href: '/dashboard/settings', label: 'Settings' },
]

export const macroData = [
  { name: 'Calories', current: 1650, goal: 2000 },
  { name: 'Protein', current: 120, goal: 150 },
  { name: 'Carbs', current: 180, goal: 200 },
  { name: 'Fat', current: 55, goal: 67 },
]

export const dailyCaloriesData = [
  { label: 'Breakfast', value: 450 },
  { label: 'Lunch', value: 600 },
  { label: 'Snack', value: 200 },
  { label: 'Dinner', value: 400 },
]

export const donutData = [
  { name: 'Protein', value: 480, color: '#4ade80' },
  { name: 'Carbs', value: 720, color: '#22c55e' },
  { name: 'Fat', value: 495, color: '#888888' },
]

export const mealTimelineData = [
  {
    id: 1,
    meal: 'Breakfast',
    time: '08:30 AM',
    food: 'Oatmeal with berries',
    items: '2 items',
    calories: 450,
  },
  {
    id: 2,
    meal: 'Lunch',
    time: '12:45 PM',
    food: 'Grilled chicken salad',
    items: '4 items',
    calories: 600,
  },
  {
    id: 3,
    meal: 'Snack',
    time: '03:15 PM',
    food: 'Greek yogurt',
    items: '1 item',
    calories: 200,
  },
  {
    id: 4,
    meal: 'Dinner',
    time: '07:00 PM',
    food: 'Salmon with vegetables',
    items: '3 items',
    calories: 400,
  },
]

export const mealsData = [
  {
    id: 1,
    name: 'Grilled Chicken Breast',
    meal: 'Lunch',
    time: '12:45 PM',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    source: 'web',
  },
  {
    id: 2,
    name: 'Brown Rice',
    meal: 'Lunch',
    time: '12:45 PM',
    calories: 224,
    protein: 4.6,
    carbs: 48,
    fat: 1.8,
    source: 'web',
  },
  {
    id: 3,
    name: 'Oatmeal with berries',
    meal: 'Breakfast',
    time: '08:30 AM',
    calories: 450,
    protein: 12,
    carbs: 78,
    fat: 8,
    source: 'ai',
  },
  {
    id: 4,
    name: 'Greek yogurt',
    meal: 'Snack',
    time: '03:15 PM',
    calories: 200,
    protein: 20,
    carbs: 10,
    fat: 6,
    source: 'photo',
  },
  {
    id: 5,
    name: 'Salmon fillet',
    meal: 'Dinner',
    time: '07:00 PM',
    calories: 280,
    protein: 39,
    carbs: 0,
    fat: 13,
    source: 'custom',
  },
]

export const calendarData: Record<number, { calories: number; goal: number; meals: number }> = {
  1: { calories: 1950, goal: 2000, meals: 4 },
  2: { calories: 2100, goal: 2000, meals: 5 },
  3: { calories: 1850, goal: 2000, meals: 4 },
  5: { calories: 1700, goal: 2000, meals: 3 },
  8: { calories: 2250, goal: 2000, meals: 5 },
  12: { calories: 1900, goal: 2000, meals: 4 },
  15: { calories: 1980, goal: 2000, meals: 4 },
  18: { calories: 1850, goal: 2000, meals: 4 },
  19: { calories: 1650, goal: 2000, meals: 4 },
}

export const caloriesTrendData = [
  { label: 'Apr 13', calories: 1850, goal: 2000 },
  { label: 'Apr 14', calories: 1920, goal: 2000 },
  { label: 'Apr 15', calories: 1980, goal: 2000 },
  { label: 'Apr 16', calories: 2100, goal: 2000 },
  { label: 'Apr 17', calories: 1750, goal: 2000 },
  { label: 'Apr 18', calories: 1890, goal: 2000 },
  { label: 'Apr 19', calories: 1650, goal: 2000 },
]

export const macroStackData = [
  { label: 'Apr 13', protein: 480, carbs: 720, fat: 495 },
  { label: 'Apr 14', protein: 500, carbs: 740, fat: 510 },
  { label: 'Apr 15', protein: 520, carbs: 760, fat: 530 },
  { label: 'Apr 16', protein: 540, carbs: 800, fat: 560 },
  { label: 'Apr 17', protein: 460, carbs: 680, fat: 470 },
  { label: 'Apr 18', protein: 490, carbs: 730, fat: 505 },
  { label: 'Apr 19', protein: 480, carbs: 720, fat: 495 },
]

export const mealDistribution = [
  { meal: 'Breakfast', calories: 450 },
  { meal: 'Lunch', calories: 600 },
  { meal: 'Snack', calories: 200 },
  { meal: 'Dinner', calories: 400 },
]

export const insightCards = [
  {
    title: 'Meal Pattern',
    body: 'You consistently eat larger lunches. Consider redistributing calories to dinner for better evening energy.',
    highlight: '600 cal avg lunch',
  },
  {
    title: 'Macro Suggestion',
    body: 'Increase protein by 10g daily to hit your 150g target more consistently.',
    highlight: '+10g protein',
  },
  {
    title: 'Most Logged Food',
    body: 'Grilled chicken breast appears 12 times this month. Great protein source.',
    highlight: '12x logged',
  },
  {
    title: 'Food Quality Score',
    body: '85% of your meals are whole foods. Excellent food quality this week.',
    highlight: '85% quality',
  },
  {
    title: 'Weekend Drift',
    body: 'Weekend carbs rise noticeably. A simple pre-planned lunch could flatten the spike.',
    highlight: '+60g weekends',
  },
  {
    title: 'Workout Correlation',
    body: 'You log 20% more calories on workout days, which tracks well with increased activity.',
    highlight: '+20% on training days',
  },
]

export const weekData = [
  { day: 'Mon', date: 'Apr 13', calories: 1850, goal: 2000, onTarget: true },
  { day: 'Tue', date: 'Apr 14', calories: 1920, goal: 2000, onTarget: true },
  { day: 'Wed', date: 'Apr 15', calories: 1980, goal: 2000, onTarget: true },
  { day: 'Thu', date: 'Apr 16', calories: 2100, goal: 2000, onTarget: false },
  { day: 'Fri', date: 'Apr 17', calories: 1750, goal: 2000, onTarget: true },
  { day: 'Sat', date: 'Apr 18', calories: 1890, goal: 2000, onTarget: true },
  { day: 'Sun', date: 'Apr 19', calories: 1650, goal: 2000, onTarget: true },
]

export const weekStats = [
  { label: 'Avg Calories', thisWeek: 1877, lastWeek: 1945, unit: '' },
  { label: 'Total Protein', thisWeek: 840, lastWeek: 805, unit: 'g' },
  { label: 'Days on Target', thisWeek: 6, lastWeek: 5, unit: '' },
  { label: 'Best Day', thisWeek: 2100, lastWeek: 2050, unit: 'cal' },
  { label: 'Worst Day', thisWeek: 1650, lastWeek: 1720, unit: 'cal' },
]

export const mealTags = ['Breakfast', 'Lunch', 'Snack', 'Dinner']
export const timeRanges = ['7 Days', '30 Days', '90 Days']

export const dietModes = [
  { id: 'cutting', label: 'Cutting', description: 'Reduce body fat while preserving muscle' },
  { id: 'maintenance', label: 'Maintenance', description: 'Maintain current weight and composition' },
  { id: 'bulking', label: 'Bulking', description: 'Build muscle mass with controlled surplus' },
]
