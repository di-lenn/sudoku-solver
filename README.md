# Sudoku Solver

A full-stack Sudoku web app built as a learning project — covering a Next.js
frontend, a NestJS API, a from-scratch constraint-solving engine, computer
vision for scanning printed puzzles, and a production-style setup (Docker,
CI/CD, testing) end to end.

## Stack

- **Frontend**: Next.js, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: NestJS, Prisma, PostgreSQL
- **Solver**: hand-written TypeScript (no external solver libraries)
- **Testing**: Jest (backend), Vitest (frontend), Playwright (E2E)
- **Infra**: Docker, GitHub Actions, pnpm workspaces + Turborepo

## Project structure

```
apps/
  frontend/   Next.js app
  backend/    NestJS API
packages/     shared code (added as needed, e.g. the solver engine)
```

## Getting started

Prerequisites: Node.js, [pnpm](https://pnpm.io), Docker.

```bash
pnpm install
pnpm turbo run dev
```

## Development

```bash
pnpm turbo run build   # build all apps
pnpm turbo run lint    # lint all apps
pnpm turbo run test    # test all apps
```
