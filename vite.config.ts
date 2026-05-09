import babel from "@rolldown/plugin-babel";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { nitro } from "nitro/vite";
import type { PluginOption } from "vite";
import { postgres } from "vite-plugin-neon-new";
import { defineConfig, type UserConfig } from "vite-plus";

dotenv.config();

const plugins: PluginOption[] = [
  tanstackStart(),
  viteReact(),
  devtools(),
  // https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#react-compiler
  babel({
    presets: [reactCompilerPreset()],
  }),
  tailwindcss(),
  nitro({
    //   // fixes SSR issues with Vite 8:
    //   // https://discord.com/channels/719702312431386674/1490005967067414608/1490634230458224751
    traceDeps: ["react", "react-dom"],
    preset: "vercel",
  }),
];

export default defineConfig({
  server: {
    port: 3000,
    plugins: [
      ...plugins,
      postgres({
        referrer: "https://github.com/CarlosZiegler/fullstack-start-template",
      }),
    ],
  },
  build: [
    ...plugins,
    sentryVitePlugin({
      org: process.env.VITE_SENTRY_ORG,
      project: process.env.VITE_SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      //   // Only print logs for uploading source maps in CI
      //   // Set to `true` to suppress logs
      //   // silent: !process.env.CI,
      //   // disable: process.env.NODE_ENV === "development",
    }),
  ],
  // Git hooks for staged files - https://viteplus.dev/guide/commit-hooks
  staged: {
    "*": "vp fmt --no-error-on-unmatched-pattern",
  },

  // Oxfmt - https://oxc.rs/docs/guide/usage/formatter/config.html
  fmt: {
    tabWidth: 2,
    semi: true,
    printWidth: 100,
    singleQuote: false,
    endOfLine: "lf",
    trailingComma: "all",
    sortImports: {},
    sortTailwindcss: {
      stylesheet: "./src/styles.css",
      attributes: ["class", "className"],
      functions: ["clsx", "cn", "cva", "tw"],
    },
    sortPackageJson: true,
    ignorePatterns: [
      "pnpm-lock.yaml",
      "package-lock.json",
      "yarn.lock",
      "bun.lock",
      "routeTree.gen.ts",
      ".tanstack-start/",
      ".tanstack/",
      "drizzle/",
      "migrations/",
      ".drizzle/",
      ".cache",
      "worker-configuration.d.ts",
      ".vercel",
      ".output",
      ".wrangler",
      ".netlify",
      "dist",
    ],
  },

  // Oxlint - https://oxc.rs/docs/guide/usage/linter/config
  lint: {
    plugins: ["typescript", "react", "react-perf", "jsx-a11y"],
    env: {
      builtin: true,
      node: true,
      browser: true,
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      { name: "react-hooks-js", specifier: "eslint-plugin-react-hooks" },
      // Plugins with "/" in name have to be aliased for now
      // Issue: https://github.com/oxc-project/oxc/issues/14557
      {
        name: "eslint-tanstack-router",
        specifier: "@tanstack/eslint-plugin-router",
      },
      {
        name: "eslint-tanstack-query",
        specifier: "@tanstack/eslint-plugin-query",
      },
    ],
    rules: {
      "no-deprecated": "warn",
      "typescript/no-floating-promises": "off",
      "typescript/no-misused-spread": "off",

      "eslint-tanstack-router/create-route-property-order": "warn",

      "eslint-tanstack-query/exhaustive-deps": "warn",
      "eslint-tanstack-query/stable-query-client": "warn",
      "eslint-tanstack-query/no-rest-destructuring": "warn",
      "eslint-tanstack-query/no-unstable-deps": "warn",
      "eslint-tanstack-query/infinite-query-property-order": "warn",
      "eslint-tanstack-query/no-void-query-fn": "warn",
      "eslint-tanstack-query/mutation-property-order": "warn",

      // ref:
      // - https://github.com/TheAlexLichter/oxlint-react-compiler-rules/issues/1
      // - https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/README.md#custom-configuration
      // Recommended rules (from LintRulePreset.Recommended)
      "react-hooks-js/config": "error",
      "react-hooks-js/error-boundaries": "error",
      "react-hooks-js/gating": "error",
      "react-hooks-js/globals": "error",
      "react-hooks-js/immutability": "error",
      "react-hooks-js/incompatible-library": "warn",
      "react-hooks-js/preserve-manual-memoization": "error",
      "react-hooks-js/purity": "error",
      "react-hooks-js/refs": "error",
      "react-hooks-js/set-state-in-effect": "warn",
      "react-hooks-js/set-state-in-render": "error",
      "react-hooks-js/static-components": "error",
      "react-hooks-js/unsupported-syntax": "warn",
      "react-hooks-js/use-memo": "error",
      // Recommended-latest rules (from LintRulePreset.RecommendedLatest)
      "react-hooks-js/void-use-memo": "error",
    },
    ignorePatterns: [
      "dist",
      ".wrangler",
      ".vercel",
      ".netlify",
      ".output",
      "build/",
      "worker-configuration.d.ts",
      "scripts/",
    ],
  },

  // Vite Task
  // https://viteplus.dev/config/run
  // https://viteplus.dev/guide/run
  // https://viteplus.dev/guide/cache
  run: {
    tasks: {
      build: {
        command: "SENTRY_LOG_LEVEL=debug vp build",
        env: ["NODE_ENV", "VITE_*"],
        input: [
          { auto: true },
          "!**/.output/**",
          "!**/.vercel/**",
          "!**/.netlify/**",
          "!**/build/**",
          "!**/.wrangler/**",
          "!**/dist/**",
          "!**/*.tsbuildinfo",
          "!**/node_modules/.vite/**",
          "!**/node_modules/.vite-temp/**",
          "!**/node_modules/.nitro/**",
        ],
      },
    },
  },

  optimizeDeps: {
    entries: ["src/**/*.tsx", "src/**/*.ts"],
    exclude: ["pdfjs", "pdf-parse"],
  },
  resolve: {
    tsconfigPaths: true,
  },

  plugins,
} as UserConfig);
