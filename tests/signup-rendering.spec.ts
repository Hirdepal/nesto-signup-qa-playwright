import { expect, test } from '@playwright/test';
import { languageFromProject } from './support/signupData';
import { SignupPage, signupCopy } from './support/signupPage';

test.describe('signup rendering and localization', () => {
  test('@regression @localization renders localized signup fields, labels, links, and controls', async ({ page }, testInfo) => {
    const language = languageFromProject(testInfo.project.name);
    const signup = new SignupPage(page);

    await signup.goto(language);

    // Basic page smoke check: the correct localized copy and controls are present.
    await signup.expectLocalizedPage(language);
    await expect(signup.consent).not.toBeChecked();
    await expect(signup.submitButton).toBeEnabled();
  });

  test('@regression @localization language switch navigates between English and French signup pages', async ({ page }, testInfo) => {
    const language = languageFromProject(testInfo.project.name);
    const expectedTargetLanguage = language === 'en' ? 'fr' : 'en';
    const signup = new SignupPage(page);

    await signup.goto(language);

    // The language toggle should keep the user on the signup flow, only changing locale.
    await page.getByTestId('header-language-switch').click();
    await expect.poll(() => new URL(page.url()).pathname).toBe(signupCopy[expectedTargetLanguage].path);
    await signup.expectLocalizedPage(expectedTargetLanguage);
  });
});
