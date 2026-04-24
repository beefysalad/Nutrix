'use client'

import {
  useExportDataMutation,
  usePreferencesQuery,
  useSavePreferencesMutation,
  useTelegramIntegrationQuery,
} from '@/lib/hooks/use-dashboard-api'

import { AccountSettings } from './settings/account-settings'
import { DataExportSettings } from './settings/data-export-settings'
import { PreferencesSettings } from './settings/preferences-settings'
import { TelegramIntegrationSettings } from './settings/telegram-integration-settings'

export function SettingsSection() {
  const preferencesQuery = usePreferencesQuery()
  const telegramQuery = useTelegramIntegrationQuery()
  const savePreferencesMutation = useSavePreferencesMutation()
  const exportDataMutation = useExportDataMutation()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="mb-2 text-2xl text-[#f5f5f5]">Settings</h2>
        <p className="text-sm text-[#777]">
          Manage your account and preferences
        </p>
      </div>

      <AccountSettings />
      <TelegramIntegrationSettings telegramQuery={telegramQuery} />
      <PreferencesSettings
        preferencesQuery={preferencesQuery}
        savePreferencesMutation={savePreferencesMutation}
      />
      <DataExportSettings exportDataMutation={exportDataMutation} />
    </div>
  )
}
