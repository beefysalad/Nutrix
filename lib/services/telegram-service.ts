import { EntrySource, IntegrationProvider, IntegrationStatus, MealType } from '@/app/generated/prisma/client'

import prisma from '@/lib/prisma'
import { mealAiService } from '@/lib/services/meal-ai-service'
import { pendingLinkService } from '@/lib/services/pending-link-service'
import { sendTelegramMessage } from '@/lib/telegram/api'

type TelegramMessage = {
  chat?: {
    id?: number
    type?: string
  }
  from?: {
    id?: number
    username?: string
    first_name?: string
    last_name?: string
  }
  text?: string
}

function extractStartToken(text?: string) {
  if (!text) {
    return null
  }

  const [command, token] = text.trim().split(/\s+/, 2)

  if (command !== '/start' || !token) {
    return null
  }

  return token
}

function getCommand(text?: string) {
  if (!text) {
    return null
  }

  const [command] = text.trim().split(/\s+/, 1)
  return command ?? null
}

function getDisplayName(message: TelegramMessage) {
  const fullName = [message.from?.first_name, message.from?.last_name]
    .filter(Boolean)
    .join(' ')

  return message.from?.username || fullName || 'there'
}

async function findTelegramConnection(telegramUserId: string) {
  return prisma.integrationConnection.findFirst({
    where: {
      provider: IntegrationProvider.telegram,
      externalUserId: telegramUserId,
      status: IntegrationStatus.connected,
    },
    include: {
      user: true,
    },
  })
}

async function handleStartCommand(message: TelegramMessage) {
  const chatId = message.chat?.id
  const telegramUserId = message.from?.id
  const token = extractStartToken(message.text)

  if (!chatId || !telegramUserId) {
    return
  }

  if (!token) {
    await sendTelegramMessage({
      chatId,
      text: 'Welcome to Nutrix. Open the dashboard and click "Connect Telegram" to link this chat.',
    })
    return
  }

  const pendingLink = await pendingLinkService.consumeLinkToken(token, IntegrationProvider.telegram)

  if (!pendingLink) {
    await sendTelegramMessage({
      chatId,
      text: 'That link token is invalid or expired. Return to Nutrix and click "Connect Telegram" again.',
    })
    return
  }

  await prisma.integrationConnection.upsert({
    where: {
      userId_provider: {
        userId: pendingLink.userId,
        provider: IntegrationProvider.telegram,
      },
    },
    update: {
      status: IntegrationStatus.connected,
      externalUserId: String(telegramUserId),
      username: message.from?.username ?? null,
      connectedAt: new Date(),
      metadata: {
        chatId: String(chatId),
        chatType: message.chat?.type ?? null,
        firstName: message.from?.first_name ?? null,
        lastName: message.from?.last_name ?? null,
        linkedVia: 'telegram-start',
      },
    },
    create: {
      userId: pendingLink.userId,
      provider: IntegrationProvider.telegram,
      status: IntegrationStatus.connected,
      externalUserId: String(telegramUserId),
      username: message.from?.username ?? null,
      connectedAt: new Date(),
      metadata: {
        chatId: String(chatId),
        chatType: message.chat?.type ?? null,
        firstName: message.from?.first_name ?? null,
        lastName: message.from?.last_name ?? null,
        linkedVia: 'telegram-start',
      },
    },
  })

  await sendTelegramMessage({
    chatId,
    text: 'Telegram connected successfully. You can now send meal text here and Nutrix will log it for you.',
  })
}

async function handleHelpCommand(message: TelegramMessage) {
  const chatId = message.chat?.id

  if (!chatId) {
    return
  }

  await sendTelegramMessage({
    chatId,
    text: [
      'Nutrix Telegram commands:',
      '/start - Start or complete account linking',
      '/help - Show available commands',
      '/whoami - Show the linked Nutrix account for this Telegram user',
      '/status - Show Telegram connection status',
      'Or just send a meal like: 2 eggs, toast, iced coffee',
    ].join('\n'),
  })
}

