import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";
import { type JestConfigWithTsJest, createDefaultPreset } from "ts-jest";

const defaultPreset = createDefaultPreset();

const jestConfig: JestConfigWithTsJest = {
  ...defaultPreset,
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  preset: "ts-jest",
  setupFilesAfterEnv: ["./src/configs/jest-setup.config.ts"],
  testMatch: ["**/__tests__/(unit|integration)/**/*.test.[t]s"],
  clearMocks: true,
};

export default jestConfig;
