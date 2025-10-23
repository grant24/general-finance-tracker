# Client testing notes

This file explains how tests are wired and how to run them locally.

- Vitest config: `client/vitest.config.ts` — uses `jsdom` and loads `client/test/setup-vitest.ts`.
- Setup file: `client/test/setup-vitest.ts` — resets stores before each test and polyfills `window.matchMedia`.

Run tests from the `client` directory:

```bash
cd client
npx vitest run --config ./vitest.config.ts
```

If tests mock `trpc`, they can set `(global as any).__trpcMocks = { getMock, updateMock }` to make store helpers use those mocks.
