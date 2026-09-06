import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "tonight.spec.ts",
  fullyParallel: true,
  reporter: "list",
  outputDir:
    "/tmp/claude-1000/-home-rwreplog-code-pop-culture-tracker/297df59b-4db5-4f7b-af1a-01f367ff3393/scratchpad/test-results",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: { MEDIA_PROVIDER_MODE: "fixture", PORT: String(PORT) },
  },
});
