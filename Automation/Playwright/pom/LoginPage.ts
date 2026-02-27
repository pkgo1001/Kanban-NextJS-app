import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Login Page
 * URL: /login
 */
export class LoginPage {
  readonly page: Page;
  
  // Locators
  readonly pageTitle: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly passwordToggleButton: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators
    this.pageTitle = page.getByRole('heading', { name: 'Welcome Back' });
    this.emailInput = page.getByPlaceholder('your@email.com');
    this.passwordInput = page.getByPlaceholder('Enter your password');
    this.passwordToggleButton = page.getByRole('button').filter({ has: page.locator('svg') }).nth(1); // Eye icon button
    this.signInButton = page.getByRole('button', { name: /Sign In/i });
    this.errorMessage = page.locator('div.bg-destructive\\/10 p.text-destructive');
    this.registerLink = page.getByRole('link', { name: /Don't have an account/i });
    this.forgotPasswordLink = page.getByRole('link', { name: /Forgot your password/i });
    this.loadingSpinner = page.locator('div.animate-spin');
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto('/login');
    await this.waitForPageLoad();
  }

  /**
   * Wait for the page to fully load
   */
  async waitForPageLoad() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  /**
   * Fill email input
   */
  async fillEmail(email: string) {
    await this.emailInput.clear();
    await this.emailInput.fill(email);
  }

  /**
   * Fill password input
   */
  async fillPassword(password: string) {
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
  }

  /**
   * Click sign in button
   */
  async clickSignIn() {
    await this.signInButton.click();
  }

  /**
   * Complete login flow
   * @param email - User email
   * @param password - User password
   */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSignIn();
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility() {
    await this.passwordToggleButton.click();
  }

  /**
   * Check if error message is displayed
   */
  async hasErrorMessage(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    await expect(this.errorMessage).toBeVisible();
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Wait for successful login (redirect to home page)
   */
  async waitForSuccessfulLogin() {
    await this.page.waitForURL('/', { timeout: 10000 });
  }

  /**
   * Check if user is redirected to home page after login
   */
  async isOnHomePage(): Promise<boolean> {
    return this.page.url().includes('/') && !this.page.url().includes('/login');
  }

  /**
   * Click register link
   */
  async clickRegisterLink() {
    await this.registerLink.click();
  }

  /**
   * Click forgot password link
   */
  async clickForgotPasswordLink() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Check if sign in button is disabled
   */
  async isSignInButtonDisabled(): Promise<boolean> {
    return await this.signInButton.isDisabled();
  }

  /**
   * Check if loading state is active
   */
  async isLoading(): Promise<boolean> {
    try {
      return await this.signInButton.locator('svg.animate-spin').isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Get email input value
   */
  async getEmailValue(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  /**
   * Get password input value
   */
  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  /**
   * Check if password is visible (not masked)
   */
  async isPasswordVisible(): Promise<boolean> {
    const type = await this.passwordInput.getAttribute('type');
    return type === 'text';
  }

  /**
   * Check if all page elements are present
   */
  async verifyPageElements() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signInButton).toBeVisible();
    await expect(this.registerLink).toBeVisible();
    await expect(this.forgotPasswordLink).toBeVisible();
  }
}

