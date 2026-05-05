import { expect, type Locator, type Page } from '@playwright/test';
import type { SignupData, SupportedLanguage } from './signupData';

type Copy = {
  path: string;
  htmlLang: SupportedLanguage;
  heading: RegExp;
  languageToggle: string;
  labels: {
    firstName: string | RegExp;
    lastName: string | RegExp;
    phone: string | RegExp;
    province: string | RegExp;
    email: string | RegExp;
    password: string | RegExp;
    confirmPassword: string | RegExp;
    consent: string | RegExp;
  };
  submitButton: string | RegExp;
  errors: {
    required: string | RegExp;
    invalidPhone: string | RegExp;
    invalidEmail: string | RegExp;
    weakPassword: string | RegExp;
    passwordMismatch: string | RegExp;
  };
};

export const signupCopy: Record<SupportedLanguage, Copy> = {
  en: {
    path: '/signup',
    htmlLang: 'en',
    heading: /Create a nesto account/i,
    languageToggle: 'FR',
    labels: {
      firstName: 'First name',
      lastName: 'Last name',
      phone: 'Phone number',
      province: 'Province of purchase',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      consent: /agree to be contacted by nesto's partners|agree to be contacted by nesto.s partners/i
    },
    submitButton: 'Create your account',
    errors: {
      required: 'The field is required',
      invalidPhone: 'Invalid value',
      invalidEmail: 'Invalid email',
      weakPassword: 'Minimum of 12 letters required',
      passwordMismatch: 'Passwords do not match'
    }
  },
  fr: {
    path: '/fr/signup',
    htmlLang: 'fr',
    heading: /compte nesto/i,
    languageToggle: 'EN',
    labels: {
      firstName: /^Pr.nom$/,
      lastName: 'Nom',
      phone: /^T.l.phone$/,
      province: /^Province de l'achat$/,
      email: 'Courriel',
      password: /^Mot de passe$/,
      confirmPassword: /Confirmation du mot de passe/,
      consent: /partenaires de nesto/i
    },
    submitButton: /compte/i,
    errors: {
      required: /obligatoire/i,
      invalidPhone: /Valeur invalide/i,
      invalidEmail: /Courriel invalide/i,
      weakPassword: /Minimum de 12 lettres requises/i,
      passwordMismatch: /mots de passe ne correspondent pas/i
    }
  }
};

export class SignupPage {
  firstName: Locator;
  lastName: Locator;
  phone: Locator;
  province: Locator;
  email: Locator;
  password: Locator;
  confirmPassword: Locator;
  consent: Locator;
  submitButton: Locator;

  constructor(private page: Page) {
    this.firstName = page.locator('input[name="firstName"]');
    this.lastName = page.locator('input[name="lastName"]');
    this.phone = page.locator('input[name="phone"]');
    this.province = page.locator('select[aria-label="region"]');
    this.email = page.locator('input[name="email"]');
    this.password = page.locator('input[name="password"]');
    this.confirmPassword = page.locator('input[name="passwordConfirmation"]');
    this.consent = page.locator('input[name="leadDistributeConsentAgreement"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto(language: SupportedLanguage) {
    await this.blockNonEssentialThirdParties();
    await this.page.goto(signupCopy[language].path, { waitUntil: 'networkidle' });
    await expect(this.submitButton).toBeVisible();
  }

  async expectLocalizedPage(language: SupportedLanguage) {
    const copy = signupCopy[language];

    await expect(this.page.locator('html')).toHaveAttribute('lang', copy.htmlLang);
    await expect(this.page.getByText(copy.heading)).toBeVisible();
    await expect(this.page.getByTestId('header-language-switch')).toHaveText(copy.languageToggle);
    await this.expectLabel(this.firstName, copy.labels.firstName);
    await this.expectLabel(this.lastName, copy.labels.lastName);
    await this.expectLabel(this.phone, copy.labels.phone);
    await this.expectLabel(this.province, copy.labels.province);
    await this.expectLabel(this.email, copy.labels.email);
    await this.expectLabel(this.password, copy.labels.password);
    await this.expectLabel(this.confirmPassword, copy.labels.confirmPassword);
    await this.expectLabel(this.consent, copy.labels.consent);
    await expect(this.submitButton).toHaveText(copy.submitButton);
  }

  async fillValidSignupForm(data: SignupData) {
    await this.firstName.fill(data.firstName);
    await this.lastName.fill(data.lastName);
    await this.phone.fill(data.phone);
    await this.province.selectOption({ label: data.provinceLabel });
    await this.email.fill(data.email);
    await this.password.fill(data.password);
    await this.confirmPassword.fill(data.password);
    await this.consent.check();

    await expect(this.firstName).toHaveValue(data.firstName);
    await expect(this.lastName).toHaveValue(data.lastName);
    await expect(this.email).toHaveValue(data.email);
    await expect(this.password).toHaveValue(data.password);
    await expect(this.confirmPassword).toHaveValue(data.password);
    await expect(this.consent).toBeChecked();
  }

  async fillInvalidFormatForm() {
    await this.firstName.fill('Invalid');
    await this.lastName.fill('User');
    await this.phone.fill('123');
    await this.province.selectOption({ label: 'Ontario' });
    await this.email.fill('not-an-email');
    await this.password.fill('short');
    await this.confirmPassword.fill('Different12345');
  }

  async submit() {
    await this.submitButton.click();
  }

  async expectValidationErrors(language: SupportedLanguage) {
    const errors = signupCopy[language].errors;

    await this.expectFieldError(this.phone, errors.invalidPhone);
    await this.expectFieldError(this.email, errors.invalidEmail);
    await this.expectFieldError(this.password, errors.weakPassword);
    await this.expectFieldError(this.confirmPassword, errors.passwordMismatch);
  }

  async expectRequiredErrors(language: SupportedLanguage) {
    const errors = signupCopy[language].errors;

    await this.expectFieldError(this.firstName, errors.required);
    await this.expectFieldError(this.lastName, errors.required);
    await this.expectFieldError(this.phone, errors.invalidPhone);
    await this.expectFieldError(this.email, errors.invalidEmail);
    await this.expectFieldError(this.password, errors.weakPassword);
  }

  private async expectLabel(control: Locator, expected: string | RegExp) {
    const id = await control.getAttribute('id');
    expect(id, 'Expected form control to have an id linked to a label').toBeTruthy();
    await expect(this.page.locator(`label[for="${id}"]`)).toHaveText(expected);
  }

  private async expectFieldError(control: Locator, expected: string | RegExp) {
    const id = await control.getAttribute('id');
    expect(id, 'Expected form control to have an id linked to an error message').toBeTruthy();
    await expect(this.page.locator(`#form-error-message-${id}`)).toHaveText(expected);
  }

  private async blockNonEssentialThirdParties() {
    await this.page.route(
      /browser-intake-datadoghq|doubleclick|googleadservices|google\.com\/pagead|gtm\.nesto\.ca\/g\/collect|pixel\.switchgrowth/,
      route => route.abort()
    );
  }
}
