module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  moduleFileExtensions: ["js", "ts"],
  collectCoverageFrom: ["**/src/**/*.ts", "!**/node_modules/**"],
  testMatch: ["**/tests/unit/*.test.ts", "**/tests/integration/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
  testEnvironment: "node",
  coverageProvider: "v8",
};
