import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig(async () => ({
  plugins: [
    cloudflareTest({
      miniflare: {
        compatibilityDate: '2026-11-01',
        d1Databases: ['DB'],
        bindings: {
          TEST_MIGRATIONS: await readD1Migrations(`${import.meta.dirname}/../migrations`),
        },
      },
    }),
  ],
  test: { setupFiles: [`${import.meta.dirname}/apply-migrations.ts`] },
}));
