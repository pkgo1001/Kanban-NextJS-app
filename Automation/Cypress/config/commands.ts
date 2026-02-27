import { getTestUser } from './test-config';

declare global {//declare global is a global namespace for cypress, it is used to declare global variables, functions, classes, etc.. for cypress.
  namespace Cypress {//namespace Cypress is a namespace for cypress, it is used to declare global variables, functions, classes, etc.. for cypress.
    interface Chainable {//interface Chainable is a interface for cypress, it is used to declare global variables, functions, classes, etc.. for cypress.
      loginAs(role: 'admin' | 'supervisor' | 'employee' | 'viewer'): Chainable<void>; //loginAs is a function that is used to login as a user with a given role, it returns a chainable object.
      login(email: string, password: string): Chainable<void>; //login is a function that is used to login as a user with a given email and password, it returns a chainable object.
    }
  }
}

Cypress.Commands.add( //Cypress.Commands.add is a function that is used to add a new command to cypress, it returns a chainable object.
    'loginAs', (role) => {//loginAs is a function that is used to login as a user with a given role, it returns a chainable object. This function is called when the user wants to login as a user with a given role. it executes the cypress code at any point in the test.
        const user = getTestUser(role);
        return cy.login(user.email, user.password);
    });
    
Cypress.Commands.add(
    'login', (email: string, password: string) => {
        cy.visit('/login');
        cy.get('input[placeholder="your@email.com"]').clear().type(email);
        cy.get('input[placeholder="Enter your password"]').clear().type(password);
        cy.get('button').contains(/Sign In/i).click();
        cy.url().should('not.include', '/login');
});