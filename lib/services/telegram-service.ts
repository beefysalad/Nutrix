import { EntrySource, IntegrationProvider, IntegrationStatus, MealType, Prisma } from '@/app/generated/prisma/client'

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

const TELEGRAM_ACTION_KEYBOARD = {
  keyboard: [
    [{ text: 'Log meal' }, { text: 'Today summary' }],
    [{ text: 'What did I eat today?' }, { text: 'Calories left' }],
  ],
  resize_keyboard: true,
  persistent: true,
} as const

const pendingTelegramMealPrompts = new Map<number, number>()
const TELEGRAM_MEAL_PROMPT_TTL_MS = 10 * 60 * 1000

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

  if (!command?.startsWith('/')) {
    return null
  }

  return command
}

function normalizeTelegramAction(text?: string) {
  return text?.trim().toLowerCase() ?? ''
}

function getCommandPayload(text?: string) {
  if (!text) {
    return ''
  }

  const parts = text.trim().split(/\s+/)
  return parts.slice(1).join(' ').trim()
}

function getDisplayName(message: TelegramMessage) {
  const fullName = [message.from?.first_name, message.from?.last_name]
    .filter(Boolean)
    .join(' ')

  return message.from?.username || fullName || 'there'
}

function formatTelegramMacro(value: number) {
  return `${Math.round(value)}g`
}

function formatTelegramTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function formatMealTypeLabel(mealType: string) {
  return mealType.charAt(0).toUpperCase() + mealType.slice(1)
}

function formatTelegramMealItem(input: {
  quantity: Prisma.Decimal | number | string | null | undefined
  unit: string | null | undefined
  name: string
  calories: number
}) {
  const quantityValue =
    input.quantity != null && Number(input.quantity) > 0
      ? Number.isInteger(Number(input.quantity))
        ? `${Number(input.quantity)}`
        : `${Number(input.quantity)}`
      : null

  const portion = quantityValue
    ? `${input.name}${input.unit ? ` (${quantityValue} ${input.unit})` : ` (${quantityValue})`}`
    : input.name

  return `${portion}: ~${input.calories} kcal`
}

function getNutrixChatIntent(text: string) {
  const normalized = text.trim().toLowerCase()

  if (
    normalized.includes('what did i have today') ||
    normalized.includes('what have i had today') ||
    normalized.includes('what have i logged today') ||
    normalized.includes('meals today') ||
    normalized.includes('show my meals today')
  ) {
    return 'today-meals'
  }

  if (
    normalized.includes('summary') ||
    normalized.includes('today so far') ||
    normalized.includes('daily summary')
  ) {
    return 'summary'
  }

  if (
    normalized.includes('remaining') ||
    normalized.includes('left') ||
    normalized.includes('goal') ||
    normalized.includes('under goal') ||
    normalized.includes('over goal')
  ) {
    return 'goal-status'
  }

  if (
    normalized.includes('calories today') ||
    normalized.includes('how many calories') ||
    normalized.includes('protein today') ||
    normalized.includes('proteins today') ||
    normalized.includes('how much protein') ||
    normalized.includes('how many proteins') ||
    normalized.includes('macros today')
  ) {
    return 'summary'
  }

  return 'unknown'
}

function getTelegramMealFailureMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()

  if (
    normalized.includes('503') ||
    normalized.includes('unavailable') ||
    normalized.includes('high demand') ||
    normalized.includes('try again later')
  ) {
    return 'Nutrix AI is a bit busy right now, so I could not parse that meal yet. You can try /log again in a bit, or switch the AI model in Nutrix Settings and try again.'
  }

  return 'I could not log that meal right now. Please try again in a bit.'
}

function markPendingMealPrompt(chatId: number) {
  const now = Date.now()

  for (const [id, createdAt] of pendingTelegramMealPrompts.entries()) {
    if (now - createdAt > TELEGRAM_MEAL_PROMPT_TTL_MS) {
      pendingTelegramMealPrompts.delete(id)
    }
  }

  pendingTelegramMealPrompts.set(chatId, now)
}

function consumePendingMealPrompt(chatId: number) {
  const createdAt = pendingTelegramMealPrompts.get(chatId)

  if (!createdAt) {
    return false
  }

  pendingTelegramMealPrompts.delete(chatId)
  return Date.now() - createdAt <= TELEGRAM_MEAL_PROMPT_TTL_MS
}

