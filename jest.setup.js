// Import Jest DOM for enhanced DOM testing assertions
import "@testing-library/jest-dom"

// Mock Next.js router functionality
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "",
}))

// Mock SWR data fetching library
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: undefined,
    error: undefined,
    isValidating: false,
    mutate: jest.fn(),
  })),
}))

// Mock next-auth authentication
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
}

// Global fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
  }),
)

// Console error and warning handling
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

console.error = (...args) => {
  originalConsoleError(...args)
  // Error tracking disabled but available
}

console.warn = (...args) => {
  originalConsoleWarn(...args)
  // Warning tracking disabled but available
}

// Cleanup after tests
afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})