export class LoginPage {
    visit() {
      cy.visit('/login');
      return this;
    }
    /*visit(baseURL:String){
      cy.visit(baseURL + '/login');
      return this;
    }*/
  
    get pageTitle() { return cy.get('h1, h2').contains('Welcome Back'); }
    get emailInput() { return cy.get('input[placeholder="your@email.com"]'); }
    get passwordInput() { return cy.get('input[placeholder="Enter your password"]'); }
    get signInButton() { return cy.get('button').contains(/Sign In/i); }
    get errorMessage() { return cy.get('div.bg-destructive\\/10 p.text-destructive'); }
    get registerLink() { return cy.get('a').contains(/Don't have an account/i); }
    get forgotPasswordLink() { return cy.get('a').contains(/Forgot your password/i); }
  
    fillEmail(email: string) {
      this.emailInput.clear().type(email);
      return this;
    }
  
    fillPassword(password: string) {
      this.passwordInput.clear().type(password);
      return this;
    }
  
    clickSignIn() {
      this.signInButton.click();
      return this;
    }
  
    login(email: string, password: string) {
      this.fillEmail(email).fillPassword(password).clickSignIn();
      return this;
    }
  
    expectPageLoaded() {
      this.pageTitle.should('be.visible');
      this.emailInput.should('be.visible');
      this.passwordInput.should('be.visible');
      return this;
    }
  
    expectErrorVisible() {
      this.errorMessage.should('be.visible');
      return this;
    }
  }