async function getTodayNutritionSnapshot(userId: string) {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  const [goal, meals] = await Promise.all([
    prisma.goal.findFirst({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        dailyCalories: true,
        proteinGrams: true,
      },
    }),
    prisma.mealEntry.findMany({
      where: {
        userId,
        loggedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        loggedAt: 'asc',
      },
    }),
  ])

  const totals = meals.reduce(
    (accumulator, meal) => {
      for (const item of meal.items) {
        accumulator.calories += item.calories
        accumulator.protein += Number(item.proteinGrams ?? 0)
        accumulator.carbs += Number(item.carbsGrams ?? 0)
        accumulator.fat += Number(item.fatGrams ?? 0)
      }

      return accumulator
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  return {
    goal,
    meals,
    totals,
  }
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
      replyMarkup: TELEGRAM_ACTION_KEYBOARD,
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
    replyMarkup: TELEGRAM_ACTION_KEYBOARD,
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
      '/log <meal> - Log a meal on purpose',
      '/summary - Show today so far',
      '/whoami - Show the linked Nutrix account for this Telegram user',
      '/status - Show Telegram connection status',
      'You can also ask things like:',
      '"What did I have today?"',
      '"How many calories do I have left today?"',
    ].join('\n'),
    replyMarkup: TELEGRAM_ACTION_KEYBOARD,
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
    replyMarkup: TELEGRAM_ACTION_KEYBOARD,
  })
}

async function handleMealMessage(message: TelegramMessage, overrideText?: string) {
  const chatId = message.chat?.id
  const telegramUserId = message.from?.id
  const text = overrideText?.trim() || message.text?.trim()

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

  await sendTelegramMessage({
    chatId,
    text: 'Meal received. Parsing and logging it now...',
    replyMarkup: TELEGRAM_ACTION_KEYBOARD,
  })

  try {
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
    const totalProtein = meal.items.reduce((sum, item) => sum + Number(item.proteinGrams ?? 0), 0)
    const totalCarbs = meal.items.reduce((sum, item) => sum + Number(item.carbsGrams ?? 0), 0)
    const totalFat = meal.items.reduce((sum, item) => sum + Number(item.fatGrams ?? 0), 0)
    const confidence = parsed.parsed.confidence ?? 0.75
    const shouldReview = parsed.parsed.needsReview || confidence < 0.7
    const assumptions = parsed.parsed.assumptions?.slice(0, 2) ?? []

    await sendTelegramMessage({
      chatId,
      text: [
        '🍱 Logged!',
        '',
        ...meal.items.map((item) =>
          formatTelegramMealItem({
            quantity: item.quantity,
            unit: item.unit,
            name: item.foodNameSnapshot,
            calories: item.calories,
          }),
        ),
        '',
        `Total: ${totalCalories} kcal · Protein ${formatTelegramMacro(totalProtein)} · Carbs ${formatTelegramMacro(totalCarbs)} · Fat ${formatTelegramMacro(totalFat)}`,
        shouldReview ? 'Quick note: this one looks a bit estimated, so double-check it in Nutrix if needed.' : null,
        assumptions.length > 0 ? `Assumed: ${assumptions.join('; ')}` : null,
      ].join('\n'),
      replyMarkup: TELEGRAM_ACTION_KEYBOARD,
    })
  } catch (error) {
    await sendTelegramMessage({
      chatId,
      text: getTelegramMealFailureMessage(error),
      replyMarkup: TELEGRAM_ACTION_KEYBOARD,
    })
  }
}

async function handleSummaryCommand(message: TelegramMessage) {
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

  const snapshot = await getTodayNutritionSnapshot(connection.userId)
  const remainingCalories =
    snapshot.goal?.dailyCalories != null
      ? snapshot.goal.dailyCalories - snapshot.totals.calories
      : null

  await sendTelegramMessage({
    chatId,
    text: [
      '📊 Today so far:',
      `${snapshot.totals.calories.toLocaleString()} kcal consumed`,
      remainingCalories != null
        ? `${Math.abs(remainingCalories).toLocaleString()} kcal ${remainingCalories >= 0 ? 'remaining' : 'over goal'}`
        : 'No calorie goal set yet',
      snapshot.goal?.proteinGrams != null
        ? `Protein: ${Math.round(snapshot.totals.protein)}g / ${snapshot.goal.proteinGrams}g goal`
        : `Protein: ${Math.round(snapshot.totals.protein)}g`,
      `Meals logged: ${snapshot.meals.length}`,
    ].join('\n'),
    replyMarkup: TELEGRAM_ACTION_KEYBOARD,
  })
}

