import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // Base tsconfig.json excludes tests/, so point the path-alias plugin at
  // tsconfig.test.json (which extends it and includes tests/) — otherwise
  // "@/..." imports don't resolve inside test files.
  plugins: [tsconfigPaths({ projects: ["tsconfig.test.json"] }), react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules/**"],
  },
});
