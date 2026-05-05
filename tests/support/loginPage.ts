import { expect, type Locator, type Page } from '@playwright/test';
import type { SignupData } from './signupData';

export class LoginPage {
  email: Locator;
  password: Locator;
  submitButton: Locator;

  constructor(private page: Page) {
    this.email = page.locator('input[name="email"]');
    this.password = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[name="submit"]');
  }

  async expectVisible() {
    await expect(this.email).toBeVisible();
    await expect(this.password).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async login(data: SignupData) {
    await this.email.fill(data.email);
    await this.password.fill(data.password);
    await this.submitButton.click();
  }
}
