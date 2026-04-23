# Nutrix

Nutrix is a focused nutrition tracker for logging meals, setting calorie and macro goals, reviewing history, and getting lightweight AI-assisted meal parsing and suggestions.

It supports dashboard logging, Telegram meal capture through `@NutrrixBot`, daily reports, trends, insights, and saved Filipino meal suggestions.

## Features

- Meal logging through search, custom entry, AI parsing, and Telegram.
- Goal setup for cutting, maintenance, bulking, or custom calorie and macro targets.
- Dashboard overview with calories, macros, recent meals, and AI meal suggestions.
- History views for meals, calendar, daily reports, and weekly summaries.
- Recharts-powered trend charts.
- AI meal parsing with confidence, assumptions, and normalized food names.
- Source-backed Filipino meal suggestions with save-for-later support.
- Hidden `/admin` page for owner-only Telegram webhook controls.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7
- PostgreSQL
- Clerk authentication
- TanStack Query
- React Hook Form + Zod
- Recharts
- Gemini API for AI parsing
- Telegram Bot API

## Requirements

- Node.js 20+
- npm
- PostgreSQL, or Docker for the local database
- Clerk application keys
- Gemini API key for AI parsing
- Telegram bot token if using Telegram logging

## Quick Start

```bash
npm install
cp .env.example .env.local
```

Update `.env.local` with your local values, then run:

```bash
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Core app:

```env
DATABASE_URL="postgresql://nexion:nexion@localhost:5432/nexion"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Clerk:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SIGNING_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/register"
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL="/dashboard"
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL="/dashboard"
```

AI:

```env
GEMINI_API_KEY="..."
```

Telegram:

```env
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_BOT_USERNAME="NutrrixBot"
TELEGRAM_WEBHOOK_SECRET="..."
```

Admin and cron:

```env
NUTRIX_ADMIN_PASSWORD="change-me"
NUTRIX_ADMIN_SESSION_SECRET="change-me-too"
NUTRIX_CRON_SECRET="change-me-for-cron"
```

## Database

Generate Prisma client:

```bash
npm run db:generate
```

Create and apply a local migration:

```bash
npx prisma migrate dev
```

Apply migrations in production:

```bash
npm run db:migrate:deploy
```

Open Prisma Studio:

```bash
npx prisma studio
```

## Docker Development

Start the database and app with hot reload:

```bash
docker compose -f docker-compose.dev.yml up --build
```

The development compose file mounts the workspace into the container and runs migrations before starting Next.js.

## Telegram Setup

Normal users should not register webhooks. They only connect Telegram from Settings and search for `@NutrrixBot`.

Owner setup:

1. Set `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET`, and `NEXT_PUBLIC_APP_URL`.
2. Start the app.
3. Visit `/admin`.
4. Unlock with `NUTRIX_ADMIN_PASSWORD`.
5. Register or re-register the Telegram webhook from the admin page.

For local Telegram testing, expose your app with a tunnel such as ngrok and set:

```env
NEXT_PUBLIC_APP_URL="https://your-ngrok-domain.example"
```

Telegram sends updates to:

```text
/api/telegram/webhook
```

## AI Meal Parsing

The parser accepts free text like:

```text
4 siomai and rice
Del Monte Four Season Juice
Jollibee chickenjoy with rice
mango float one big cup
```

It returns structured meal data with:

- Meal type
- Food items
- Calories and macros
- Confidence
- Assumptions
- Review flag

Telegram replies intentionally hide model names and respond in user-friendly language.

## AI Meal Suggestions

Smart suggestions are generated on demand and saved to the database so refreshes do not waste a usage limit.

Users can:

- Generate suggestions by style
- Review real recipe sources
- Save meals for later
- Open saved meals at `/dashboard/suggestions/saved`

Daily suggestion usage is tracked with `User.foodSuggestionLimit`. Reset it from your cron provider by calling:

```text
POST /api/internal/meal-suggestions/reset
Header: x-nutrix-cron-secret: <NUTRIX_CRON_SECRET>
```

## Project Structure

```text
app/                         Next.js routes and API routes
components/admin/            Hidden admin UI
components/dashboard/        Dashboard shell and feature sections
components/ui/               Shared UI primitives
lib/api/                     API helpers and auth guards
lib/data/                    Curated data such as recipe catalog
lib/hooks/                   TanStack Query hooks
lib/services/                Backend services
lib/telegram/                Telegram API and linking helpers
lib/validations/             Zod schemas
prisma/                      Prisma schema and migrations
public/                      Static assets
```

## Scripts

```bash
npm run dev                Start Next.js dev server
npm run dev:docker         Start dev server on 0.0.0.0 for Docker
npm run build              Generate Prisma client and build Next.js
npm run start              Start production server
npm run lint               Run ESLint
npm run format             Format with Prettier
npm run format:check       Check formatting
npm run db:generate        Generate Prisma client
npm run db:migrate:deploy  Apply production migrations
npm run db:seed            Seed database
```

## Deployment Notes

- Set all required env vars in your hosting provider.
- Run `npm run db:migrate:deploy` before or during deploy.
- Ensure `NEXT_PUBLIC_APP_URL` is the public production URL.
- Register the Telegram webhook from `/admin` after deploy.
- Configure cron-job.org or another cron provider to call the suggestion reset endpoint at midnight.

## Credits

Created by John Patrick Ryan Mandal.

## License

This project is licensed under the [MIT License](LICENSE).
