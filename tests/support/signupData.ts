export type SupportedLanguage = 'en' | 'fr';

export type SignupData = {
  firstName: string;
  lastName: string;
  initials: string;
  phone: string;
  normalizedPhone: string;
  provinceLabel: string;
  provinceCode: string;
  email: string;
  password: string;
  language: SupportedLanguage;
};

export function languageFromProject(projectName: string): SupportedLanguage {
  return projectName.endsWith('-fr') ? 'fr' : 'en';
}

export function buildSignupData(language: SupportedLanguage): SignupData {
  const emailDomain = process.env.SIGNUP_EMAIL_DOMAIN ?? 'gmail.com';
  const uniqueSuffix = `${Date.now()}${process.hrtime.bigint().toString().slice(-6)}`;
  const phoneLastFour = uniqueSuffix.slice(-4).padStart(4, '0');

  return {
    firstName: 'Automation',
    lastName: `QA${uniqueSuffix}`,
    initials: 'AQ',
    phone: `416555${phoneLastFour}`,
    normalizedPhone: `+1416555${phoneLastFour}`,
    provinceLabel: 'Ontario',
    provinceCode: 'ON',
    email: `nestoqa${language}${uniqueSuffix}@${emailDomain}`,
    password: buildTestPassword(uniqueSuffix),
    language
  };
}

function buildTestPassword(uniqueSuffix: string) {
  return `Automation${uniqueSuffix.slice(-8)}`;
}
