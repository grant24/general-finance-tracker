import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../../../server/src/router/index.js'
import { inferRouterOutputs, inferRouterInputs } from '@trpc/server'

const url = import.meta.env.VITE_URL_BACKEND || 'http://localhost:3001'

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${url}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include' // Include cookies in requests
        })
      },
      headers: async () => {
        // Add headers for authentication HERE if needed
        return {}
      }
    })
  ]
})

export type RouterOutput = inferRouterOutputs<AppRouter>
export type RouterInput = inferRouterInputs<AppRouter>
