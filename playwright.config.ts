import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 45000,
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://127.0.0.1:5173",
    browserName: "chromium",
    headless: true,
    viewport: { width: 1440, height: 1050 },
    launchOptions: {
      channel: process.env.TEST_BROWSER || "msedge",
      args: ["--enable-webgl", "--ignore-gpu-blocklist"],
    },
  },
  workers: 1,
  reporter: "list",
});
