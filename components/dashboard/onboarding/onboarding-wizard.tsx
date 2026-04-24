'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { useOnboardingMutation } from '@/lib/hooks/use-dashboard-api'
import { cn } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'
import {
  onboardingSchema,
  type OnboardingFormInput,
  type OnboardingFormValues,
} from '@/lib/validations/dashboard-forms'

import { OnboardingInput } from './components/onboarding-input'
import { OnboardingNav, OnboardingStepHeader } from './components/shared-ui'
import { activityOptions, featureOptions, genderOptions, goalOptions, type Step } from './components/types'

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
                <h1 className="font-mono text-4xl font-black tracking-tighter text-white uppercase lg:text-5xl">
                  NUTR<span className="text-[#e4ff00]">IX</span>
                </h1>
                <p className="mx-auto max-w-md text-lg text-[#888]">
                  Welcome to Nutrix. Let&apos;s calibrate your biology to
                  optimize your nutrition performance.
                </p>
              </div>
              <Button
                onClick={() => setStep(1)}
                size="lg"
                className="group mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-[#e4ff00] px-5 text-sm font-bold tracking-widest text-black uppercase transition-all hover:bg-[#f0ff4d]"
              >
                Start Onboarding
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
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
                  <label className="text-xs font-bold tracking-widest text-[#555] uppercase">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {genderOptions.map((g) => (
                      <Button
                        key={g}
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          setValue('gender', g as 'male' | 'female')
                        }
                        className={cn(
                          'h-auto w-full whitespace-normal rounded-xl border px-4 py-3 text-sm font-bold uppercase transition-all hover:bg-transparent',
                      selectedGender === g
                            ? 'border-[#e4ff00] bg-[#e4ff00] text-black'
                            : 'border-white/10 bg-[#0a0a0a] text-[#777] hover:border-white/20 hover:text-[#f1f1f1]'
                        )}
                      >
                        {g}
                      </Button>
                    ))}
                  </div>
                </div>

                <OnboardingInput
                  label="Age"
                  register={register('age')}
                  error={errors.age?.message}
                />
                <OnboardingInput
                  label="Weight (kg)"
                  register={register('weightKg')}
                  error={errors.weightKg?.message}
                />
                <OnboardingInput
                  label="Height (cm)"
                  register={register('heightCm')}
                  error={errors.heightCm?.message}
                />
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
                  <Button
                    key={act.id}
                    type="button"
                    variant="ghost"
                    onClick={() => setValue('activityLevel', act.id)}
                    className={cn(
                      'h-auto w-full justify-between whitespace-normal rounded-xl border px-4 py-3 text-left transition-all hover:bg-transparent',
                      selectedActivityLevel === act.id
                        ? 'border-[#e4ff00] bg-[#e4ff00]/5 text-[#e4ff00] hover:bg-[#e4ff00]/5 hover:text-[#e4ff00]'
                        : 'border-white/10 bg-[#0a0a0a] text-[#777] hover:border-white/20 hover:text-[#f1f1f1]'
                    )}
                  >
                    <div>
                      <div className="font-bold tracking-wide uppercase">
                        {act.label}
                      </div>
                      <div className="text-xs opacity-60">{act.desc}</div>
                    </div>
                    {selectedActivityLevel === act.id && (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#e4ff00]" />
                    )}
                  </Button>
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
                  <Button
                    key={g.id}
                    type="button"
                    variant="ghost"
                    onClick={() => setValue('goal', g.id)}
                    className={cn(
                      'h-auto w-full justify-between whitespace-normal rounded-xl border px-4 py-4 text-left transition-all hover:bg-transparent',
                      selectedGoal === g.id
                        ? 'border-[#e4ff00] bg-[#e4ff00]/5 text-[#e4ff00] hover:bg-[#e4ff00]/5 hover:text-[#e4ff00]'
                        : 'border-white/10 bg-[#0a0a0a] text-[#777] hover:border-white/20 hover:text-[#f1f1f1]'
                    )}
                  >
                    <div>
                      <div className="font-bold tracking-wider uppercase">
                        {g.label}
                      </div>
                      <div className="mt-1 text-sm opacity-60">{g.desc}</div>
                    </div>
                  </Button>
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
                    <div className="text-sm font-bold tracking-wider text-[#f5f5f5] uppercase">
                      {feature.label}
                    </div>
                    <div className="mt-1 text-sm leading-relaxed text-[#777]">
                      {feature.desc}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-[#e4ff00]/20 bg-[#e4ff00]/5 px-4 py-3 text-sm leading-relaxed text-[#cddf73]">
                Tip: use AI parsing for messy real-life meals, search for simple
                foods, and custom when you already know the numbers.
              </div>

              <OnboardingNav back={() => setStep(3)} next={() => setStep(5)} />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8">
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-black tracking-tighter text-white uppercase">
                  System Calibration
                </h2>
                <p className="text-[#888]">
                  Calculated daily targets based on your telemetry.
                </p>
              </div>

              <div className="text-center">
                <div className="text-xs font-bold tracking-widest text-[#e4ff00]/60 uppercase">
                  Daily Target{' '}
                </div>
                <div className="mt-2 font-mono text-6xl font-black text-[#e4ff00] lg:text-7xl">
                  {targetCalories}
                  <span className="ml-2 text-xl tracking-tighter uppercase opacity-50">
                    cal
                  </span>
                </div>
                <div className="mt-4 inline-flex rounded-full bg-[#e4ff00]/10 px-4 py-1.5 text-xs font-bold tracking-wider text-[#e4ff00] uppercase">
                  Objective: {selectedGoal.replace('-', ' ')}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-[10px] tracking-widest text-[#555] uppercase">
                    Protein
                  </div>
                  <div className="mt-1 font-mono text-xl font-bold text-white">
                    {Math.round((targetCalories * 0.3) / 4)}g
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] tracking-widest text-[#555] uppercase">
                    Carbs
                  </div>
                  <div className="mt-1 font-mono text-xl font-bold text-white">
                    {Math.round((targetCalories * 0.4) / 4)}g
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] tracking-widest text-[#555] uppercase">
                    Fat
                  </div>
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
