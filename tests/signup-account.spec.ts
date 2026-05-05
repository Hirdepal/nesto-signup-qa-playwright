import { expect, test } from '@playwright/test';
import { submitAndWaitForAccountCreation } from './support/accountApi';
import { AuthenticatedAppPage } from './support/authenticatedAppPage';
import { DisableAccountPage } from './support/disableAccountPage';
import { LoginPage } from './support/loginPage';
import { buildSignupData, languageFromProject } from './support/signupData';
import { SignupPage } from './support/signupPage';

const ACCOUNT_FLOW_TIMEOUT_MS = 90_000;

test.describe('signup account creation', () => {
  test('@smoke @account creates a valid account and verifies the user can log back in', async ({ page }, testInfo) => {
    test.setTimeout(ACCOUNT_FLOW_TIMEOUT_MS);

    const language = languageFromProject(testInfo.project.name);
    const signup = new SignupPage(page);
    const app = new AuthenticatedAppPage(page);
    const disableAccount = new DisableAccountPage(page);
    const login = new LoginPage(page);
    const data = buildSignupData(language);

    await signup.goto(language);
    await signup.fillValidSignupForm(data);

    // The submit helper retries once if the click does not send the account request.
    const accountResponse = await submitAndWaitForAccountCreation(page, () => signup.submit());
    const requestPayload = accountResponse.request().postDataJSON();
    const responsePayload = await accountResponse.json();

    // The exercise asks for both the 201 status and proof that the submitted form data is returned.
    expect(accountResponse.status()).toBe(201);
    expect(requestPayload).toMatchObject({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.normalizedPhone,
      region: data.provinceCode,
      language: data.language,
      leadDistributeConsentAgreement: true
    });
    expect(responsePayload.account).toMatchObject({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.normalizedPhone,
      region: data.provinceCode,
      preferredLanguage: data.language,
      leadDistributeConsentAgreement: true
    });

    // Creating the account is not enough; the new credentials should work after logout.
    await page.waitForURL(/\/getaquote/, { timeout: 20_000 });
    await app.expectSignedIn(data);

    await app.logout();
    await login.expectVisible();
    await login.login(data);
    await app.expectSignedIn(data);

    // Keep QA data tidy by disabling the account created during this test.
    await app.openDisableAccountPage();
    await disableAccount.disableAccount();
  });
});
