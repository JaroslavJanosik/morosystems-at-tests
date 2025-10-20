import { Locator, expect, BrowserContext, Page } from "@playwright/test";
import { BasePage } from "../BasePage";
import { CONFIG } from "@config/urls";

export class MoroCareerPage extends BasePage {
    private readonly CAREER_URL_REGEX = /.*\/kariera\/?/;
    private readonly CITY_SELECT_SELECTOR = ".inp-custom-select__select";
    private readonly JOB_ITEMS_SELECTOR = "li.c-positions__item";
    private readonly JOB_LOCATION_SELECTOR = ".c-positions__info span";
    private readonly CITY_FILTER_SELECTOR = 'label[data-filter="{city}"]';

    readonly citySelect: Locator;
    readonly jobItems: Locator;

    constructor(context: BrowserContext, page: Page) {
        super(context, page);
        this.citySelect = page.locator(this.CITY_SELECT_SELECTOR);
        this.jobItems = page.locator(this.JOB_ITEMS_SELECTOR);
    }

    async open() {
        await this.navigateTo(CONFIG.GUI.google);
    }

    async verifyOnCareerPage() {
        await expect(this.page).toHaveURL(this.CAREER_URL_REGEX);
    }

    async filterByCity(city: string) {
        await this.citySelect.click();
        const citySelector = this.CITY_FILTER_SELECTOR.replace("{city}", city);
        await this.page.locator(citySelector).click();
    }

    async assertJobLocations(city: string) {
        const visibleJobItems = this.jobItems.filter({ hasText: city });
        const count = await visibleJobItems.count();

        if (count === 0) {
            console.log(`No options found for ${city}.`);
        } else {
            for (let i = 0; i < count; i++) {
                const locationText = await visibleJobItems
                    .nth(i)
                    .locator(this.JOB_LOCATION_SELECTOR)
                    .textContent();
                expect(locationText?.toLowerCase()).toContain(city.toLowerCase());
            }
        }
    }
}