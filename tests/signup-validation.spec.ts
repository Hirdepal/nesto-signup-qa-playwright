import { test } from '@playwright/test';
import { expectNoAccountCreationRequest } from './support/accountApi';
import { languageFromProject } from './support/signupData';
import { SignupPage } from './support/signupPage';

test.describe('signup validation', () => {
  test('@regression @validation shows client-side validation for required fields without creating an account', async ({ page }, testInfo) => {
    const language = languageFromProject(testInfo.project.name);
    const signup = new SignupPage(page);

    await signup.goto(language);

    // Empty required fields should be caught in the browser, before account creation is attempted.
    await expectNoAccountCreationRequest(page, async () => {
      await signup.submit();
      await signup.expectRequiredErrors(language);
    });
  });

  test('@regression @validation shows client-side validation for invalid email, phone, and password values', async ({ page }, testInfo) => {
    const language = languageFromProject(testInfo.project.name);
    const signup = new SignupPage(page);

    await signup.goto(language);
    await signup.fillInvalidFormatForm();

    // Bad formats should also stay client-side and should not create partial accounts.
    await expectNoAccountCreationRequest(page, async () => {
      await signup.submit();
      await signup.expectValidationErrors(language);
    });
  });
});
