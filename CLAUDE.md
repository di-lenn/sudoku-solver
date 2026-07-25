# Sudoku Solver — notes for Claude Code

Personal learning project: Next.js frontend + NestJS backend + a hand-written
TypeScript Sudoku solver (no external solver libraries), computer vision for
scanning printed puzzles, PostgreSQL/Prisma, Docker, CI/CD. Roadmap and phase
breakdown live in `.plans/initialPlan.md` (untracked — local working notes,
won't exist in a fresh clone).

## Working agreement

- Never run installs (`pnpm install`, etc.) or any git command that commits,
  pushes, merges, or otherwise changes code/repo state (`commit`, `push`,
  `merge`, `reset`, `checkout` that discards work, etc.) — the user runs
  those themselves. This is a learning project and they want to drive that
  part directly.
- Read-only git commands (`status`, `diff`, `log`, `show`, etc.) are fine to
  run whenever useful.
- Writing/editing code and files is a shared job — go ahead and write
  directly to files rather than only pasting content for copy-paste.

## Structure

- `apps/frontend` — Next.js (App Router), Tailwind, shadcn/ui, TanStack Query
- `apps/backend` — NestJS, Prisma, PostgreSQL
- `packages/*` — shared code, added as needed (e.g. `packages/solver`, used
  by both apps once Phase 3 starts)
- pnpm workspace + Turborepo at the root; single lockfile, no per-app
  `node_modules`

## Key decisions

- **Testing**: Jest for `apps/backend` (matches the Nest CLI scaffold),
  Vitest for `apps/frontend` and shared packages.
- **Auth**: NestJS-native (`@nestjs/passport` + `@nestjs/jwt`, Prisma-backed
  sessions) — not Auth.js/Better Auth, which assume they're the source of
  truth inside a Next.js app.
- **Computer vision**: `opencv.js` (WASM build) only — never native bindings
  (`opencv4nodejs`), which are unmaintained and break Docker builds. Client
  vs. server placement is undecided until Phase 8.
- **OCR**: `tesseract.js`. Don't trust its output as ground truth — plan for
  a manual-correction step before solving.

## Frontend note

`apps/frontend` runs Next.js 16 / React 19, newer than typical training data.
Its own `AGENTS.md` warns of breaking changes — check
`apps/frontend/node_modules/next/dist/docs/` before writing App Router code
that relies on older Next.js conventions (especially caching/data-fetching).
