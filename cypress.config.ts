import { defineConfig } from 'cypress';

const envName = (process.env.TEST_ENV || 'development').toLowerCase();//TEST_ENV is the environment variable that is set in the command in the package.json file
const baseUrlMap: Record<string, string> = {
  development: 'http://localhost:3000',
  qa: 'http://localhost:3001',
  staging: 'http://localhost:3001',
  production: 'http://localhost:3002',
  prod: 'http://localhost:3002',
};
const baseUrl = baseUrlMap[envName] || 'http://localhost:3000';

export default defineConfig({ 
  e2e: {/* e2e is the environment for cypress */
    baseUrl,
    specPattern: 'Automation/Cypress/e2e/**/*.cy.{js,ts}',
    supportFile: 'Automation/Cypress/config/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {/* env is the environment variable for cypress */
      TEST_ENV: process.env.TEST_ENV || 'development',
    },
  },
});