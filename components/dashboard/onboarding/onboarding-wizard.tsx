'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Target,
  User,
  Zap,
} from 'lucide-react'
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

type Step = 0 | 1 | 2 | 3 | 4

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0a0a] p-4 lg:p-8">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#111111] shadow-2xl">
        {/* Progress Bar */}
        <div className="absolute left-0 top-0 h-1.5 w-full bg-white/5">
          <div
            className="h-full bg-[#e4ff00] transition-all duration-500 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-8 lg:p-12">
          {step === 0 && (
            <div className="space-y-8 py-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#e4ff00] text-black shadow-[0_0_30px_rgba(228,255,0,0.3)]">
                <Zap className="h-10 w-10" />
              </div>
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
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-[#e4ff00] py-5 font-bold uppercase tracking-widest text-black transition-all hover:bg-[#f0ff4d]"
              >
               Start Onboarding
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e4ff00]/10 text-[#e4ff00]">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Biological Profile</h2>
                  <p className="text-[#666]">Essential telemetry for BMR calculation.</p>
                </div>
              </div>

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
                          'rounded-2xl border px-4 py-4 text-sm font-bold uppercase transition-all',
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

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a0a] text-[#555] transition-all hover:text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!age || !weightKg || !heightCm}
                  className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#e4ff00] font-bold uppercase tracking-widest text-black transition-all hover:bg-[#f0ff4d] disabled:opacity-30"
                >
                 Next
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e4ff00]/10 text-[#e4ff00]">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Active Duty</h2>
                  <p className="text-[#666]">How much energy do you expend daily?</p>
                </div>
              </div>

              <div className="grid gap-3">
                {activityOptions.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setValue('activityLevel', act.id)}
                    className={cn(
                      'flex items-center justify-between rounded-2xl border px-6 py-5 text-left transition-all',
                      selectedActivityLevel === act.id
                        ? 'border-[#e4ff00] bg-[#e4ff00]/5 text-[#e4ff00]'
                        : 'border-white/10 bg-[#0a0a0a] text-[#555] hover:border-white/20'
                    )}
                  >
                    <div>
                      <div className="font-bold uppercase tracking-wide">{act.label}</div>
                      <div className="text-xs opacity-60">{act.desc}</div>
                    </div>
                    {selectedActivityLevel === act.id && <Zap className="h-5 w-5 animate-pulse" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a0a] text-[#555] transition-all hover:text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#e4ff00] font-bold uppercase tracking-widest text-black transition-all hover:bg-[#f0ff4d]"
                >
                  Next
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e4ff00]/10 text-[#e4ff00]">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Primary Objective</h2>
                  <p className="text-[#666]">What&apos;s your focus for the next cycle?</p>
                </div>
              </div>

              <div className="grid gap-4">
                {goalOptions.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setValue('goal', g.id)}
                    className={cn(
                      'flex items-center justify-between rounded-2xl border px-6 py-6 text-left transition-all',
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

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a0a] text-[#555] transition-all hover:text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#e4ff00] font-bold uppercase tracking-widest text-black transition-all hover:bg-[#f0ff4d]"
                >
                 Next
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">System Calibration</h2>
                <p className="text-[#888]">Calculated daily targets based on your telemetry.</p>
              </div>

              <div className="rounded-[2rem] border border-[#e4ff00]/20 bg-[#e4ff00]/5 p-8 text-center ring-1 ring-[#e4ff00]/10">
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
                <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-4 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-[#555]">Protein</div>
                  <div className="mt-1 font-mono text-xl font-bold text-white">
                    {Math.round((targetCalories * 0.3) / 4)}g
                  </div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-4 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-[#555]">Carbs</div>
                  <div className="mt-1 font-mono text-xl font-bold text-white">
                    {Math.round((targetCalories * 0.4) / 4)}g
                  </div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-4 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-[#555]">Fat</div>
                  <div className="mt-1 font-mono text-xl font-bold text-white">
                    {Math.round((targetCalories * 0.3) / 9)}g
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a0a] text-[#555] transition-all hover:text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#e4ff00] font-bold uppercase tracking-widest text-black transition-all hover:bg-[#f0ff4d] disabled:opacity-30"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      Confirm & Start
                      <ChevronRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
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
          'w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-6 py-4 font-mono text-white outline-none transition-all focus:border-[#e4ff00]',
          error && 'border-red-500/50 text-red-100'
        )}
      />
      {error && <div className="text-[10px] text-red-400 uppercase tracking-tighter">{error}</div>}
    </div>
  )
}
