## Quick context for AI coding agents

This repo is a fullstack Vite + Fastify + tRPC TypeScript monorepo (npm workspaces). The client lives in `client/`, the server in `server/`, and shared packages under `packages/` (notably `packages/drizzle` and `packages/zod`). Keep changes minimal and workspace-scoped when possible.

Key facts (glanceable):

- Server: `server/src` — Fastify app at `src/index.ts` exposing tRPC on `/trpc` and an auth proxy on `/api/auth/*`.
- tRPC helpers: `server/src/trpc.ts` defines `publicProcedure`, `protectedProcedure`, and `adminProcedure`. Use these when adding procedures.
- Context: `server/src/context.ts` creates `ctx` with `{ req, res, db, config, user? }`. `ctx.db` is the Drizzle client from `packages/drizzle` and is how to access the database.
- Auth: `server/src/lib/auth.ts` configures `better-auth` with the Drizzle adapter. Authentication requests are proxied by `server/src/handlers/auth.ts` to `auth.handler`.
- Client tRPC: `client/src/lib/trpc.ts` creates a trpc client that uses credentials: 'include' and an env var `VITE_URL_BACKEND`. Update that env var when the backend runs on a non-default host.

Client UI tech

- The client is written with Lit (lit-html / lit) and uses web components rather than React. See `client/src/main.ts`, `client/src/app-root.ts`, and the `client/src/components/` directory for examples (e.g. `client/src/components/auth/login-component.ts`). The app bootstraps custom elements and uses Shoelace components and Phosphor icon webcomponents.

Important repo-specific conventions

- Use `opts.ctx.db` inside tRPC resolvers to access the database (Drizzle). Example: see `server/src/router/userRouter.ts` and `server/src/router/sessionRouter.ts`.
- Read and update cookies via the auth API. The server forwards `Set-Cookie` from the Better Auth responses to the client (see session/login/signup mutations in `sessionRouter`). Don't assume cookies are HttpOnly: the current config sets `httpOnly: false` intentionally.
- Create new tRPC routers under `server/src/router/` and register them in `server/src/router/index.ts`. Follow the pattern: `export default router({...})` and merge into `appRouter`.
- Authorization flows depend on `createContext` calling `auth.api.getSession` using headers from the Fastify request — this populates `ctx.user`. When writing tests or background workers that call server functions directly, mock or provide `ctx.user` explicitly.

Build / dev / tests (how devs run things)

- Install: `npm install` (workspace-aware)
- Start both dev servers: `npm run dev` (root script runs `dev:client` and `dev:server`)
- Server-only: `npm run dev -w server`
- Client-only: `npm run dev -w client`
- DB schema / seed (drizzle workspace): `npm run push` then `npm run seed` (these are workspace scripts that run in `packages/drizzle`).
- E2E tests: the `tests-e2e` workspace uses Playwright. Run `npm run test` from the repo root (it runs the tests workspace). Tests expect the app to be running.

Files to inspect when making changes

- server/src/index.ts — Fastify bootstrap, registers tRPC and the auth proxy
- server/src/trpc.ts — tRPC procedure/context helpers and auth middlewares
- server/src/context.ts — how ctx.user and db are created (critical for auth-aware code)
- server/src/lib/auth.ts — better-auth config and Drizzle adapter wiring
- server/src/handlers/auth.ts — forwards /api/auth requests to better-auth
- server/src/router/\*.ts — example routers (sessionRouter, userRouter)
- client/src/lib/trpc.ts — client-side tRPC setup (credentials, backend URL)
- client/src/main.ts — app bootstrap and auth initialization (initializeAuth())
- packages/drizzle/\* — DB schema and seed logic

Common pitfalls and what to watch for

- Ports/URLs: client defaults to `VITE_URL_BACKEND` or `http://localhost:3001` while the server starts on `PORT` (default 2022). Verify `VITE_URL_BACKEND` or adjust the server port to match local dev expectations.
- Cookies and secure flags: Better Auth here uses `secure: true` and `sameSite: 'none'`. For local HTTP dev you may need to adjust env or run over HTTPS or relax cookie attributes.
- Avoid changing shared package versions lightly. `packages/*` are compiled and used by server/client — update carefully and run `npm run build:*`.
- Trpc context shape matters. Always preserve `{ req, res, db, config, user? }` when creating or mocking contexts.

How to add a new tRPC route (example)

1. Create `server/src/router/myFeature.ts` and export a default `router({...})` using `publicProcedure`/`protectedProcedure`.
2. Register it in `server/src/router/index.ts` by adding it to the `router({...})` map.
3. Use `opts.ctx.db` to query/update DB and `opts.ctx.user` for auth info.
4. Add client helpers in `client/src/lib/trpc.ts` types if you need typed RouterInput/Output.

When opening PRs for the codebase

- Run `npm run build` and affected workspace `npm run build -w <workspace>` prior to opening a PR.
- If the change touches DB schema, include `npm run push` and `npm run seed` steps or migrations where applicable.

If anything here is unclear or you want examples expanded (e.g., tests, auth flows, or cookie handling), say which area and I will expand the guidance or add concrete examples from the codebase.
