'use client'

import { Loader2, PlusCircle } from 'lucide-react'
import { type useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { type useCreateMealMutation } from '@/lib/hooks/use-dashboard-api'
import { type ManualMealFormInput, type ManualMealFormValues } from '@/lib/validations/dashboard-forms'

export function ManualMealForm({
  manualForm,
  createMealMutation,
  handleManualSubmit,
}: {
  manualForm: ReturnType<typeof useForm<ManualMealFormInput, unknown, ManualMealFormValues>>
  createMealMutation: ReturnType<typeof useCreateMealMutation>
  handleManualSubmit: (values: ManualMealFormValues) => Promise<void>
}) {
  const isSaving = manualForm.formState.isSubmitting || createMealMutation.isPending

  return (
    <form onSubmit={manualForm.handleSubmit(handleManualSubmit)} className="space-y-4">
      <input
        type="text"
        placeholder="Food name"
        {...manualForm.register('foodName')}
        className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="number"
          placeholder="Calories"
          {...manualForm.register('calories')}
          className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 font-mono text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
        />
        <input
          type="number"
          placeholder="Protein (g)"
          {...manualForm.register('proteinGrams')}
          className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 font-mono text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
        />
        <input
          type="number"
          placeholder="Carbs (g)"
          {...manualForm.register('carbsGrams')}
          className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 font-mono text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
        />
        <input
          type="number"
          placeholder="Fat (g)"
          {...manualForm.register('fatGrams')}
          className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 font-mono text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
        />
      </div>
      <input
        type="text"
        placeholder="Portion eaten, e.g. 1 cup, 2 pieces, 100g"
        aria-label="Portion eaten"
        {...manualForm.register('servingSize')}
        className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
      />
      {manualForm.formState.errors.foodName || manualForm.formState.errors.calories ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
          {manualForm.formState.errors.foodName?.message ||
            manualForm.formState.errors.calories?.message}
        </div>
      ) : null}
      <Button
        type="submit"
        disabled={isSaving}
        className="flex w-full items-center justify-center gap-2 rounded-full"
      >
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
        {isSaving ? 'Saving' : 'Save manual meal'}
      </Button>
    </form>
  )
}