async function handleWhoAmICommand(message: TelegramMessage) {
  const chatId = message.chat?.id
  const telegramUserId = message.from?.id

  if (!chatId || !telegramUserId) {
    return
  }

  const connection = await findTelegramConnection(String(telegramUserId))

  if (!connection) {
    await sendTelegramMessage({
      chatId,
      text: 'This Telegram account is not linked yet. Open Nutrix and click "Connect Telegram" first.',
    })
    return
  }

  await sendTelegramMessage({
    chatId,
    text: [
      `Linked Telegram account: ${connection.username ? `@${connection.username}` : getDisplayName(message)}`,
      `Nutrix user: ${connection.user.email}`,
    ].join('\n'),
  })
}

async function handleStatusCommand(message: TelegramMessage) {
  const chatId = message.chat?.id
  const telegramUserId = message.from?.id

  if (!chatId || !telegramUserId) {
    return
  }

  const connection = await findTelegramConnection(String(telegramUserId))

  if (!connection) {
    await sendTelegramMessage({
      chatId,
      text: 'No Nutrix link found for this Telegram account. Use the dashboard to connect Telegram first.',
    })
    return
  }

  await sendTelegramMessage({
    chatId,
    text: [
      'Nutrix integration status:',
      'Telegram: connected',
      `Account: ${connection.user.email}`,
    ].join('\n'),
  })
}

async function handleMealMessage(message: TelegramMessage) {
  const chatId = message.chat?.id
  const telegramUserId = message.from?.id
  const text = message.text?.trim()

  if (!chatId || !telegramUserId || !text) {
    return
  }

  const connection = await findTelegramConnection(String(telegramUserId))

  if (!connection) {
    await sendTelegramMessage({
      chatId,
      text: 'This Telegram account is not linked yet. Open Nutrix and click "Connect Telegram" first.',
    })
    return
  }

  const parsed = await mealAiService.parseMealForUser({
    userId: connection.userId,
    text,
  })

  const meal = await prisma.mealEntry.create({
    data: {
      userId: connection.userId,
      loggedAt: new Date(),
      mealType: parsed.parsed.mealType as MealType,
      source: EntrySource.telegram,
      notes: parsed.parsed.notes ?? text,
      items: {
        create: parsed.parsed.items.map((item) => ({
          foodNameSnapshot: item.foodName,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          proteinGrams: item.proteinGrams,
          carbsGrams: item.carbsGrams,
          fatGrams: item.fatGrams,
        })),
      },
    },
    include: {
      items: true,
    },
  })

  const totalCalories = meal.items.reduce((sum, item) => sum + item.calories, 0)

  await sendTelegramMessage({
    chatId,
    text: [
      `Logged ${meal.mealType} with ${parsed.model}.`,
      ...meal.items.map((item) => `- ${item.foodNameSnapshot}: ${item.calories} cal`),
      `Total: ${totalCalories} cal`,
    ].join('\n'),
  })
}

async function handleUnknownCommand(message: TelegramMessage) {
  const chatId = message.chat?.id

  if (!chatId) {
    return
  }

  await sendTelegramMessage({
    chatId,
    text: 'Unknown command. Use /help to see what Nutrix supports right now.',
  })
}

export const telegramService = {
  async handleIncomingMessage(message: TelegramMessage) {
    const command = getCommand(message.text)

    switch (command) {
      case '/start':
        await handleStartCommand(message)
        return
      case '/help':
        await handleHelpCommand(message)
        return
      case '/whoami':
        await handleWhoAmICommand(message)
        return
      case '/status':
        await handleStatusCommand(message)
        return
      default:
        if (command?.startsWith('/')) {
          await handleUnknownCommand(message)
          return
        }

        await handleMealMessage(message)
    }
  },
}
