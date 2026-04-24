import { preferenceRepository } from '@/lib/repositories/preference-repository'

export const preferenceService = {
  async getPreferences(userId: string) {
    try {
      const profile = await preferenceRepository.findProfile(userId, true)

      return {
        unitSystem: profile?.unitSystem ?? 'metric',
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        aiModel: (profile as any)?.aiModel ?? 'gemini-2.5-flash-lite',
      }
    } catch (error) {
      if (!preferenceRepository.isMissingAiModelColumn(error)) {
        throw error
      }

      const profile = await preferenceRepository.findProfile(userId, false)

      return {
        unitSystem: profile?.unitSystem ?? 'metric',
        aiModel: 'gemini-2.5-flash-lite',
        aiModelPersistencePendingMigration: true,
      }
    }
  },

  async updatePreferences(
    userId: string,
    data: { unitSystem?: string; aiModel?: string }
  ) {
    try {
      const profile = await preferenceRepository.upsertProfile(
        userId,
        data,
        true
      )

      return profile
    } catch (error) {
      if (!preferenceRepository.isMissingAiModelColumn(error)) {
        throw error
      }

      const profile = await preferenceRepository.upsertProfile(
        userId,
        data,
        false
      )

      return {
        unitSystem: profile.unitSystem,
        aiModel: data.aiModel ?? 'gemini-2.5-flash-lite',
        aiModelPersistencePendingMigration: true,
      }
    }
  },
}
