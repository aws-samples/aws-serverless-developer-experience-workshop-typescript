module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.ts?$": ["ts-jest", {
      tsconfig: {
        skipLibCheck: true
      }
    }],
  },
  moduleFileExtensions: ["js", "ts"],
  collectCoverageFrom: ["**/src/**/*.ts", "!**/node_modules/**"],
  testMatch: ["**/tests/unit/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
  setupFiles: ["./tests/setup-env.js"],
  testEnvironment: "node",
  testSequencer: "./tests/alphabetical-sequencer.js",
  coverageProvider: "v8",
  coverageThreshold: {
    global: {
      lines: 63,
      functions: 70,
      branches: 49,
    },
  },
};