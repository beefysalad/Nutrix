# AI Implementation Guide

This file is the root instruction file for AI agents working in this repository.

When making changes, follow the rules below unless the user explicitly asks for a different approach.

## Core Principles

- Keep implementations modular and easy to extend.
- Prefer existing project patterns over inventing new ones.
- Reuse components, helpers, and hooks whenever practical.
- Keep files focused. If a file starts growing too much, split it.
- Avoid `any`. Prefer explicit, narrow TypeScript types.

## Frontend Rules

### Page Structure

- Keep route files in `app/**/page.tsx` minimal.
- A page file should usually only import and render a feature component.
- Example: `app/dashboard/page.tsx` should render a dashboard component from `components/dashboard/`.

### Component Structure

- Do not let page components or feature components become overly large.
- If a dashboard or feature view contains multiple sections, move them into separate files.
- Move helpers, constants, and view-specific utilities into separate files when they start cluttering the main component.
- Prefer reusable components when the same UI or behavior appears more than once.

### Forms

- Always use **React Hook Form** for forms.
- Always use **Zod** for validation.
- Place validation schemas in `lib/validations/`.
- Do not build forms with ad hoc local state when React Hook Form is appropriate.

### Data Fetching

- Always use the shared Axios client from `lib/axios.ts`.
- Do not create one-off fetch utilities if Axios is already the project standard.
- For client-side server state, always use **TanStack Query**.
- Put TanStack Query logic in hook files under `hooks/`.
- For feature-specific hooks, prefer feature folders when useful, for example:
  - `hooks/dashboard/use-dashboard-data.ts`
  - `hooks/dashboard/use-update-dashboard-settings.ts`

### UI Components

- Always prefer existing **shadcn/ui** components from `components/ui/` over native HTML controls when an equivalent exists.
- Example: use the shared `Button` component instead of a plain `<button>` for application actions.
- If a needed shadcn component does not exist yet, prompt the user before adding or installing it.
- Avoid using the `Sparkles` icon unless the user explicitly wants it or it is truly necessary for the design.

### Folder Organization

- Keep feature code grouped clearly.
- Prefer organizing by responsibility:
  - `app/` for routes
  - `components/` for UI and feature components
  - `hooks/` for client hooks and TanStack Query hooks
  - `lib/validations/` for Zod schemas
  - `lib/api/` for API wrappers
  - `lib/repositories/` for data access
  - `lib/services/` for business logic
- Do not leave unrelated helpers, large inline types, or subcomponents buried in a page file unless they are truly tiny.

## Backend Rules

### Architecture

- Always follow the **repository/service** pattern.
- Database access belongs in `lib/repositories/`.
- Business logic belongs in `lib/services/`.
- API routes should stay thin and delegate work to services.
- Do not run Prisma migrations or Prisma client generation yourself. Ask the user to run them.
- Do not run `npm install` yourself. Ask the user to run it.

### Typing

- Avoid `any`.
- Use explicit input and return types where helpful.
- Keep data shapes clear between repositories, services, and routes.

## Expected Workflow For AI Changes

When implementing a feature:

1. Keep the route entry minimal.
2. Create or reuse feature components under `components/`.
3. Use shadcn UI primitives from `components/ui/`.
4. Use React Hook Form + Zod for forms.
5. Use Axios through `lib/axios.ts`.
6. Use TanStack Query through dedicated hooks in `hooks/`.
7. Keep API routes thin.
8. Put database access in repositories.
9. Put business logic in services.
10. Split large files before they become difficult to maintain.

## Notes

- These rules are meant to keep the codebase consistent and maintainable.
- If a request conflicts with these conventions, follow the user's explicit instruction.
