import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: ["**/node_modules", "**/.aws-sam", "**/template.yaml", "**/cdk.out", "**/.github", "**/jest.config.js", "**/.prettierrc.js", "**/setup-env.js"],
  },
  eslint.configs.recommended,
  tseslint.configs.stylistic,
  prettierConfig,
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "error"
    }
  }
);