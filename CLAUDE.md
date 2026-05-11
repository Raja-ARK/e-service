# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Dev (all apps via Turbo)
bun dev

# Dev individual apps
bun dev:external   # port 3001
bun dev:internal   # port 3002
bun dev:admin      # port 3003
bun dev:server     # port 3000

# Build
bun build

# Type check
bun check-types

# Lint & format (Biome)
bun check          # lint + format check
bun format         # format write
bun lint           # lint write

# Database (Drizzle)
bun db:push        # push schema to DB (no migration file)
bun db:generate    # generate migration files
bun db:migrate     # run migrations
bun db:studio      # open Drizzle Studio
```

## Architecture

**Stack:**  Bun + Elysia + oRPC + Drizzle + Next.js × 3

### Monorepo Layout

- `apps/server` — Elysia backend (port 3000)
- `apps/external` — Next.js public-facing app (port 3001)
- `apps/internal` — Next.js staff-facing app (port 3002)
- `apps/admin` — Next.js admin app (port 3003)
- `packages/api` — oRPC router + procedures (`@e-service/api`)
- `packages/auth` — Better-Auth instance (`@e-service/auth`)
- `packages/db` — Drizzle ORM + schema (`@e-service/db`)
- `packages/ui` — Shared React component library (`@e-service/ui`)
- `packages/env` — Zod-validated env vars (`@e-service/env`)
- `packages/i18n` — next-intl config + EN/AR messages (`@e-service/i18n`)

### Request Flow

```
Next.js app
  → apps/*/src/utils/orpc.ts (RPCLink → SERVER_URL/rpc)
  → apps/server/src/index.ts (Elysia)
      /api/auth/*  → Better-Auth
      /rpc*        → oRPC handler (session injected into context)
      /docs*       → OpenAPI docs
  → packages/api/ (procedures)
  → packages/db/  (Drizzle + PostgreSQL)
```

### Key Patterns

**Adding an oRPC procedure:** Define in `packages/api/src/routers/`, use `publicProcedure` or `protectedProcedure` from `packages/api/src/procedures.ts`. Register in the root router.

**Auth context:** Session resolved in `apps/server/src/index.ts`, injected into oRPC context. `protectedProcedure` throws if no session.

**Environment variables:** Import from `@e-service/env/server` (backend) or `@e-service/env/web` (Next.js). Never read `process.env` directly — add new vars to `packages/env/`.

**i18n:** Keys in `packages/i18n/messages/{en,ar}.json`. RTL auto-applied for Arabic. Use `useTranslations()` (client) or `getTranslations()` (server) from next-intl.

**Frontend data fetching:** Use typed oRPC client from `apps/*/src/utils/orpc.ts` with TanStack Query helpers (`orpc.someRoute.useQuery()`, etc.).

**UI components:** Use `@e-service/ui` (Ark UI + Tailwind). Shared CSS from `packages/ui/src/styles/globals.css`.

**Linter:** Biome — `noExplicitAny` disabled, `useExhaustiveDependencies` is info-level, Tailwind class sorting enforced for `cn`/`clsx`/`cva`.
