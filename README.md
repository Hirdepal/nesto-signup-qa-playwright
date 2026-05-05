# nesto Signup QA Playwright

Playwright and TypeScript tests for the nesto signup exercise. The main smoke test creates a QA account, validates the account API response, logs out, logs back in, and disables the account afterward.

## Coverage

- English and French signup routes
- Field labels, language switch, consent checkbox, and submit button
- Empty form validation without calling `POST /api/accounts`
- Invalid phone, email, password length, and password mismatch
- Successful account creation with `201` API validation
- Logout and login with the newly created user
- Cleanup through the account disable flow

## Project Layout

```text
.
|-- .github/workflows/playwright.yml
|-- tests/
|   |-- signup-account.spec.ts
|   |-- signup-rendering.spec.ts
|   |-- signup-validation.spec.ts
|   `-- support/
|       |-- accountApi.ts
|       |-- authenticatedAppPage.ts
|       |-- disableAccountPage.ts
|       |-- loginPage.ts
|       |-- signupData.ts
|       `-- signupPage.ts
|-- BUG_REPORT.txt
|-- Dockerfile
|-- docker-compose.yml
|-- playwright.config.ts
`-- package.json
```

## Setup

```bash
npm ci
npx playwright install chromium
```

## Run

```bash
npm test
```

`npm test` runs serially by default. Use `npm run test:parallel` when you want the two language projects to run with 2 workers.

Useful commands:

```bash
npm run preflight
npm run typecheck
npm run test:parallel
npm run test:smoke
npm run report
```

## Docker

```bash
docker build -t nesto-signup-qa-playwright .
docker run --rm nesto-signup-qa-playwright
```

With Compose:

```bash
docker compose up --build --abort-on-container-exit
```

## Assumptions

- Playwright is acceptable because the exercise allows Cypress or Playwright.
- "Both languages" means `/signup` and `/fr/signup`.
- Positive tests can create borrower accounts in QA as long as they disable them afterward.
- The QA backend rejected `example.com`, so generated emails default to `gmail.com`.
- Chromium is enough for this exercise unless cross-browser coverage is requested.
- Analytics and advertising calls are blocked because they are outside the signup contract.

## CI

CI is configured through GitHub Actions in `.github/workflows/playwright.yml`.

GitHub Actions runs:

1. `npm ci`
2. `npx playwright install --with-deps chromium`
3. `npm run preflight`
4. `npm test`

Reports are uploaded from `playwright-report/` and `test-results/`.

## Security Notes

No real credentials are needed. `.env`, auth state files, Playwright reports, traces, screenshots, and videos are ignored.

Rich artifacts are off by default because account creation responses can include sensitive data. Enable them locally only when debugging:

```bash
PW_RECORD_ARTIFACTS=true npm test
```

## Extending The Suite

Keep selectors and shared actions in `tests/support/`, keep generated data in `signupData.ts`, and avoid fixed sleeps. New signup coverage should pass in both language projects unless the scenario is intentionally language-specific.

Future work I would do next:

- Add a light accessibility check for the French signup page.
- Add orphan account cleanup only after there is a supported account search endpoint. Then a scheduled job could find generated test emails by prefix and date, delete them in small batches, and pause between calls.

Bugs found during testing are documented in `BUG_REPORT.txt`.
