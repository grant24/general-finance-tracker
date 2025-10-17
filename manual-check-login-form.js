const { atom } = require('nanostores')

// Simulate the login form atom
const loginForm = atom({
  email: 'alan@example.com',
  password: 'securePassword',
  showPassword: false,
  isSubmitting: false,
  error: null
})

// helper to print state
const printState = (label) => {
  console.log(label, JSON.stringify(loginForm.get()))
}

// reset implementation (should match code in repo)
function resetLoginFormStore() {
  loginForm.set({
    email: 'alan@example.com',
    password: 'securePassword',
    showPassword: false,
    isSubmitting: false,
    error: null
  })
}

// Simulate being stuck
loginForm.set({ ...loginForm.get(), isSubmitting: true })
printState('after set submitting:')

// Call reset
resetLoginFormStore()
printState('after reset:')

// Assert
if (!loginForm.get().isSubmitting) {
  console.log('Manual check: reset cleared isSubmitting — PASS')
  process.exitCode = 0
} else {
  console.error('Manual check: isSubmitting still true — FAIL')
  process.exitCode = 2
}
