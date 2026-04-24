import { BrainCircuit, Loader2, Lock, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  mealTypeOptions,
  suggestionStyleOptions,
  type MealTypePreference,
  type SuggestionStyle,
} from './types'

export function PreferenceSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: ReadonlyArray<{ id: string; label: string }>
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
      <label className="text-[10px] font-black tracking-[0.2em] text-[#666] uppercase">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 min-w-40 rounded-full border-white/10 bg-[#0a0a0a] px-4 text-sm font-semibold text-[#f5f5f5] focus:border-[#e4ff00]/70 focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-[#141414] text-[#f5f5f5]">
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function PreferencesModal({
  selectedStyle,
  selectedMealType,
  onStyleChange,
  onMealTypeChange,
  onGenerate,
  canGenerate,
  isGenerating,
  remainingToday,
  usedToday,
  dailyLimit,
  onClose,
}: {
  selectedStyle: SuggestionStyle
  selectedMealType: MealTypePreference
  onStyleChange: (value: SuggestionStyle) => void
  onMealTypeChange: (value: MealTypePreference) => void
  onGenerate: () => void
  canGenerate: boolean
  isGenerating: boolean
  remainingToday: number
  usedToday: number
  dailyLimit: number
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/65 backdrop-blur-sm sm:items-center">
      <Button
        type="button"
        aria-label="Close preferences"
        variant="ghost"
        className="absolute inset-0 cursor-default hover:bg-transparent"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-t-[2rem] border border-white/10 bg-[#111111] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:rounded-[2rem] sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-[#f5f5f5]">
              Select preferences
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[#777]">
              Set the style and meal before generating.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/10 bg-[#151515] text-[#999] transition-colors hover:bg-[#151515] hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <PreferenceSelect
            label="Style"
            value={selectedStyle}
            onChange={(value) => onStyleChange(value as SuggestionStyle)}
            options={suggestionStyleOptions}
          />
          <PreferenceSelect
            label="Meal"
            value={selectedMealType}
            onChange={(value) => onMealTypeChange(value as MealTypePreference)}
            options={mealTypeOptions}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-3 text-sm text-[#888]">
          {remainingToday} left today / Used {usedToday} of {dailyLimit}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-[#0a0a0a] px-4 py-2 text-sm text-[#888] transition-colors hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || !canGenerate}
            className="flex items-center justify-center gap-2 rounded-full border border-[#e4ff00]/30 bg-[#e4ff00] px-4 py-2 text-sm font-bold text-[#0a0a0a] transition-colors hover:bg-[#efff4d] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-[#242424] disabled:text-[#777]"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : canGenerate ? (
              <BrainCircuit className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {canGenerate ? 'Generate Ideas' : 'Daily Limit Reached'}
          </Button>
        </div>
      </div>
    </div>
  )
}
