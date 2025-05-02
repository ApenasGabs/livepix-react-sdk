module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^.+\\.svg$': '<rootDir>/src/__mocks__/svgMock.js',
    '^.+\\.css$': '<rootDir>/src/__mocks__/styleMock.js'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__mocks__/**',
    '!src/types/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
