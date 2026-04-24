'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { cn } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getApiErrorMessage,
  type usePreferencesQuery,
  type useSavePreferencesMutation,
} from '@/lib/hooks/use-dashboard-api'
import {
  settingsFormSchema,
  type SettingsFormValues,
} from '@/lib/validations/dashboard-forms'

export function PreferencesSettings({
  preferencesQuery,
  savePreferencesMutation,
}: {
  preferencesQuery: ReturnType<typeof usePreferencesQuery>
  savePreferencesMutation: ReturnType<typeof useSavePreferencesMutation>
}) {
  const {
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      unitSystem: 'metric',
      aiModel: 'gemini-2.5-flash-lite',
      language: 'English',
    },
  })

  const selectedUnitSystem = useWatch({ control, name: 'unitSystem' })
  const selectedAiModel = useWatch({ control, name: 'aiModel' })
  const selectedLanguage = useWatch({ control, name: 'language' })

  useEffect(() => {
    if (!preferencesQuery.data?.preferences) {
      return
    }

    reset({
      unitSystem: preferencesQuery.data.preferences.unitSystem,
      aiModel: preferencesQuery.data.preferences.aiModel,
      language: 'English',
    })
  }, [preferencesQuery.data, reset])

  async function onSubmit(values: SettingsFormValues) {
    try {
      const response = await savePreferencesMutation.mutateAsync({
        unitSystem: values.unitSystem,
        aiModel: values.aiModel,
      })

      if (response.preferences.aiModelPersistencePendingMigration) {
        toast.warning(
          'Preferences saved, but AI model persistence is waiting on the DB migration'
        )
        return
      }

      toast.success('Preferences saved')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not save preferences'))
    }
  }

  return (
    <div>
      <h3 className="mb-4 text-lg text-[#f5f5f5]">Preferences</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[#f5f5f5]">Units</div>
              <div className="mt-1 text-sm text-[#777]">
                Metric or imperial measurements
              </div>
            </div>
            <div className="flex gap-2">
              {(['metric', 'imperial'] as const).map((unit) => (
                <Button
                  key={unit}
                  type="button"
                  onClick={() =>
                    setValue('unitSystem', unit, { shouldDirty: true })
                  }
                  className={cn(
                    'rounded-xl border px-5 py-2.5 text-sm transition-colors',
                    selectedUnitSystem === unit
                      ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a] hover:bg-[#f0ff4d]'
                      : 'border-white/10 bg-[#141414] text-[#888] hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]'
                  )}
                  disabled={preferencesQuery.isLoading || isSubmitting}
                >
                  {unit[0].toUpperCase() + unit.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[#f5f5f5]">AI Model</div>
              <div className="mt-1 text-sm text-[#777]">
                Choose the Gemini model used for AI meal parsing.
              </div>
            </div>
            <Select
              value={selectedAiModel}
              onValueChange={(value) =>
                setValue('aiModel', value as SettingsFormValues['aiModel'], {
                  shouldDirty: true,
                })
              }
              disabled={preferencesQuery.isLoading || isSubmitting}
            >
              <SelectTrigger className="h-12 w-full rounded-xl border-white/10 bg-[#141414] px-4 py-3 text-[#f5f5f5] focus:border-[#e4ff00] focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#141414] text-[#f5f5f5]">
                <SelectItem value="gemini-2.5-flash-lite">
                  Gemini 2.5 Flash-Lite
                </SelectItem>
                <SelectItem value="gemini-2.5-flash">
                  Gemini 2.5 Flash
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-6 flex flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[#f5f5f5]">Language</div>
              <div className="mt-1 text-sm text-[#777]">Interface language</div>
            </div>
            <Select
              value={selectedLanguage}
              onValueChange={(value) =>
                setValue('language', value as SettingsFormValues['language'], {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger className="h-12 w-full rounded-xl border-white/10 bg-[#141414] px-4 py-3 text-[#f5f5f5] focus:border-[#e4ff00] focus:ring-0 md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#141414] text-[#f5f5f5]">
                <SelectItem value="English">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {errors.aiModel || errors.unitSystem || errors.language ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
            {errors.aiModel?.message ||
              errors.unitSystem?.message ||
              errors.language?.message}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={
            preferencesQuery.isLoading ||
            isSubmitting ||
            savePreferencesMutation.isPending
          }
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting || savePreferencesMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {preferencesQuery.isLoading
            ? 'Loading Preferences'
            : isSubmitting || savePreferencesMutation.isPending
              ? 'Saving Preferences'
              : 'Save Preferences'}
        </Button>
      </form>
    </div>
  )
}
