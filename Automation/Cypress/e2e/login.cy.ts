import { LoginPage } from '../page-objects/LoginPage';

describe('Login Page', () => {
  const loginPage = new LoginPage();

  beforeEach(() => {
    loginPage.visit();
  });

  it('displays login page with all elements', () => {
    loginPage.expectPageLoaded();
    loginPage.registerLink.should('be.visible');
    loginPage.forgotPasswordLink.should('be.visible');
  });

  it('allows typing in email and password', () => {
    loginPage.fillEmail('test@example.com');
    loginPage.emailInput.should('have.value', 'test@example.com');
    loginPage.fillPassword('TestPassword123!');
    loginPage.passwordInput.should('have.value', 'TestPassword123!');
  });

  it('shows error for invalid credentials', () => {
    loginPage.login('invalid@email.com', 'wrongpassword');
    cy.get('div.bg-destructive\\/10 p.text-destructive', { timeout: 5000 })
      .should('be.visible')
      .and('contain.text', 'Invalid email or password');
  });

  it('logs in successfully with admin user', () => {
    cy.loginAs('admin');
    cy.url().should('not.include', '/login');
    cy.url().should('include', Cypress.config('baseUrl') + '/');
  });
});