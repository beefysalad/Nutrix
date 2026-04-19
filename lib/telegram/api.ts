import axios from 'axios'

const TELEGRAM_API_BASE_URL = 'https://api.telegram.org'

function getAxiosErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const detail =
      (typeof error.response?.data === 'string'
        ? error.response.data
        : error.response?.data?.description) || error.message

    return detail || fallback
  }

  return error instanceof Error ? error.message : fallback
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
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

type SendTelegramMessageInput = {
  chatId: string | number
  text: string
  disableWebPagePreview?: boolean
  parseMode?: 'HTML' | 'MarkdownV2'
}

export async function sendTelegramMessage({
  chatId,
  text,
  disableWebPagePreview = true,
  parseMode,
}: SendTelegramMessageInput) {
  try {
    const response = await createTelegramApi().post('/sendMessage', {
      chat_id: chatId,
      text,
      disable_web_page_preview: disableWebPagePreview,
      ...(parseMode ? { parse_mode: parseMode } : {}),
    })

    return response.data
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error, 'Telegram sendMessage failed'))
  }
}

export async function setTelegramWebhook(webhookUrl: string, secretToken?: string) {
  try {
    const response = await createTelegramApi().post('/setWebhook', {
      url: webhookUrl,
      secret_token: secretToken,
    })

    return response.data
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error, 'Telegram setWebhook failed'))
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
    const response = await createTelegramApi().get<TelegramWebhookInfo>('/getWebhookInfo')

    return response.data
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error, 'Telegram getWebhookInfo failed'))
  }
}
