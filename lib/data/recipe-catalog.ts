export type SuggestionStyle = 'quick' | 'lutong-bahay' | 'budget' | 'high-protein'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'

export type RecipeCatalogItem = {
  id: string
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  fat: number
  tags: string[]
  prepTime: string
  difficulty: 'easy' | 'medium'
  mealTypes: MealType[]
  styles: SuggestionStyle[]
  sourceLabel: string
  sourceUrl: string
}

export const recipeCatalog: RecipeCatalogItem[] = [
  {
    id: 'tortang-talong-panlasang-pinoy',
    name: 'Tortang Talong',
    description: 'A simple eggplant omelet that works well for a quick Filipino breakfast or light lunch.',
    calories: 240,
    protein: 10,
    carbs: 12,
    fat: 16,
    tags: ['Vegetable', 'Quick', 'Budget'],
    prepTime: '25 mins',
    difficulty: 'easy',
    mealTypes: ['breakfast', 'lunch'],
    styles: ['quick', 'budget', 'lutong-bahay'],
    sourceLabel: 'Panlasang Pinoy',
    sourceUrl: 'https://panlasangpinoy.com/basic-tortang-talong-recipe/',
  },
  {
    id: 'sinangag-kawaling-pinoy',
    name: 'Sinangag',
    description: 'Classic Filipino garlic fried rice that is easy to pair with eggs or leftover ulam.',
    calories: 330,
    protein: 6,
    carbs: 54,
    fat: 9,
    tags: ['Rice', 'Quick', 'Budget'],
    prepTime: '25 mins',
    difficulty: 'easy',
    mealTypes: ['breakfast'],
    styles: ['quick', 'budget'],
    sourceLabel: 'Kawaling Pinoy',
    sourceUrl: 'https://www.kawalingpinoy.com/sinangag/',
  },
  {
    id: 'tinapa-fried-rice-kawaling-pinoy',
    name: 'Tinapa Fried Rice',
    description: 'Smoky fried rice with tinapa for a savory breakfast that still feels practical at home.',
    calories: 420,
    protein: 18,
    carbs: 46,
    fat: 17,
    tags: ['Seafood', 'Rice', 'Quick'],
    prepTime: '30 mins',
    difficulty: 'easy',
    mealTypes: ['breakfast', 'lunch'],
    styles: ['quick', 'budget', 'lutong-bahay'],
    sourceLabel: 'Kawaling Pinoy',
    sourceUrl: 'https://www.kawalingpinoy.com/tinapa-fried-rice/',
  },
  {
    id: 'pork-monggo-panlasang-pinoy',
    name: 'Pork Monggo',
    description: 'A hearty mung bean dish that is affordable, filling, and familiar for everyday lunches.',
    calories: 410,
    protein: 24,
    carbs: 33,
    fat: 19,
    tags: ['Budget', 'Lutong Bahay', 'Beans'],
    prepTime: '50 mins',
    difficulty: 'easy',
    mealTypes: ['lunch', 'dinner'],
    styles: ['budget', 'lutong-bahay', 'high-protein'],
    sourceLabel: 'Panlasang Pinoy',
    sourceUrl: 'https://panlasangpinoy.com/pork-monggo-chicharon-malunggay-recipe/',
  },
  {
    id: 'tinolang-manok-kawaling-pinoy',
    name: 'Tinolang Manok',
    description: 'A light but comforting chicken soup with broth, papaya, and greens.',
    calories: 513,
    protein: 39,
    carbs: 16,
    fat: 33,
    tags: ['Soup', 'High Protein', 'Lutong Bahay'],
    prepTime: '1 hr 5 mins',
    difficulty: 'easy',
    mealTypes: ['lunch', 'dinner'],
    styles: ['lutong-bahay', 'high-protein'],
    sourceLabel: 'Kawaling Pinoy',
    sourceUrl: 'https://www.kawalingpinoy.com/tinolang-manok-chicken-tinola/',
  },
  {
    id: 'sizzling-tofu-kawaling-pinoy',
    name: 'Sizzling Tofu',
    description: 'A flavorful tofu-based sisig-style dish that is easier to cook than traditional sisig.',
    calories: 219,
    protein: 14,
    carbs: 9,
    fat: 15,
    tags: ['Tofu', 'Vegetarian', 'Quick'],
    prepTime: '30 mins',
    difficulty: 'easy',
    mealTypes: ['lunch', 'dinner'],
    styles: ['quick', 'budget', 'high-protein'],
    sourceLabel: 'Kawaling Pinoy',
    sourceUrl: 'https://www.kawalingpinoy.com/sizzling-tofu/',
  },
  {
    id: 'chicken-inasal-panlasang-pinoy',
    name: 'Chicken Inasal',
    description: 'A grilled Filipino chicken dish with a more involved marinade but strong protein value.',
    calories: 480,
    protein: 38,
    carbs: 6,
    fat: 31,
    tags: ['Chicken', 'Grilled', 'High Protein'],
    prepTime: '1 hr 20 mins',
    difficulty: 'medium',
    mealTypes: ['lunch', 'dinner'],
    styles: ['lutong-bahay', 'high-protein'],
    sourceLabel: 'Panlasang Pinoy',
    sourceUrl: 'https://panlasangpinoy.com/grilled-chicken-inasal-recipe/',
  },
]
