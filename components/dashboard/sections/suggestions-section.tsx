'use client'

import type { SuggestionsSubview } from '@/components/dashboard/types'

import { GenerateSuggestionsSection } from './suggestions/generate-suggestions'
import { SavedSuggestionsSection } from './suggestions/saved-suggestions'

export function SuggestionsSection({
  initialView = 'generate',
}: {
  initialView?: SuggestionsSubview
}) {
  return initialView === 'saved' ? (
    <SavedSuggestionsSection />
  ) : (
    <GenerateSuggestionsSection />
  )
}
