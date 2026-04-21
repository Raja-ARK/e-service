# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

**Better-T-Stack** monorepo: Bun + Turborepo + Elysia + Next.js + oRPC + Drizzle + PostgreSQL + Better-Auth.

## Commands

```bash
# From repo root
bun install
bun run dev          # All apps in parallel
bun run build        # Build all
bun run check-types  # tsc across all packages
bun run check        # Biome lint + format fix

# Scope to one app
bun run dev:server   # Elysia on :3000
bun run dev:external      # Next.js on :3001
bun run dev:internal  # Next.js on :3002
bun run dev:admin    # Next.js on :3003

# Database (runs drizzle-kit against apps/server/.env)
bun run db:push      # Sync schema → DB (no migration file)
bun run db:generate  # Generate migration files
bun run db:migrate   # Run pending migrations
bun run db:studio    # Open Drizzle Studio
```

No test runner is configured yet.

## Architecture

```
apps/server   — Elysia HTTP server (port 3000). Mounts oRPC at /rpc, Better-Auth at /api/auth/*, OpenAPI at /api-reference.
apps/external      — Next.js 15 app router (port 3001). Consumes oRPC via @tanstack/react-query.
apps/internal      — Next.js 15 app router (port 3002). Consumes oRPC via @tanstack/react-query.
apps/admin      — Next.js 15 app router (port 3003). Consumes oRPC via @tanstack/react-query.

packages/api  — oRPC router + procedures. publicProcedure and protectedProcedure defined here. Add new routers here.
packages/auth — Better-Auth instance. Initialized with Drizzle adapter + server env. Imported by both server and api.
packages/db   — Drizzle ORM factory + schema. All table definitions live in packages/db/src/schema/.
packages/env  — t3-oss/env-core schemas for server (packages/env/src/server.ts) and web (packages/env/src/web.ts). All env vars validated here.
packages/ui   — Shared shadcn/ui components + TailwindCSS globals.
packages/config — Shared tsconfig.base.json.
```

## Key Patterns

**oRPC end-to-end types:** Procedures in `packages/api` auto-generate client types used in `apps/{external, internal, admin}/src/utils/orpc.ts`. No manual type sharing needed.

**Request context:** Each request gets a typed context (see `packages/api/src/context.ts`) that includes the Better-Auth session. `protectedProcedure` throws if session is absent.

**Env validation:** Never read `process.env` directly. Import from `@e-service/env/server` or `@e-service/env/web`. Adding a new variable requires updating the Zod schema there first.

**Schema changes:** Edit `packages/db/src/schema/`, then run `bun run db:push` (dev) or `bun run db:generate && bun run db:migrate` (prod-style).

**Adding a new route:** Define procedure in `packages/api/src/routers/`, register in `packages/api/src/routers/index.ts`. Client picks it up automatically via TypeScript.

## Tooling

- **Biome** handles lint + format (tabs, double quotes). Pre-commit hook via Lefthook auto-fixes staged files.
- **Turborepo** caches builds. If a cached build is stale, run `bunx turbo run build --force`.
- **tsdown** compiles `apps/server` to ESM. `bun run compile` produces a standalone binary.

## Environment

`apps/server/.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres
BETTER_AUTH_SECRET=<min 32 chars>
BETTER_AUTH_URL=http://localhost:3000
EXTERNAL_URL=http://localhost:3001
INTERNAL_URL=http://localhost:3002
ADMIN_URL=http://localhost:3003
```

`apps/{external,internal,admin}/.env` (all three identical):
```
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```
