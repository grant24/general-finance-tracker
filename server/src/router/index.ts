import sessionRouter from './sessionRouter'
import userRouter from './userRouter'
import { router } from '../trpc'

export const appRouter = router({
  session: sessionRouter,
  user: userRouter
})

export type AppRouter = typeof appRouter
