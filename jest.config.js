module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFiles: ["<rootDir>/jest.setup.js"], // ✅ Load env before tests
    testPathIgnorePatterns: ["/node_modules/", "/.next/"],
    moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  };
