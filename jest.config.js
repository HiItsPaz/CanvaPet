// jest.config.js
const nextJest = require('next/jest');

// Providing the path to your Next.js app to load next.config.js and .env files in your test environment
const createJestConfig = nextJest({
  dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Use ts-jest for TypeScript files
  preset: 'ts-jest',

  // Test environment setup
  testEnvironment: 'jest-environment-jsdom',
  
  // Module name mapper to handle Next.js path aliases (e.g., @/components)
  moduleNameMapper: {
    '^@/(.*)$/': '<rootDir>/src/$1',
  },

  // Specify test file patterns
  testMatch: [
      '**/__tests__/**/*.[jt]s?(x)',
      '**/?(*.)+(spec|test).[tj]s?(x)'
  ],

  // Ignore node_modules, .next, etc.
  testPathIgnorePatterns: [
      '<rootDir>/.next/',
      '<rootDir>/node_modules/',
      '<rootDir>/cypress/' // Ignore Cypress tests
  ],
  
  // Transform settings for ts-jest
  transform: {
    '^.+\\.(ts|tsx)?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        // Use babel config if needed, especially for React/Next.js features
        // babelConfig: true, 
      },
    ],
    // Add other transformers if needed (e.g., for CSS Modules, SVGs)
  },

  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,

  // Collect coverage information
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8", // or "babel"
  // Specify paths to include/exclude from coverage
  collectCoverageFrom: [
      'src/**/*.{js,jsx,ts,tsx}',
      '!src/**/*.d.ts',
      '!src/**/_app.tsx',
      '!src/**/_document.tsx',
      '!src/pages/api/**', // Exclude API routes from frontend coverage
      '!src/lib/supabase/**', // Exclude Supabase client setup
      '!**/node_modules/**',
      '!**/vendor/**',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig); 