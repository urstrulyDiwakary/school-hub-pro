import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Pin timezone so date formatting in snapshots is deterministic across machines.
    env: { TZ: "UTC" },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
