export default {
  'apps/frontend/**/*.{ts,tsx}': () => 'pnpm --filter frontend lint',
  'apps/backend/**/*.ts': () => 'pnpm --filter backend lint',
};
