import { Locator, expect, BrowserContext, Page } from "@playwright/test";
import { BasePage } from "../BasePage";
import { CONFIG } from "@config/urls";

export class GooglePage extends BasePage {
    private readonly ACCEPT_COOKIES_BUTTON_SELECTOR = 'button:has-text("Přijmout vše")';
    private readonly SEARCH_BOX_SELECTOR = 'textarea[name="q"]';
    private readonly FIRST_RESULT_SELECTOR = 'div#search a';

    readonly acceptCookiesButton: Locator;
    readonly searchBox: Locator;
    readonly firstResult: Locator;

    constructor(context: BrowserContext, page: Page) {
        super(context, page);
        this.acceptCookiesButton = page.locator(this.ACCEPT_COOKIES_BUTTON_SELECTOR);
        this.searchBox = page.locator(this.SEARCH_BOX_SELECTOR);
        this.firstResult = page.locator(this.FIRST_RESULT_SELECTOR).first();
    }

    async open() {
        await this.navigateTo(CONFIG.GUI.google);
    }

    async acceptCookiesIfVisible() {
        if (await this.acceptCookiesButton.isVisible()) {
            await this.acceptCookiesButton.click();
        }
    }

    async search(query: string) {
        await this.searchBox.fill(query);
        await this.searchBox.press("Enter");
    }

    async assertFirstSearchResult(expectedUrlPart: string) {
        const href = await this.firstResult.getAttribute("href");
        expect(href).toContain(expectedUrlPart);
    }

    async clickFirstResult() {
        await this.firstResult.click();
    }
}