async function handleNutrixChatMessage(message: TelegramMessage) {
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

  const intent = getNutrixChatIntent(text)

  if (intent === 'unknown') {
    await sendTelegramMessage({
      chatId,
      text: [
        'I can help with Nutrix only.',
        'Try:',
        '• /log 2 eggs and rice',
        '• /summary',
        '• what did I have today?',
        '• how much protein did I have today?',
        '• how many calories do I have left today?',
      ].join('\n'),
      replyMarkup: TELEGRAM_ACTION_KEYBOARD,
    })
    return
  }

  const snapshot = await getTodayNutritionSnapshot(connection.userId)

  if (intent === 'today-meals') {
    await sendTelegramMessage({
      chatId,
      text:
        snapshot.meals.length === 0
          ? 'You have not logged any meals today yet.'
          : [
              `🍽️ Today you logged ${snapshot.meals.length} ${snapshot.meals.length === 1 ? 'meal' : 'meals'}:`,
              '',
              ...snapshot.meals.map((meal) => {
                const mealCalories = meal.items.reduce(
                  (sum, item) => sum + item.calories,
                  0,
                )
                const mealName = meal.items
                  .map((item) => item.foodNameSnapshot)
                  .join(', ')
                return `• ${formatMealTypeLabel(meal.mealType)} · ${formatTelegramTime(new Date(meal.loggedAt))} · ${mealName} (${mealCalories} kcal)`
              }),
            ].join('\n'),
      replyMarkup: TELEGRAM_ACTION_KEYBOARD,
    })
    return
  }

  if (intent === 'summary') {
    await handleSummaryCommand(message)
    return
  }

  const remainingCalories =
    snapshot.goal?.dailyCalories != null
      ? snapshot.goal.dailyCalories - snapshot.totals.calories
      : null

  await sendTelegramMessage({
    chatId,
    text:
      remainingCalories == null
        ? 'You do not have a calorie goal set yet in Nutrix.'
        : remainingCalories >= 0
          ? `You still have ${remainingCalories.toLocaleString()} kcal left today.`
          : `You are ${Math.abs(remainingCalories).toLocaleString()} kcal over your goal today.`,
    replyMarkup: TELEGRAM_ACTION_KEYBOARD,
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
    replyMarkup: TELEGRAM_ACTION_KEYBOARD,
  })
}

export const telegramService = {
  async handleIncomingMessage(message: TelegramMessage) {
    const command = getCommand(message.text)
    const chatId = message.chat?.id
    const normalizedAction = normalizeTelegramAction(message.text)

    if (chatId && !command && consumePendingMealPrompt(chatId)) {
      await handleMealMessage(message)
      return
    }

    switch (command) {
      case '/start':
        await handleStartCommand(message)
        return
      case '/help':
        await handleHelpCommand(message)
        return
      case '/log': {
        const payload = getCommandPayload(message.text)

        if (!payload) {
          if (chatId) {
            markPendingMealPrompt(chatId)
            await sendTelegramMessage({
              chatId,
              text: 'Send the meal you want to log next. Example: 2 eggs and rice',
              replyMarkup: TELEGRAM_ACTION_KEYBOARD,
            })
          }
          return
        }

        await handleMealMessage(message, payload)
        return
      }
      case '/summary':
        await handleSummaryCommand(message)
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

        if (normalizedAction === 'help') {
          await handleHelpCommand(message)
          return
        }

        if (normalizedAction === 'start') {
          await handleStartCommand({
            ...message,
            text: '/start',
          })
          return
        }

        if (chatId && normalizedAction === 'log meal') {
          markPendingMealPrompt(chatId)
          await sendTelegramMessage({
            chatId,
            text: 'Send the meal you want to log next. Example: 2 eggs and rice',
            replyMarkup: TELEGRAM_ACTION_KEYBOARD,
          })
          return
        }

        if (normalizedAction === 'summary' || normalizedAction === 'today summary') {
          await handleSummaryCommand(message)
          return
        }

        if (normalizedAction === 'what did i eat today?') {
          await handleNutrixChatMessage({
            ...message,
            text: 'what did i have today?',
          })
          return
        }

        if (normalizedAction === 'calories left') {
          await handleNutrixChatMessage({
            ...message,
            text: 'how many calories do i have left today?',
          })
          return
        }

        await handleNutrixChatMessage(message)
    }
  },
}
