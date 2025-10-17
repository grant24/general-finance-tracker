import { test, expect } from '@playwright/test'

// Test that the profile page shows a loading spinner and then the profile content
test('profile page loads profile after fetch', async ({ page, baseURL }) => {
  // Intercept TRPC requests and respond with a profile for getUserProfile
  await page.route('**/trpc', async (route) => {
    const request = route.request()
    const post = await request.postDataJSON().catch(() => null)
    if (post && post[0] && post[0].method && post[0].method.includes('getUserProfile')) {
      // simulate network delay
      await new Promise((r) => setTimeout(r, 200))
      // trpc batch responses: respond with array
      const body = [{ result: { data: { id: 'test-user', name: 'Test User', email: 'test@example.com' } } }]
      return route.fulfill({ status: 200, body: JSON.stringify(body), contentType: 'application/json' })
    }
    // fallback - continue
    return route.continue()
  })

  await page.goto('/profile')

  // Spinner should be visible initially
  await expect(page.locator('sl-spinner')).toBeVisible()

  // After fetch, profile name should be visible
  await expect(page.locator('text=Test User')).toBeVisible({ timeout: 5000 })
})
