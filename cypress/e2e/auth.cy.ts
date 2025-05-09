describe('Authentication Flow', () => {
  beforeEach(() => {
    // Optional: Clear local storage, cookies, or reset database state before each test
    // cy.task('resetDatabase'); // Requires setting up db reset task in cypress.config.ts
    cy.visit('/auth/signin'); // Assuming this is the login page route
  });

  it('should allow a user to sign in with valid credentials', () => {
    // Use environment variables for test credentials for security
    const email = Cypress.env('TEST_USER_EMAIL');
    const password = Cypress.env('TEST_USER_PASSWORD');

    if (!email || !password) {
      throw new Error('Test credentials (TEST_USER_EMAIL, TEST_USER_PASSWORD) not set in Cypress environment variables');
    }

    // Target elements using data-testid attributes or stable selectors
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Assert successful login - e.g., redirect to dashboard/pets page
    cy.url().should('include', '/pets'); // Or whatever the post-login page is
    // Assert that some element indicating login is present
    // cy.get('[data-testid="user-avatar"]').should('exist'); 
  });

  it('should show an error message with invalid credentials', () => {
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Assert error message is displayed
    // cy.get('[data-testid="auth-error-message"]').should('be.visible');
    cy.contains('Invalid login credentials').should('be.visible'); // Adjust text based on actual error
    cy.url().should('include', '/auth/signin'); // Should remain on login page
  });

  // Add more tests for sign up, password reset, etc.

}); 