import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'https://app.qa.nesto.ca';
const isCI = !!process.env.CI;
const recordArtifacts = process.env.PW_RECORD_ARTIFACTS === 'true';
const configuredWorkers = Number(process.env.PLAYWRIGHT_WORKERS ?? 1);
const workers = Number.isFinite(configuredWorkers) && configuredWorkers > 0 ? configuredWorkers : 1;

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results/artifacts',
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers,
  reporter: isCI
    ? [
        ['line'],
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }]
      ]
    : [
        ['list'],
        ['html', { open: 'never' }]
      ],
  use: {
    baseURL,
    trace: recordArtifacts ? 'retain-on-failure' : 'off',
    screenshot: recordArtifacts ? 'only-on-failure' : 'off',
    video: recordArtifacts ? 'retain-on-failure' : 'off'
  },
  projects: [
    {
      name: 'chromium-en',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'en-CA',
        extraHTTPHeaders: {
          'Accept-Language': 'en-CA,en;q=0.9'
        }
      }
    },
    {
      name: 'chromium-fr',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'fr-CA',
        extraHTTPHeaders: {
          'Accept-Language': 'fr-CA,fr;q=0.9,en;q=0.8'
        }
      }
    }
  ]
});
