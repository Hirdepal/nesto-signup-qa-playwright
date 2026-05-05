import { expect, type Page, type Request, type Response } from '@playwright/test';

const ACCOUNT_CREATION_ATTEMPTS = 2;
const ACCOUNT_REQUEST_TIMEOUT_MS = 3_000;
const ACCOUNT_RESPONSE_TIMEOUT_MS = 35_000;

export function isAccountCreationRequest(request: Request) {
  return request.method() === 'POST' && request.url().includes('/api/accounts');
}

export function isAccountCreationResponse(response: Response) {
  return isAccountCreationRequest(response.request());
}

export function isAccountDeletionResponse(response: Response) {
  return response.request().method() === 'POST' && response.url().includes('/api/account/deletion');
}

export async function submitAndWaitForAccountCreation(page: Page, submit: () => Promise<void>) {
  for (let attempt = 1; attempt <= ACCOUNT_CREATION_ATTEMPTS; attempt += 1) {
    const accountRequestPromise = waitForAccountCreationRequest(page);
    const accountResponsePromise = page
      .waitForResponse(isAccountCreationResponse, { timeout: ACCOUNT_RESPONSE_TIMEOUT_MS })
      .catch(() => null);

    await submit();

    const accountRequest = await accountRequestPromise;
    if (!accountRequest) {
      const formErrors = await visibleFormErrors(page);
      if (formErrors.length > 0) {
        throw new Error(`Account creation was blocked by form validation: ${formErrors.join(' | ')}`);
      }

      continue;
    }

    const accountResponse = await accountResponsePromise;

    if (accountResponse) {
      return accountResponse;
    }

    throw new Error('Account creation request was sent, but no response arrived before the timeout.');
  }

  throw new Error('Account creation request was not sent after retrying submit.');
}

function waitForAccountCreationRequest(page: Page) {
  return page
    .waitForRequest(isAccountCreationRequest, { timeout: ACCOUNT_REQUEST_TIMEOUT_MS })
    .catch(() => null);
}

export async function expectNoAccountCreationRequest(page: Page, action: () => Promise<void>) {
  // Negative UI tests should fail if the form sends a create-account request anyway.
  const accountRequestPromise = page
    .waitForRequest(isAccountCreationRequest, { timeout: 1_000 })
    .then(request => request)
    .catch(() => null);

  await action();

  const accountRequest = await accountRequestPromise;
  expect(accountRequest, 'No account creation request should be sent for client-side validation failures').toBeNull();
}

async function visibleFormErrors(page: Page) {
  return page
    .locator('[id^="form-error-message"]')
    .allTextContents()
    .then(messages => messages.map(message => message.trim()).filter(Boolean))
    .catch(() => []);
}
