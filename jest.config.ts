import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Path to the Next.js app — lets next/jest load next.config.ts and .env files
  dir: './',
})

const config: Config = {
  // Default environment for all tests (UI components, hooks, etc.)
  testEnvironment: 'jest-environment-jsdom',

  // Run jest.setup.ts before each test suite (imports @testing-library/jest-dom matchers)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Resolve the @/* path alias declared in tsconfig.json
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Coverage settings
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
  ],
}

// createJestConfig is exported this way so next/jest can inject its async Next.js config
export default createJestConfig(config)
