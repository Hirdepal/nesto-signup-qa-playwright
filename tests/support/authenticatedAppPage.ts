import { expect, type Locator, type Page } from '@playwright/test';
import type { SignupData } from './signupData';

const LOGIN_PAGE_TIMEOUT_MS = 30_000;
const DISABLE_ACCOUNT_PAGE_TIMEOUT_MS = 20_000;

export class AuthenticatedAppPage {
  menuButton: Locator;
  logoutMenuItem: Locator;
  userSettingsMenuItem: Locator;
  deleteAccountButton: Locator;
  portfolioLink: Locator;

  constructor(private page: Page) {
    this.menuButton = page.getByTestId('menu-button');
    this.logoutMenuItem = page.getByTestId('logout-menu-item');
    this.userSettingsMenuItem = page.getByTestId('userSettings-menu-item');
    this.deleteAccountButton = page.getByTestId('delete-account-button');
    this.portfolioLink = page.getByTestId('my-portfolio-button');
  }

  async expectSignedIn(data: SignupData) {
    await expect(this.menuButton).toBeVisible();
    await expect(this.menuButton).toHaveText(data.initials);
    await expect(this.portfolioLink).toBeVisible();
  }

  async logout() {
    await expect(this.menuButton).toBeVisible();
    await this.menuButton.click();
    await expect(this.logoutMenuItem).toBeVisible();
    await this.logoutMenuItem.click();
    await this.page.waitForURL(url => url.hostname === 'auth.nesto.ca' && url.pathname === '/login', {
      timeout: LOGIN_PAGE_TIMEOUT_MS
    });
  }

  async openDisableAccountPage() {
    await expect(this.menuButton).toBeVisible();
    await this.menuButton.click();
    await expect(this.userSettingsMenuItem).toBeVisible();
    await this.userSettingsMenuItem.click();
    await expect(this.deleteAccountButton).toBeVisible();
    await this.deleteAccountButton.click();
    await this.page.waitForURL(/\/disable-account/, { timeout: DISABLE_ACCOUNT_PAGE_TIMEOUT_MS });
  }
}
