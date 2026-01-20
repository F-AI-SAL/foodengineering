import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: "\\.e2e-spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "tsconfig.json" }]
  },
  moduleNameMapper: {
    "^file-type$": "<rootDir>/test/mocks/file-type.ts"
  },
  testEnvironment: "node",
  detectOpenHandles: true,
  forceExit: true,
  testTimeout: 20000
};

export default config;
