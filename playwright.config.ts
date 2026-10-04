import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:5190";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  timeout: 45000,
  reporter: "html",
  use: { baseURL, trace: "retain-on-failure" },
  webServer: {
    command:
      "npm run build && npm run preview -- --host 127.0.0.1 --port 5190 --strictPort",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
});
