import axios from 'axios'

const TELEGRAM_API_BASE_URL = 'https://api.telegram.org'
const TELEGRAM_API_TIMEOUT_MS = 30_000
const TELEGRAM_API_RETRY_DELAYS_MS = [750, 1_500] as const

function getAxiosErrorDetails(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const detail =
      (typeof error.response?.data === 'string'
        ? error.response.data
        : error.response?.data?.description) || error.message

    return {
      message: detail || fallback,
      code: error.code ?? 'UNKNOWN',
      status: error.response?.status ?? null,
      method: error.config?.method?.toUpperCase() ?? null,
      url: error.config?.url ?? null,
      baseURL: error.config?.baseURL ?? null,
    }
  }

  return {
    message: error instanceof Error ? error.message : fallback,
    code: null,
    status: null,
    method: null,
    url: null,
    baseURL: null,
  }
}

function getTelegramBotToken() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured.')
  }

  return botToken
}

function createTelegramApi() {
  return axios.create({
    baseURL: `${TELEGRAM_API_BASE_URL}/bot${getTelegramBotToken()}`,
    timeout: TELEGRAM_API_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

let telegramApi: ReturnType<typeof createTelegramApi> | null = null

function getTelegramApi() {
  if (!telegramApi) {
    telegramApi = createTelegramApi()
  }

  return telegramApi
}

function logTelegramApiError(action: string, error: unknown) {
  const details = getAxiosErrorDetails(error, `Telegram ${action} failed`)

  console.error(`Telegram ${action} failed`, details)

  return details
}

function shouldRetryTelegramError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return false
  }

  return (
    error.code === 'ECONNABORTED' ||
    error.code === 'ETIMEDOUT' ||
    error.code === 'ECONNRESET' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'EAI_AGAIN' ||
    error.response?.status === 429 ||
    (error.response?.status != null && error.response.status >= 500)
  )
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withTelegramRetries<T>(action: string, run: () => Promise<T>) {
  let lastError: unknown

  for (let attempt = 0; attempt <= TELEGRAM_API_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await run()
    } catch (error) {
      lastError = error

      if (!shouldRetryTelegramError(error) || attempt === TELEGRAM_API_RETRY_DELAYS_MS.length) {
        const details = logTelegramApiError(action, error)
        throw new Error(details.message)
      }

      await sleep(TELEGRAM_API_RETRY_DELAYS_MS[attempt])
    }
  }

  const details = logTelegramApiError(action, lastError)
  throw new Error(details.message)
}

type SendTelegramMessageInput = {
  chatId: string | number
  text: string
  disableWebPagePreview?: boolean
  parseMode?: 'HTML' | 'MarkdownV2'
  replyMarkup?: Record<string, unknown>
}

export async function sendTelegramMessage({
  chatId,
  text,
  disableWebPagePreview = true,
  parseMode,
  replyMarkup,
}: SendTelegramMessageInput) {
  const response = await withTelegramRetries('sendMessage', () =>
    getTelegramApi().post('/sendMessage', {
      chat_id: chatId,
      text,
      disable_web_page_preview: disableWebPagePreview,
      ...(parseMode ? { parse_mode: parseMode } : {}),
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    }),
  )

  return response.data
}

export async function setTelegramWebhook(webhookUrl: string, secretToken?: string) {
  const response = await withTelegramRetries('setWebhook', () =>
    getTelegramApi().post('/setWebhook', {
      url: webhookUrl,
      secret_token: secretToken,
    }),
  )

  return response.data
}

type TelegramWebhookInfo = {
  ok: boolean
  result: {
    url: string
    pending_update_count: number
    last_error_message?: string
  }
}

export async function getTelegramWebhookInfo() {
  const response = await withTelegramRetries('getWebhookInfo', () =>
    getTelegramApi().get<TelegramWebhookInfo>('/getWebhookInfo'),
  )

  return response.data
}
