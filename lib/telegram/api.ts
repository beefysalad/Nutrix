import axios from 'axios'

const TELEGRAM_API_BASE_URL = 'https://api.telegram.org'
const TELEGRAM_API_TIMEOUT_MS = 30_000

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

const telegramApi = createTelegramApi()

function logTelegramApiError(action: string, error: unknown) {
  const details = getAxiosErrorDetails(error, `Telegram ${action} failed`)

  console.error(`Telegram ${action} failed`, details)

  return details
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
  try {
    const response = await telegramApi.post('/sendMessage', {
      chat_id: chatId,
      text,
      disable_web_page_preview: disableWebPagePreview,
      ...(parseMode ? { parse_mode: parseMode } : {}),
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    })

    return response.data
  } catch (error) {
    const details = logTelegramApiError('sendMessage', error)
    throw new Error(details.message)
  }
}

export async function setTelegramWebhook(webhookUrl: string, secretToken?: string) {
  try {
    const response = await telegramApi.post('/setWebhook', {
      url: webhookUrl,
      secret_token: secretToken,
    })

    return response.data
  } catch (error) {
    const details = logTelegramApiError('setWebhook', error)
    throw new Error(details.message)
  }
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
  try {
    const response = await telegramApi.get<TelegramWebhookInfo>('/getWebhookInfo')

    return response.data
  } catch (error) {
    const details = logTelegramApiError('getWebhookInfo', error)
    throw new Error(details.message)
  }
}
