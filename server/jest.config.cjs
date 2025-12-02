const { createDefaultPreset } = require("ts-jest");

/** @type {import("jest").Config} **/
module.exports = {
  // ESM preset for ts-jest
  preset: "ts-jest/presets/default-esm",

  // Environment (node)
  testEnvironment: "node",

  // Treat .ts files as ESM
  extensionsToTreatAsEsm: [".ts"],

  // Map imports on .ts files
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  // How to transform ts files
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },

  // Where to look for test files
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],

  // Coverage report
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/index.ts"],

  // Setup file that executes before all tests
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],

  // 30s timeout for tests
  testTimeout: 30000,

  maxWorkers: 1,
};
