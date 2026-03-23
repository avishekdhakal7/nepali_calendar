// Prevent Jest worker crashes on Windows CI
// "Jest worker encountered 2 child process exceptions, exceeding retry limit"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest')

const createJestConfig = nextJest()

const customJestConfig = {
  // Run workers one at a time — prevents spawn failures on Windows/macOS CI
  maxWorkers: 1,

  // Use a consistent port to avoid EADDRINUSE during parallel tests
  workerIdleMemoryLimit: '512MB',

  // Disable watch mode caching issues
  cacheDirectory: '<rootDir>/.jest-cache',

  // Skip node_modules automatically since testMatch isn't set
  testPathIgnorePatterns: ['/node_modules/'],

  // Reduce memory pressure
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
