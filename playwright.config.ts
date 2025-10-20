import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    fullyParallel: true,
    timeout: 60 * 1000,
    expect: {
        timeout: 5000,
    },

    reporter: [["list"], ["html", { open: "never" }], ['allure-playwright']],

    use: {
        headless: true,
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        trace: "retain-on-failure",
        viewport: { width: 1280, height: 720 },
    },

    projects: [
        {
            name: "Chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "Firefox",
            use: { ...devices["Desktop Firefox"] },
        },
        {
            name: "WebKit",
            use: { ...devices["Desktop Safari"] },
        },
        {
            name: "Edge",
            use: {
                ...devices["Desktop Chrome"],
                channel: "msedge",
            },
        },
    ],

    outputDir: "test-results/",

    retries: 0,
    workers: process.env.CI ? 2 : undefined,
});