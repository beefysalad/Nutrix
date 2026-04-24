import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mealTags, formatMealType, type MealType } from './types'

export function MealTypeSelect({
  value,
  onChange,
}: {
  value: MealType
  onChange: (value: MealType) => void
}) {
  return (
    <div className="w-full sm:w-48">
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#666]">
        Meal
      </label>
      <Select value={value} onValueChange={(nextValue) => onChange(nextValue as MealType)}>
        <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-[#0a0a0a] text-[#f5f5f5]">
          <SelectValue placeholder="Choose meal" />
        </SelectTrigger>
        <SelectContent>
          {mealTags.map((mealType) => (
            <SelectItem key={mealType} value={mealType}>
              {formatMealType(mealType)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
