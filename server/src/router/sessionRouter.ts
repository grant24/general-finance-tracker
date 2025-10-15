import { adminProcedure, protectedProcedure, publicProcedure, router } from '../trpc'
import { z } from 'zod'
import { sessionTable } from '@fsb/drizzle'
import { drizzleOrm } from '@fsb/drizzle'
import { auth } from '../lib/auth'
const { count, eq } = drizzleOrm

const sessionRouter = router({
  login: publicProcedure.input(z.object({ email: z.string(), password: z.string() })).mutation(async (opts) => {
    console.log('login', opts.input)
    const response = await auth.api.signInEmail({
      body: {
        email: opts.input.email,
        password: opts.input.password
      },
      asResponse: true // returns a response object instead of data
    })
    console.log('response', response)

    // Set the cookie from the response headers
    const setCookieHeader = response.headers.get('set-cookie')
    if (setCookieHeader) {
      opts.ctx.res.header('Set-Cookie', setCookieHeader)
    }

    // Extract user agent and IP address from request headers
    const userAgent = Array.isArray(opts.ctx.req.headers['user-agent'])
      ? opts.ctx.req.headers['user-agent'][0]
      : opts.ctx.req.headers['user-agent'] || ''

    const ipAddress =
      (Array.isArray(opts.ctx.req.headers['x-forwarded-for'])
        ? opts.ctx.req.headers['x-forwarded-for'][0]
        : opts.ctx.req.headers['x-forwarded-for']
      )
        ?.split(',')[0]
        ?.trim() ||
      (Array.isArray(opts.ctx.req.headers['x-real-ip'])
        ? opts.ctx.req.headers['x-real-ip'][0]
        : opts.ctx.req.headers['x-real-ip']) ||
      (Array.isArray(opts.ctx.req.headers['cf-connecting-ip'])
        ? opts.ctx.req.headers['cf-connecting-ip'][0]
        : opts.ctx.req.headers['cf-connecting-ip']) ||
      (Array.isArray(opts.ctx.req.headers['x-client-ip'])
        ? opts.ctx.req.headers['x-client-ip'][0]
        : opts.ctx.req.headers['x-client-ip']) ||
      ''

    console.log('Login userAgent:', userAgent)
    console.log('Login ipAddress:', ipAddress)

    // Update the session with user agent and IP address if we have session data
    try {
      // Convert Fastify headers to standard Headers object
      const headers = new Headers()
      Object.entries(opts.ctx.req.headers).forEach(([key, value]) => {
        if (value) headers.append(key, Array.isArray(value) ? value.join(', ') : value)
      })

      const sessionData = await auth.api.getSession({
        headers
      })

      if (sessionData?.session?.id) {
        await opts.ctx.db
          .update(sessionTable)
          .set({
            userAgent: userAgent,
            ipAddress: ipAddress
          })
          .where(eq(sessionTable.id, sessionData.session.id))

        console.log('Updated session with userAgent and ipAddress')
      }
    } catch (error) {
      console.log('Error updating session:', error)
    }

    return true
  }),
  signup: publicProcedure
    .input(z.object({ email: z.string(), password: z.string(), name: z.string() }))
    .mutation(async (opts) => {
      console.log('signup', opts.input)
      const response = await auth.api.signUpEmail({
        body: {
          email: opts.input.email,
          password: opts.input.password,
          name: opts.input.name
        },
        asResponse: true
      })
      console.log('response', response)
      // Set the cookie from the response headers
      const setCookieHeader = response.headers.get('set-cookie')
      if (setCookieHeader) {
        opts.ctx.res.header('Set-Cookie', setCookieHeader)
      }

      // Extract user agent and IP address from request headers
      const userAgent = Array.isArray(opts.ctx.req.headers['user-agent'])
        ? opts.ctx.req.headers['user-agent'][0]
        : opts.ctx.req.headers['user-agent'] || ''

      const ipAddress =
        (Array.isArray(opts.ctx.req.headers['x-forwarded-for'])
          ? opts.ctx.req.headers['x-forwarded-for'][0]
          : opts.ctx.req.headers['x-forwarded-for']
        )
          ?.split(',')[0]
          ?.trim() ||
        (Array.isArray(opts.ctx.req.headers['x-real-ip'])
          ? opts.ctx.req.headers['x-real-ip'][0]
          : opts.ctx.req.headers['x-real-ip']) ||
        (Array.isArray(opts.ctx.req.headers['cf-connecting-ip'])
          ? opts.ctx.req.headers['cf-connecting-ip'][0]
          : opts.ctx.req.headers['cf-connecting-ip']) ||
        (Array.isArray(opts.ctx.req.headers['x-client-ip'])
          ? opts.ctx.req.headers['x-client-ip'][0]
          : opts.ctx.req.headers['x-client-ip']) ||
        ''

      console.log('Signup userAgent:', userAgent)
      console.log('Signup ipAddress:', ipAddress)

      // Update the session with user agent and IP address if we have session data
      try {
        // Convert Fastify headers to standard Headers object
        const headers = new Headers()
        Object.entries(opts.ctx.req.headers).forEach(([key, value]) => {
          if (value) headers.append(key, Array.isArray(value) ? value.join(', ') : value)
        })

        const sessionData = await auth.api.getSession({
          headers
        })

        if (sessionData?.session?.id) {
          await opts.ctx.db
            .update(sessionTable)
            .set({
              userAgent: userAgent,
              ipAddress: ipAddress
            })
            .where(eq(sessionTable.id, sessionData.session.id))

          console.log('Updated signup session with userAgent and ipAddress')
        }
      } catch (error) {
        console.log('Error updating signup session:', error)
      }

      return true
    }),

  deleteSession: adminProcedure
    .input(
      z.object({
        sessionId: z.string()
      })
    )
    .mutation(async (opts) => {
      const db = opts.ctx.db
      await db.delete(sessionTable).where(eq(sessionTable.id, opts.input.sessionId))

      return true
    }),

  getSessions: protectedProcedure
    .input(
      z.object({
        page: z.number(),
        search: z.string().optional(),
        userId: z.string().optional()
      })
    )
    .query(async (opts) => {
      const page = opts.input.page
      const limit = 12
      const db = opts.ctx.db
      const sessions = await db.query.sessionTable.findMany({
        limit,
        offset: (page - 1) * limit,

        columns: {
          id: true,
          createdAt: true,
          userAgent: true,
          ipAddress: true
        },
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              image: true
            }
          }
        },

        where: opts.input.userId ? eq(sessionTable.userId, opts.input.userId) : undefined
      })

      const totalData = await db.select({ count: count() }).from(sessionTable)
      // .where(opts.input.search ? ilike(devicesTable.name, `%${opts.input.search}%`) : undefined)
      const total = totalData[0].count

      return { sessions, page, limit, total }
    })
})

export default sessionRouter
