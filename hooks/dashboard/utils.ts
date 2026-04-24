import { AxiosError } from 'axios'

export const AI_GENERATION_TIMEOUT_MS = 60000

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.details ||
      error.response?.data?.error ||
      error.message ||
      fallback
    )
  }

  return error instanceof Error ? error.message : fallback
}
