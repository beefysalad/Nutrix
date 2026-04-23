'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { type UseFormRegisterReturn, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { useOnboardingMutation } from '@/lib/hooks/use-dashboard-api'
import { cn } from '@/components/dashboard/ui'
import {
  onboardingSchema,
  type OnboardingFormInput,
  type OnboardingFormValues,
} from '@/lib/validations/dashboard-forms'

type Step = 0 | 1 | 2 | 3 | 4 | 5

const genderOptions = ['male', 'female'] as const
const activityOptions = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Minimal movement, office life' },
  { id: 'lightly-active', label: 'Lightly Active', desc: '1-3 days of exercise' },
  { id: 'moderately-active', label: 'Moderately Active', desc: '3-5 days of hard work' },
  { id: 'very-active', label: 'Very Active', desc: '6-7 days of intense training' },
  { id: 'extra-active', label: 'Extra Active', desc: 'Physical job & pro athlete' },
] as const
const goalOptions = [
  { id: 'lose-weight', label: 'Lose Weight', desc: 'Aggressive calorie deficit for fat loss' },
  { id: 'maintain-weight', label: 'Maintenance', desc: 'Optimize performance and vitality' },
  { id: 'gain-weight', label: 'Gain Muscle', desc: 'Calorie surplus geared for hypertrophy' },
] as const
const featureOptions = [
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

function OnboardingStepHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold uppercase tracking-tight text-white">{title}</h2>
      <p className="mt-1 text-[#666]">{description}</p>
    </div>
  )
}

