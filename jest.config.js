module.exports = {
    preset: "ts-jest",
    transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }] },
    testEnvironment: "node",
    setupFiles: ["<rootDir>/jest.setup.js"], // ✅ Load env before tests
    testPathIgnorePatterns: ["/node_modules/", "/.next/"],
    moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  };
