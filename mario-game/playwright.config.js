import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    fullyParallel: false,
    workers: 1,
    timeout: 20000,
    webServer: process.env.GAME_URL
        ? undefined
        : {
              command:
                  "npm run dev -- --host 127.0.0.1 --port 5174 --strictPort",
              url: "http://127.0.0.1:5174",
              reuseExistingServer: true,
          },
    use: {
        baseURL: process.env.GAME_URL || "http://127.0.0.1:5174",
        viewport: { width: 1440, height: 1100 },
        channel: process.env.CHROME_PATH ? undefined : "chrome",
        launchOptions: {
            executablePath: process.env.CHROME_PATH,
            args: ["--no-sandbox"],
        },
    },
});