function OnboardingNav({
  back,
  next,
  nextLabel = 'Next',
  disabled,
  loading,
}: {
  back: () => void
  next: () => void
  nextLabel?: string
  disabled?: boolean
  loading?: boolean
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={back}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-transparent text-[#777] transition-all hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={next}
        disabled={disabled || loading}
        className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#e4ff00] px-5 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-[#f0ff4d] disabled:opacity-30"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {nextLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </div>
  )
}

export function OnboardingWizard() {
  const [step, setStep] = useState<Step>(0)
  const onboardingMutation = useOnboardingMutation()

  const form = useForm<OnboardingFormInput, unknown, OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      gender: 'male',
      age: undefined,
      weightKg: undefined,
      heightCm: undefined,
      activityLevel: 'moderately-active',
      goal: 'maintain-weight',
    },
    mode: 'onChange',
  })

  const {
    control,
    setValue,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form
  const values = useWatch({ control })
  const age = values.age ? Number(values.age) : 0
  const weightKg = values.weightKg ? Number(values.weightKg) : 0
  const heightCm = values.heightCm ? Number(values.heightCm) : 0
  const selectedGender = values.gender ?? 'male'
  const selectedActivityLevel = values.activityLevel ?? 'moderately-active'
  const selectedGoal = values.goal ?? 'maintain-weight'

  const onSubmit = async (data: OnboardingFormValues) => {
    try {
      await onboardingMutation.mutateAsync(data)
      toast.success('Welcome to Nutrix! Your profile is ready.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  const tdee = (() => {
    if (!weightKg || !heightCm || !age) return 0
    const bmr =
      10 * weightKg +
      6.25 * heightCm -
      5 * age +
      (selectedGender === 'male' ? 5 : -161)
    const multipliers = {
      sedentary: 1.2,
      'lightly-active': 1.375,
      'moderately-active': 1.55,
      'very-active': 1.725,
      'extra-active': 1.9,
    }
    return Math.round(bmr * multipliers[selectedActivityLevel])
  })()

  const targetCalories = (() => {
    if (selectedGoal === 'lose-weight') return tdee - 500
    if (selectedGoal === 'gain-weight') return tdee + 300
    return tdee
  })()

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-[#0a0a0a] px-5 py-8">
      <div className="w-full max-w-2xl">
        <div className="mx-auto mb-8 h-1 w-full max-w-sm overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-[#e4ff00] transition-all duration-500 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        <div>
          {step === 0 && (
            <div className="space-y-8 py-4 text-center">
              <div className="space-y-4">
                <h1 className="font-mono text-4xl font-black uppercase tracking-tighter text-white lg:text-5xl">
                  NUTR<span className="text-[#e4ff00]">IX</span>
                </h1>
                <p className="mx-auto max-w-md text-lg text-[#888]">
                  Welcome to Nutrix. Let&apos;s calibrate your biology to optimize your nutrition
                  performance.
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="group mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-[#e4ff00] px-5 py-3 text-sm font-bold uppercase tracking-widest text-black transition-all hover:bg-[#f0ff4d]"
              >
               Start Onboarding
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <OnboardingStepHeader
                title="Biological Profile"
                description="Essential telemetry for BMR calculation."
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#555]">Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    {genderOptions.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setValue('gender', g as 'male' | 'female')}
                        className={cn(
                          'rounded-xl border px-4 py-3 text-sm font-bold uppercase transition-all',
                          selectedGender === g
                            ? 'border-[#e4ff00] bg-[#e4ff00] text-black'
                            : 'border-white/10 bg-[#0a0a0a] text-[#555] hover:border-white/20'
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <OnboardingInput label="Age" register={register('age')} error={errors.age?.message} />
                <OnboardingInput label="Weight (kg)" register={register('weightKg')} error={errors.weightKg?.message} />
                <OnboardingInput label="Height (cm)" register={register('heightCm')} error={errors.heightCm?.message} />
              </div>

              <OnboardingNav
                back={() => setStep(0)}
                next={() => setStep(2)}
                disabled={!age || !weightKg || !heightCm}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <OnboardingStepHeader
                title="Active Duty"
                description="How much energy do you expend daily?"
              />

              <div className="grid gap-3">
                {activityOptions.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setValue('activityLevel', act.id)}
                    className={cn(
                      'flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all',
                      selectedActivityLevel === act.id
                        ? 'border-[#e4ff00] bg-[#e4ff00]/5 text-[#e4ff00]'
                        : 'border-white/10 bg-[#0a0a0a] text-[#555] hover:border-white/20'
                    )}
                  >
                    <div>
                      <div className="font-bold uppercase tracking-wide">{act.label}</div>
                      <div className="text-xs opacity-60">{act.desc}</div>
                    </div>
                    {selectedActivityLevel === act.id && (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#e4ff00]" />
                    )}
                  </button>
                ))}
              </div>

              <OnboardingNav back={() => setStep(1)} next={() => setStep(3)} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <OnboardingStepHeader
                title="Primary Objective"
                description="What's your focus for the next cycle?"
              />

              <div className="grid gap-4">
                {goalOptions.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setValue('goal', g.id)}
                    className={cn(
                      'flex items-center justify-between rounded-xl border px-4 py-4 text-left transition-all',
                      selectedGoal === g.id
                        ? 'border-[#e4ff00] bg-[#e4ff00]/5 text-[#e4ff00]'
                        : 'border-white/10 bg-[#0a0a0a] text-[#555] hover:border-white/20'
                    )}
                  >
                    <div>
                      <div className="font-bold uppercase tracking-wider">{g.label}</div>
                      <div className="mt-1 text-sm opacity-60">{g.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <OnboardingNav back={() => setStep(2)} next={() => setStep(4)} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <OnboardingStepHeader
                title="How You'll Log"
                description="After setup, you can choose the fastest way for each meal."
              />

              <div className="grid gap-3 sm:grid-cols-2">
                {featureOptions.map((feature) => (
                  <div
                    key={feature.label}
                    className="rounded-xl border border-white/10 bg-transparent px-4 py-3"
                  >
                    <div className="text-sm font-bold uppercase tracking-wider text-[#f5f5f5]">
                      {feature.label}
                    </div>
                    <div className="mt-1 text-sm leading-relaxed text-[#777]">
                      {feature.desc}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-[#e4ff00]/20 bg-[#e4ff00]/5 px-4 py-3 text-sm leading-relaxed text-[#cddf73]">
                Tip: use AI parsing for messy real-life meals, search for simple foods,
                and custom when you already know the numbers.
              </div>

              <OnboardingNav back={() => setStep(3)} next={() => setStep(5)} />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">System Calibration</h2>
                <p className="text-[#888]">Calculated daily targets based on your telemetry.</p>
              </div>

              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-[#e4ff00]/60">Daily Target </div>
                <div className="mt-2 font-mono text-6xl font-black text-[#e4ff00] lg:text-7xl">
                  {targetCalories}
                  <span className="text-xl ml-2 opacity-50 uppercase tracking-tighter">cal</span>
                </div>
                <div className="mt-4 inline-flex rounded-full bg-[#e4ff00]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#e4ff00]">
                  Objective: {selectedGoal.replace('-', ' ')}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-widest text-[#555]">Protein</div>
                  <div className="mt-1 font-mono text-xl font-bold text-white">
                    {Math.round((targetCalories * 0.3) / 4)}g
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-widest text-[#555]">Carbs</div>
                  <div className="mt-1 font-mono text-xl font-bold text-white">
                    {Math.round((targetCalories * 0.4) / 4)}g
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-widest text-[#555]">Fat</div>
                  <div className="mt-1 font-mono text-xl font-bold text-white">
                    {Math.round((targetCalories * 0.3) / 9)}g
                  </div>
                </div>
              </div>

              <OnboardingNav
                back={() => setStep(4)}
                next={handleSubmit(onSubmit)}
                nextLabel="Confirm"
                loading={isSubmitting}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function OnboardingInput({
  label,
  register,
  error,
}: {
  label: string
  register: UseFormRegisterReturn
  error?: string
}) {
  const isWeightField = label.toLowerCase().includes('weight')

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-[#555]">{label}</label>
      <input
        {...register}
        type="number"
        step={isWeightField ? '0.1' : '1'}
        min="0"
        className={cn(
          'w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 font-mono text-white outline-none transition-all focus:border-[#e4ff00]',
          error && 'border-red-500/50 text-red-100'
        )}
      />
      {error && <div className="text-[10px] text-red-400 uppercase tracking-tighter">{error}</div>}
    </div>
  )
}
