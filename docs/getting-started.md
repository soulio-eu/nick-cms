# Getting started

A consumer goes from a fresh SvelteKit template to rendered content in four files.

1. Install the kit and the D1 adapter, and add a D1 binding to `wrangler.jsonc`:

   ```sh
   pnpm add @nick-cms/kit @nick-cms/d1
   ```

2. Copy the library's migrations with `nick migrations sync`, then apply them with wrangler. The binding settings and the migration layout are in [Storage](storage.md#migrations).

3. Compose on the server in `src/hooks.server.ts`:

   ```ts
   import { nickHandle } from '@nick-cms/kit';
   import { d1Store } from '@nick-cms/d1';
   import { testimonials } from '$lib/collections';

   export const handle = nickHandle({
     store: (event) => d1Store(event.platform!.env.DB),
     collections: [testimonials],
   });
   ```

4. Load and mount in the root layout:

   ```ts
   // src/routes/+layout.server.ts
   export const load = ({ locals }) => ({ nick: locals.nick.loadApp() });
   ```

   ```svelte
   <!-- src/routes/+layout.svelte -->
   <NickApp data={data.nick}>
     {#snippet fallback(error)}<SiteOffline {error} />{/snippet}
     {@render children()}
   </NickApp>
   ```

From there, route `load` functions use `locals.nick`, and components call the library's context getters for what `NickApp` provides. Collections such as `testimonials` are defined with `defineCollection`; see [Document store](document-store.md).
