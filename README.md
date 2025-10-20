# MoroSystems Automated Tests (Playwright + TypeScript)

End-to-end **GUI** and **API** tests using [Playwright](https://playwright.dev/) with **TypeScript**.

The suite covers:

- **GUI:** From Google search to the **MoroSystems** website, then to the **Kariéra** page with job filtering by city. Runs on **Desktop / Tablet / Mobile** viewports.
- **API:** A To-Do Tasks REST API with full **CRUD** plus **complete** flow.

Tested with **Playwright 1.44.x** (see `Dockerfile`) and **Node.js 18+** (Node **20 LTS** recommended).

---

## Why this project exists

This repository demonstrates a practical, maintainable Playwright setup: Page Objects, a light GUI test context, sensible path aliases, and CI-friendly reporting.

---

## Features

- Playwright test runner in **TypeScript**
- **Page Object Model** (`pages/*`) and **GUI context** (`test-context/GUIContext.ts`)
- **Responsive checks** (Desktop / Tablet / Mobile)
- **HTML report** (`npx playwright show-report`)
- **Allure** results via `allure-playwright`
- **ESLint** + **Prettier**
- **Dockerfile** for containerized runs
- **GitHub Actions** workflow (`.github/workflows/playwright.yml`)
- Clean **path aliases** (`@pages/*`, `@config/*`, `@context/*`, `@support/*`)

---

## Project structure

```text
morosystems-at-tests/
├─ .env.dev
├─ Dockerfile
├─ README.md
├─ package.json
├─ playwright.config.ts
├─ tsconfig.json
├─ .github/
│  └─ workflows/
│     └─ playwright.yml
├─ config/
│  └─ urls.ts
├─ pages/
│  ├─ BasePage.ts
│  ├─ google/
│  │  └─ GooglePage.ts
│  └─ moroSystems/
│     ├─ MoroHomePage.ts
│     └─ MoroCareerPage.ts
├─ test-context/
│  └─ GUIContext.ts
├─ test-support/
│  └─ types/
│     └─ Task.ts
└─ tests/
   ├─ api/
   │  └─ todo-tasks-api.spec.ts
   └─ gui/
      └─ google-morosystems-career.spec.ts
```

---

## Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **npm** 8+
- Playwright browsers installed locally (see below)
- A reachable To-Do Tasks API for the API tests (defaults in `.env.dev`)

---

## Configuration

Environment variables load from `.env.{NODE_ENV}`.  
If `NODE_ENV` is unset, it falls back to `dev` → `.env.dev`.

Included `.env.dev`:

```dotenv
TODO_TASKS_API_URL=http://localhost:8080
GOOGLE_URL=https://www.google.com
MOROSYSTEMS_URL=https://www.morosystems.cz
MORO_CAREER_URL=https://www.morosystems.cz/kariera/
```

Create your own `.env.local`, `.env.ci`, etc., and start tests with `NODE_ENV=local` (or `ci`) to pick the right file.

---

## Quick start

```bash
# 1) Install dependencies
npm ci

# 2) Install Playwright browsers & Linux deps
npx playwright install --with-deps

# 3) (Optional) select env file
export NODE_ENV=dev   # uses .env.dev

# 4) Run everything (GUI + API)
npm test
```

Open the Playwright HTML report:

```bash
npm run test:report
# or
npx playwright show-report
```

Helpful scripts:

```bash
npm run test:headed   # run in a real browser
npm run test:debug    # open Playwright inspector
npm run format        # Prettier
npm run lint          # ESLint
```

---

## What the tests cover

### GUI (`tests/gui/google-morosystems-career.spec.ts`)

- Open **Google**, accept cookies if the consent dialog shows up.
- Search for **“MoroSystems”** and assert the top result points to `morosystems.cz`.
- Open the **MoroSystems** homepage and navigate to **Kariéra**.
- On Kariéra, filter jobs by **city** (e.g., *Praha*, *Brno*).
- Assert all visible job cards match the selected city.
- Repeat the flow on **Desktop (1920×1080)**, **Tablet (768×1024)**, and **Mobile (375×812)** and ensure there’s **no horizontal overflow**.

Key Page Objects:
- `pages/google/GooglePage.ts`
- `pages/moroSystems/MoroHomePage.ts`
- `pages/moroSystems/MoroCareerPage.ts`

### API (`tests/api/todo-tasks-api.spec.ts`)

Targets `{CONFIG.API.toDoTasks}` (see `.env.*`).

Endpoints used:

- `GET /tasks`
- `POST /tasks` (body: `{ text: string }`)
- `GET /tasks/:id`
- `POST /tasks/:id` (update text)
- `POST /tasks/:id/complete` (mark as completed, set `completedDate`)
- `DELETE /tasks/:id`

Expected `Task` shape (`test-support/types/Task.ts`):

```ts
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdDate: number;
  completedDate?: number;
}
```

> By default, tests expect the API at **{TODO_TASKS_API_URL}** (see `.env.dev`). Adjust as needed.

---

## Running specific things

Projects are defined in `playwright.config.ts` (Chromium/Chrome, Firefox, WebKit/Safari, Edge).  
Artifacts (screenshots, videos) go to `test-results/`. HTML and Allure reporters are enabled.

Run a single project:

```bash
npx playwright test --project=Chromium
# or: Chrome / Firefox / WebKit / Edge
```

Run only GUI or only API:

```bash
npx playwright test tests/gui
npx playwright test tests/api
```

Run a single spec or test title:

```bash
npx playwright test tests/gui/google-morosystems-career.spec.ts -g "Viewport: Desktop"
```

---

## Reports

### Playwright HTML

```bash
npm run test:report
```

### Allure (optional)

This repo writes results to `allure-results/` via `allure-playwright`.  
To view, install the Allure CLI locally:

```bash
allure generate --clean allure-results && allure open
```

---

## Docker

A ready-to-use Playwright base image is defined in `Dockerfile`.

Build:

```bash
docker build -t morosystems-tests .
```

Run:

```bash
docker run --rm -it \
  --ipc=host \
  -e NODE_ENV=dev \
  -e TODO_TASKS_API_URL=http://host.docker.internal:8080 \
  morosystems-tests
```

> On Linux, `host.docker.internal` might not resolve. Use your host IP, or run the API in another container on the same Docker network.

---

## Path aliases

Defined in `tsconfig.json`:

```jsonc
"baseUrl": ".",
"paths": {
  "@pages/*":   ["pages/*"],
  "@context/*": ["test-context/*"],
  "@support/*": ["test-support/*"],
  "@config/*":  ["config/*"]
}
```

Usage:

```ts
import { GUIContext } from "@context/GUIContext";
import { CONFIG } from "@config/urls";
```

---

## Troubleshooting

- **Google consent button not found**  
  The selector targets Czech (“Přijmout vše”). If your Google locale differs, update the selector in `GooglePage.ts`.

- **Headless vs. headed**  
  Default is `headless: true` in `playwright.config.ts`. Override with `PW_HEADLESS=0` or run `npx playwright test --headed`.

- **API tests failing**  
  Ensure your API implements the endpoints above and matches the `Task` interface. Check your base URL from `.env.{NODE_ENV}`.

- **CI flakiness**  
  Retries and worker limits are enabled in CI. If you see timeouts, check network stability and increase timeouts only where it’s genuinely needed.

---