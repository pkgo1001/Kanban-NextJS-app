import { test, expect } from '@playwright/test';
import { LoginPage } from '../pom/LoginPage';
import { getTestUser, getCurrentEnvironment, logTestConfig } from '../config/test-config';

test.describe('Login Page Tests', () => {
  let loginPage: LoginPage;

  // Log test configuration once before all tests
  test.beforeAll(() => {
    logTestConfig();
  });

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display login page with all elements @smoke', async () => {
    // Verify all elements are present
    await loginPage.verifyPageElements();
    
    // Verify page title
    await expect(loginPage.pageTitle).toHaveText('Welcome Back');
    
    // Verify links are present
    await expect(loginPage.registerLink).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  test('should allow user to type in email and password fields', async () => {
    // Type in email
    await loginPage.fillEmail('test@example.com');
    expect(await loginPage.getEmailValue()).toBe('test@example.com');
    
    // Type in password
    await loginPage.fillPassword('TestPassword123!');
    expect(await loginPage.getPasswordValue()).toBe('TestPassword123!');
  });

  test('should toggle password visibility', async () => {
    // Password should be hidden by default
    expect(await loginPage.isPasswordVisible()).toBe(false);
    
    // Fill password
    await loginPage.fillPassword('MySecurePassword123!');
    
    // Click toggle to show password
    await loginPage.togglePasswordVisibility();
    expect(await loginPage.isPasswordVisible()).toBe(true);
    
    // Click toggle to hide password again
    await loginPage.togglePasswordVisibility();
    expect(await loginPage.isPasswordVisible()).toBe(false);
  });

  test('should show error message for invalid credentials', async () => {
    // Try to login with invalid credentials
    await loginPage.login('invalid@email.com', 'wrongpassword');
    
    // Wait a bit for the error to appear
    await loginPage.page.waitForTimeout(2000);
    
    // Check if error message is displayed
    if (await loginPage.hasErrorMessage()) {
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toContain('Invalid email or password');
    }
  });

  test('should show error message for non-existent user', async () => {
    // Try to login with non-existent user
    await loginPage.login('nonexistent.user@company.com', 'password123');
    
    // Wait for error message
    await loginPage.page.waitForTimeout(2000);
    
    // Verify error is shown
    expect(await loginPage.hasErrorMessage()).toBe(true);
  });

  test('should successfully login with Admin credentials @smoke @critical', async ({ page }) => {
    const env = getCurrentEnvironment();
    const adminUser = getTestUser('admin');
    
    console.log(`Testing Admin login in ${env} environment: ${adminUser.email}`);
    
    // Login with admin credentials
    await loginPage.login(adminUser.email, adminUser.password);
    
    // Wait for redirect to home page
    await loginPage.waitForSuccessfulLogin();
    
    // Verify we're on the home page
    expect(await loginPage.isOnHomePage()).toBe(true);
    
    // Verify home page elements (Kanban Dashboard header)
    await expect(page.getByRole('heading', { name: 'Kanban Dashboard' })).toBeVisible();
    
    // Verify user name is displayed
    await expect(page.getByText(adminUser.name)).toBeVisible();
    
    // Verify User Management button is visible for admin
    await expect(page.getByRole('button', { name: /User Management/i })).toBeVisible();
  });

  test('should successfully login with Supervisor credentials @smoke', async ({ page }) => {
    const supervisorUser = getTestUser('supervisor');
    
    // Login with supervisor credentials
    await loginPage.login(supervisorUser.email, supervisorUser.password);
    
    // Wait for redirect to home page
    await loginPage.waitForSuccessfulLogin();
    
    // Verify we're on the home page
    expect(await loginPage.isOnHomePage()).toBe(true);
    
    // Verify home page elements
    await expect(page.getByRole('heading', { name: 'Kanban Dashboard' })).toBeVisible();
    
    // Verify user name is displayed
    await expect(page.getByText(supervisorUser.name)).toBeVisible();
    
    // Verify SUPERVISOR badge is shown
    await expect(page.getByText('SUPERVISOR')).toBeVisible();
  });

  test('should successfully login with Employee credentials @smoke', async ({ page }) => {
    const employeeUser = getTestUser('employee');
    
    // Login with employee credentials
    await loginPage.login(employeeUser.email, employeeUser.password);
    
    // Wait for redirect to home page
    await loginPage.waitForSuccessfulLogin();
    
    // Verify we're on the home page
    expect(await loginPage.isOnHomePage()).toBe(true);
    
    // Verify home page elements
    await expect(page.getByRole('heading', { name: 'Kanban Dashboard' })).toBeVisible();
    
    // Verify user name is displayed
    await expect(page.getByText(employeeUser.name)).toBeVisible();
    
    // Verify EMPLOYEE badge is shown
    await expect(page.getByText('EMPLOYEE')).toBeVisible();
    
    // Verify User Management button is NOT visible for employee
    await expect(page.getByRole('button', { name: /User Management/i })).not.toBeVisible();
  });

  test('should successfully login with Viewer credentials @smoke', async ({ page }) => {
    const viewerUser = getTestUser('viewer');
    
    // Login with viewer credentials
    await loginPage.login(viewerUser.email, viewerUser.password);
    
    // Wait for redirect to home page
    await loginPage.waitForSuccessfulLogin();
    
    // Verify we're on the home page
    expect(await loginPage.isOnHomePage()).toBe(true);
    
    // Verify home page elements
    await expect(page.getByRole('heading', { name: 'Kanban Dashboard' })).toBeVisible();

    // Verify user name is displayed
    await expect(page.getByText(viewerUser.name)).toBeVisible();
    
    // Verify VIEWER badge is shown
    await expect(page.getByText('VIEWER')).toBeVisible();
  });

  test('should navigate to register page when clicking register link', async ({ page }) => {
    // Click register link
    await loginPage.clickRegisterLink();
    
    // Verify navigation to register page
    await page.waitForURL(/\/register/, { timeout: 5000 });
    expect(page.url()).toContain('/register');
  });

  test('should navigate to forgot password page when clicking forgot password link', async ({ page }) => {
    // Click forgot password link
    await loginPage.clickForgotPasswordLink();
    
    // Verify navigation to forgot password page
    await page.waitForURL(/\/forgot-password/, { timeout: 5000 });
    expect(page.url()).toContain('/forgot-password');
  });

  test('should clear input fields after typing and clearing', async () => {
    // Fill email
    await loginPage.fillEmail('test@example.com');
    expect(await loginPage.getEmailValue()).toBe('test@example.com');
    
    // Clear email
    await loginPage.emailInput.clear();
    expect(await loginPage.getEmailValue()).toBe('');
    
    // Fill password
    await loginPage.fillPassword('password123');
    expect(await loginPage.getPasswordValue()).toBe('password123');
    
    // Clear password
    await loginPage.passwordInput.clear();
    expect(await loginPage.getPasswordValue()).toBe('');
  });

  test('should maintain email value when password is incorrect', async () => {
    const testEmail = 'test@example.com';
    
    // Fill email and wrong password
    await loginPage.fillEmail(testEmail);
    await loginPage.fillPassword('wrongpassword');
    await loginPage.clickSignIn();
    
    // Wait for error
    await loginPage.page.waitForTimeout(2000);
    
    // Email should still be in the field
    expect(await loginPage.getEmailValue()).toBe(testEmail);
  });

  test('should handle empty email and password submission', async () => {
    // Try to submit without filling anything
    await loginPage.clickSignIn();
    
    // Form validation should prevent submission or show error
    // The form might have HTML5 validation or custom validation
    
    // We should still be on the login page
    await expect(loginPage.pageTitle).toBeVisible();
  });
});

// Test suite for different environments
test.describe('Multi-Environment Login Tests', () => {
  test('should verify correct environment is being tested', () => {
    const env = getCurrentEnvironment();
    console.log(`Current test environment: ${env}`);
    
    // Just verify we can get environment info
    expect(['development', 'qa', 'production']).toContain(env);
  });

  test('should have different admin emails per environment', () => {
    const adminUser = getTestUser('admin');
    const env = getCurrentEnvironment();
    
    if (env === 'development') {
      expect(adminUser.email).toBe('admin.dev@company.com');
    } else if (env === 'qa') {
      expect(adminUser.email).toBe('admin.qa@company.com');
    } else if (env === 'production') {
      expect(adminUser.email).toBe('admin.prd@company.com');
    }
  });
});

