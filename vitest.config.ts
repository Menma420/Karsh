import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["apps/**/*.test.ts", "packages/**/*.test.ts"],
    alias: {
      "@personal-capability-os/shared-types": path.resolve(__dirname, "./packages/shared-types/src"),
    },
  },
});
