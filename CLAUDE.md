# Sudoku Solver — notes for Claude Code

Personal learning project: Next.js frontend + NestJS backend + a hand-written
TypeScript Sudoku solver (no external solver libraries), computer vision for
scanning printed puzzles, PostgreSQL/Prisma, Docker, CI/CD. Roadmap and phase
breakdown live in `.plans/initialPlan.md` (untracked — local working notes,
won't exist in a fresh clone). Phases 0 and 1 are complete as of this writing.

## Working agreement

- Never run installs (`pnpm install`, etc.) or any git command that commits,
  pushes, merges, or otherwise changes code/repo state (`commit`, `push`,
  `merge`, `reset`, `checkout` that discards work, etc.) — the user runs
  those themselves. This is a learning project and they want to drive that
  part directly.
- Read-only git commands (`status`, `diff`, `log`, `show`, etc.) are fine to
  run whenever useful. Read-only `gh` commands (checking CI runs, branch
  protection, etc.) are also fine.
- Writing/editing code and files is a shared job — go ahead and write
  directly to files rather than only pasting content for copy-paste.

## Repo structure

```
apps/
  frontend/   Next.js app
  backend/    NestJS API
packages/     shared code — doesn't exist yet, needed once Phase 3 (solver)
              starts, so both apps can import the same solving engine
```

pnpm workspace + Turborepo at the root; single lockfile, no per-app
`node_modules`. Node version in use: **v24.12.0** (via nvm).

## Installed stack — check here before adding a new dependency

The point of this table is to avoid reaching for a new package when
something already in the project does the job. Versions are what's actually
resolved in `pnpm-lock.yaml`, not just the `package.json` range.

**Monorepo tooling (root)**
| Package | Version | Role |
|---|---|---|
| pnpm | 10.27.0 | Package manager / workspace linking |
| Turborepo | 2.10.6 | Task orchestration/caching (`pnpm turbo run <task>`) |
| Husky | 9.1.7 | Git hooks (`.husky/pre-commit`) |
| lint-staged | 17.2.0 | Runs each app's lint on staged files pre-commit |

**Frontend (`apps/frontend`)**
| Package | Version | Role |
|---|---|---|
| Next.js | 16.2.11 | Framework, App Router, routing, rendering |
| React | 19.2.4 | UI library |
| Tailwind CSS | 4.3.3 | Styling |
| TypeScript | 5.9.3 | Language |
| ESLint | 9.39.5 (`eslint-config-next`) | Linting |

Not yet installed, needed later: **shadcn/ui** (component library, planned),
**TanStack Query** (server state/API calls, planned), **Vitest** (chosen as
the test runner but not wired up — frontend currently has zero tests).

**Backend (`apps/backend`)**
| Package | Version | Role |
|---|---|---|
| NestJS (`@nestjs/common`/`core`) | 11.1.28 | Framework, DI, modules |
| `@nestjs/config` | 4.0.4 | Env var loading into `ConfigService` |
| Joi | 18.2.3 | Env var validation schema (see `src/config/env.validation.ts`) |
| Prisma (`prisma`, `@prisma/client`) | 7.9.0 | ORM — schema, migrations, generated client |
| `@prisma/adapter-pg` | 7.9.0 | Postgres driver adapter (required in Prisma 7, see gotchas below) |
| `pg` | 8.22.0 | Underlying Postgres driver used by the adapter |
| `@nestjs/terminus` | 11.1.1 | Health checks (`GET /health`, pings Postgres via Prisma) |
| Jest / `ts-jest` | 30.x | Testing (Nest's default, kept deliberately — see Key decisions) |
| ESLint | 9.39.5 (`typescript-eslint` type-checked) | Linting |
| Prettier | 3.4.2 (shared root `.prettierrc`) | Formatting, wired through `eslint-plugin-prettier` |

Not yet installed, needed later: **`@nestjs/passport` + `@nestjs/jwt`**
(auth, Phase 10), **`opencv.js`/`tesseract.js`** (CV/OCR, Phase 8).

**Database / infra**
| Thing | Version | Role |
|---|---|---|
| PostgreSQL | 17-alpine (Docker) | Database, via root `docker-compose.yml` |
| Docker Compose | — | Local Postgres container (`docker compose up -d`) |
| GitHub Actions | — | CI (`.github/workflows/ci.yml`): lint → typecheck → test → build |

## Environment variables

Two separate `.env`/`.env.example` pairs, both gitignored for the real
`.env` and tracked for `.env.example`:
- **Root `.env`** — `POSTGRES_USER`/`PASSWORD`/`DB`/`PORT`, read by
  `docker-compose.yml` to create the Postgres container.
- **`apps/backend/.env`** — `NODE_ENV`, `PORT`, `DATABASE_URL` (must match
  the root Postgres credentials). Validated at boot via Joi
  (`src/config/env.validation.ts`) — the app refuses to start if something's
  missing or malformed.

## Available endpoints (backend, port 3001)

- `GET /` — default Nest placeholder ("Hello World!")
- `GET /health` — real check, pings Postgres through `PrismaService`; `200`
  if up, `503` if not
- `GET /version` — returns `package.json`'s version

Frontend runs on port 3000 (`next dev`). Backend's default port was moved to
**3001** specifically to avoid colliding with it.

## Known gotchas (newer major versions than typical training data)

- **Next.js 16 / React 19**: `apps/frontend/AGENTS.md` warns of breaking
  changes — check `apps/frontend/node_modules/next/dist/docs/` before
  writing App Router code that assumes older Next.js conventions, especially
  caching/data-fetching.
- **Prisma 7**: the connection URL is no longer read from `schema.prisma` —
  it lives in `prisma.config.ts` (used by the CLI: `migrate`/`generate`) and
  is passed explicitly to `PrismaClient` via a **driver adapter**
  (`@prisma/adapter-pg`'s `PrismaPg`), which is now required, not optional.
  See `src/prisma/prisma.service.ts` for the working pattern.
- **Prisma 7 generator `moduleFormat`**: the generator auto-detects
  ESM vs CJS output from `tsconfig.json` and got it wrong for this project
  (produced `import.meta.url`, which breaks under CommonJS). Fixed by
  pinning `moduleFormat = "cjs"` explicitly in `schema.prisma`'s generator
  block — don't remove that line.
  The generated client (`apps/backend/generated/prisma/`) is gitignored
  (derived output, like `dist/`) and regenerates automatically via
  `"postinstall": "prisma generate"` in `apps/backend/package.json` — this
  runs on every `pnpm install`, local or CI. If backend lint/typecheck fails
  with "unsafe call of a type that could not be resolved" on Prisma-related
  code, the generated client is probably just missing — run `pnpm install`
  or `pnpm --filter backend exec prisma generate`, not a code fix.
- **Husky v9**: hooks are plain shell scripts in `.husky/`, no shebang or
  `. husky.sh` sourcing (that pattern is deprecated, fails in v10). Setup is
  `pnpm exec husky`, which sets `git config core.hooksPath .husky/_`.
- **pnpm 10**: blocks dependency `postinstall` scripts by default unless
  allow-listed (`ignoredBuiltDependencies` in `pnpm-workspace.yaml`, e.g.
  `sharp`). This only affects third-party packages' scripts — first-party
  workspace scripts (like the Prisma `postinstall` above) always run.
- **Branch protection**: configured via GitHub's newer **Ruleset** system,
  not classic branch protection — `gh api repos/{owner}/{repo}/branches/main/protection`
  will incorrectly report "not protected" (404). Check
  `gh api repos/{owner}/{repo}/rulesets` instead.

## Key decisions

- **Testing**: Jest for `apps/backend` (matches the Nest CLI scaffold),
  Vitest for `apps/frontend` and shared packages (not yet installed).
- **Auth**: NestJS-native (`@nestjs/passport` + `@nestjs/jwt`, Prisma-backed
  sessions) — not Auth.js/Better Auth, which assume they're the source of
  truth inside a Next.js app.
- **Computer vision**: `opencv.js` (WASM build) only — never native bindings
  (`opencv4nodejs`), which are unmaintained and break Docker builds. Client
  vs. server placement is undecided until Phase 8.
- **OCR**: `tesseract.js`. Don't trust its output as ground truth — plan for
  a manual-correction step before solving.
