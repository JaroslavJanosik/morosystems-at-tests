import { BrowserContext, Page } from "@playwright/test";
import { GooglePage } from "@pages/google/GooglePage";
import { MoroHomePage } from "@pages/moroSystems/MoroHomePage";
import { MoroCareerPage } from "@pages/moroSystems/MoroCareerPage";

export class GUIContext {
  readonly context: BrowserContext;
  readonly page: Page;
  readonly google: GooglePage;
  readonly moroHome: MoroHomePage;
  readonly moroCareer: MoroCareerPage;

  constructor(context: BrowserContext, page: Page) {
    this.context = context;
    this.page = page;

    this.google = new GooglePage(context, page);
    this.moroHome = new MoroHomePage(context, page);
    this.moroCareer = new MoroCareerPage(context, page);
  }
}