import { expect, type Locator, type Page } from '@playwright/test';
import { isAccountDeletionResponse } from './accountApi';

export class DisableAccountPage {
  reason: Locator;
  confirmation: Locator;
  confirmButton: Locator;

  constructor(private page: Page) {
    this.reason = page.locator('select').first();
    this.confirmation = page.getByTestId('delete-account-confirmation-input');
    this.confirmButton = page.getByTestId('confirm-delete-button');
  }

  async disableAccount() {
    await expect(this.reason).toBeVisible();
    await this.reason.selectOption('NO_REASON');
    await this.confirmation.check();

    const deletionResponsePromise = this.page.waitForResponse(isAccountDeletionResponse);

    await this.confirmButton.click();
    const deletionResponse = await deletionResponsePromise;

    expect(deletionResponse.status()).toBe(204);
    await this.page.waitForURL(/\/account-deleted/, { timeout: 20_000 });
    await expect(this.page.getByText(/account has been successfully deleted/i)).toBeVisible();
  }
}
