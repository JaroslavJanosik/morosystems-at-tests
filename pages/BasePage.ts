import { BrowserContext, Page } from "@playwright/test";

export class BasePage {
    readonly context: BrowserContext;
    readonly page: Page;

    constructor(context: BrowserContext, page: Page) {
        this.context = context;
        this.page = page;
    }

    async navigateTo(url: string) {
        await this.page.goto(url);
    }
}