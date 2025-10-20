import { Locator, expect, BrowserContext, Page } from "@playwright/test";
import { BasePage } from "../BasePage";
import { CONFIG } from "config/urls";

export class MoroHomePage extends BasePage {
    private readonly MAIN_MENU_SELECTOR = '[id=menu-main]'
    private readonly MAIN_LINK_SELECTOR = '#menu-hlavni-menu a.m-main__link';
    private readonly HOME_URL_REGEX = /morosystems\.cz/;

    readonly mainMenu: Locator;
    readonly careerLink: Locator;

    constructor(context: BrowserContext, page: Page) {
        super(context, page);
        this.mainMenu = page.locator(this.MAIN_MENU_SELECTOR)
        this.careerLink = page.locator(this.MAIN_LINK_SELECTOR, { hasText: "Kariéra" });
    }

    async open() {
        await this.navigateTo(CONFIG.GUI.morosystems);
    }

    async verifyOnHomePage() {
        await expect(this.page).toHaveURL(this.HOME_URL_REGEX);
    }

    async navigateToCareerPage(vpName: string) {
        if (vpName === "Tablet" || vpName === "Mobile") {
            await this.mainMenu.click();
        }
        await this.careerLink.click();
    }
}