import { test, expect } from "@playwright/test";
import { GUIContext } from "@context/GUIContext";

const VIEWPORTS = [
    { name: "Desktop", width: 1920, height: 1080 },
    // { name: "Tablet", width: 768, height: 1024 },
    // { name: "Mobile", width: 375, height: 812 },
];

test.describe("MoroSystems Career Page - Responsive UI Verification", () => {
    for (const { name, width, height } of VIEWPORTS) {
        test(`Viewport: ${name} (${width}×${height})`, async ({ context, page }) => {
            await page.setViewportSize({ width, height });
            const gui = new GUIContext(context, page);

            const searchQuery = "MoroSystems";
            const expectedUrl = "www.morosystems.cz";
            const targetCity = "Brno";

            await test.step("Google Search → MoroSystems", async () => {
                await gui.google.open();
                await gui.google.acceptCookiesIfVisible();
                await gui.google.search(searchQuery);
                await gui.google.assertFirstSearchResult(expectedUrl);
                await gui.google.clickFirstResult();
            });

            await test.step("Verify MoroSystems Home Page", async () => {
                await gui.moroHome.verifyOnHomePage();
                // await expect(page).toHaveScreenshot(`home-${name}.png`, { fullPage: true });
            });

            await test.step("Navigate to 'Kariéra' Page", async () => {
                await gui.moroHome.navigateToCareerPage(name);
                await gui.moroCareer.verifyOnCareerPage();
                // await expect(page).toHaveScreenshot(`career-${name}.png`, { fullPage: true });
            });

            await test.step(`Filter by city: ${targetCity}`, async () => {
                await gui.moroCareer.filterByCity(targetCity);
                await gui.moroCareer.assertJobLocations(targetCity);
            });

            await test.step("Validate layout has no horizontal overflow", async () => {
                const hasOverflow = await page.evaluate(
                    () => document.body.scrollWidth > window.innerWidth
                );
                expect(hasOverflow, "Page should not have horizontal overflow").toBeFalsy();
            });
        });
    }
});