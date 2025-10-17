import { chromium } from 'playwright'

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle' })

    // Navigate to login page
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle' })

    // Fill login form (using seeded demo credentials from the store)
    await page.fill('#email-input input', 'alan@example.com')
    await page.fill('#password-input input', 'securePassword')

    // Click login button
    await page.click('#login-button')

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 })

    // Click logout
    await page.click('#logout-button')

    // Wait for navigation to login
    await page.waitForURL('**/login', { timeout: 5000 })

    // Check that the login button is not in loading state
    const loading = await page.getAttribute('#login-button', 'loading')
    const disabled = await page.getAttribute('#login-button', 'disabled')

    console.log('login button loading attr:', loading)
    console.log('login button disabled attr:', disabled)

    if (loading || disabled) {
      console.error('Login button still busy after logout')
      process.exitCode = 2
    } else {
      console.log('Login button is idle — success')
    }
  } catch (err) {
    console.error('E2E check failed:', err)
    process.exitCode = 1
  } finally {
    await browser.close()
  }
})()
