# 🎭 Playwright Test Suite

End-to-end testing suite for the Kanban NextJS application using Playwright and TypeScript.

---

## 📁 Structure

```
Playwright/
├── config/
│   └── test-config.ts      # Multi-environment configuration
├── pom/
│   └── LoginPage.ts         # Page Object Model for Login
├── tests/
│   ├── login.spec.ts        # Login page tests
│   └── tsconfig.json        # TypeScript config for tests
├── fixtures/                # Custom fixtures (empty for now)
├── reports/                 # Test reports (HTML)
├── screenshots/             # Screenshots on failure
├── videos/                  # Videos on failure
└── test-results/            # Test artifacts
```

---

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Run all tests (default: development environment)
npm test

# Run in headed mode (see the browser)
npm run test:headed

# Run in debug mode (step through tests)
npm run test:debug

# View test report
npm run test:report
```

---

## 🌍 Multi-Environment Testing

The test suite supports three environments: **Development**, **QA**, and **Production**.

### Environment Configuration

Each environment has:
- Different **base URL**
- Environment-specific **test users**
- Environment-specific **admin credentials**

| Environment | Base URL | Admin Email |
|-------------|----------|-------------|
| **Development** | http://localhost:3000 | admin.dev@company.com |
| **QA** | http://localhost:3001 | admin.qa@company.com |
| **Production** | http://localhost:3002 | admin.prd@company.com |

### Run Tests Per Environment

```bash
# Development (default)
npm run test:dev
# or just
npm test

# QA/Staging
npm run test:qa

# Production
npm run test:prod
```

### Before Running Tests

Make sure the corresponding environment is running:

**For Development:**
```bash
npm run dev  # http://localhost:3000
```

**For QA:**
```bash
npm run dev:qa  # http://localhost:3001
```

**For Production:**
```bash
npm run dev:prod  # http://localhost:3002
```

---

## 🎯 Test Tags

Tests are organized with tags for selective execution:

### Available Tags

- `@smoke` - Critical smoke tests
- `@critical` - Critical functionality tests
- (Add more as needed)

### Run Tagged Tests

```bash
# Run only smoke tests
npm run test:smoke

# Run only critical tests
npm run test:critical
```

---

## 🌐 Browser Testing

Run tests on specific browsers:

```bash
# Chromium only
npm run test:chromium

# Firefox only
npm run test:firefox

# WebKit/Safari only
npm run test:webkit
```

---

## 📝 Test Coverage

### Current Test Suites

#### ✅ Login Tests (`login.spec.ts`)

**Page Elements & UI:**
- Display all login page elements
- Email and password input functionality
- Password visibility toggle
- Form field clearing

**Authentication:**
- Invalid credentials error handling
- Non-existent user error handling
- Admin login (environment-specific)
- Supervisor login
- Employee login
- Viewer login
- Button disabled state during login

**Navigation:**
- Navigate to register page
- Navigate to forgot password page

**Multi-Environment:**
- Verify correct environment
- Verify environment-specific admin emails

**Total Tests:** 16+ test cases

---

## 🏗️ Page Object Model (POM)

### LoginPage

**Location:** `pom/LoginPage.ts`

**Methods:**
- `goto()` - Navigate to login page
- `login(email, password)` - Complete login flow
- `fillEmail(email)` - Fill email field
- `fillPassword(password)` - Fill password field
- `clickSignIn()` - Click sign in button
- `togglePasswordVisibility()` - Show/hide password
- `getErrorMessage()` - Get error message text
- `waitForSuccessfulLogin()` - Wait for redirect after login
- `isOnHomePage()` - Check if redirected to home
- `verifyPageElements()` - Verify all elements present
- And more...

---

## ⚙️ Configuration

### Test Configuration (`config/test-config.ts`)

**Features:**
- Multi-environment support
- Test user management per environment
- Configurable base URLs
- Role-based test users (Admin, Supervisor, Employee, Viewer)

**Usage in Tests:**
```typescript
import { getTestUser, getCurrentEnvironment } from '../config/test-config';

// Get admin user for current environment
const adminUser = getTestUser('admin');

// Login
await loginPage.login(adminUser.email, adminUser.password);
```

---

## 📊 Test Reports

### HTML Report

After running tests, view the report:

```bash
npm run test:report
```

Opens: `Playwright/reports/html-report/index.html`

### Test Artifacts

- **Screenshots:** `Playwright/screenshots/` (on failure)
- **Videos:** `Playwright/videos/` (on failure)
- **Traces:** `Playwright/test-results/` (on retry)

---

## 🧪 Writing New Tests

### 1. Create Page Object Model

Create a new POM in `pom/` directory:

```typescript
// pom/DashboardPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly header: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByRole('heading', { name: 'Kanban Dashboard' });
  }

  async goto() {
    await this.page.goto('/');
  }
}
```

### 2. Create Test File

Create test in `tests/` directory:

```typescript
// tests/dashboard.spec.ts
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pom/DashboardPage';
import { getTestUser } from '../config/test-config';

test.describe('Dashboard Tests', () => {
  test('should display dashboard', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.header).toBeVisible();
  });
});
```

### 3. Use Test Users

Always use `getTestUser()` for environment-specific credentials:

```typescript
const adminUser = getTestUser('admin');
const employeeUser = getTestUser('employee');

await loginPage.login(adminUser.email, adminUser.password);
```

---

## 🔧 Debugging Tests

### Debug Mode

```bash
# Debug with Playwright Inspector
npm run test:debug

# Debug specific test
npx playwright test login.spec.ts --debug
```

### Headed Mode

```bash
# Run with visible browser
npm run test:headed

# Slower execution for observation
npx playwright test --headed --slowMo=1000
```

### Screenshots & Videos

Configure in `playwright.config.ts`:
- Screenshots: `only-on-failure` (default)
- Videos: `retain-on-failure` (default)
- Traces: `on-first-retry` (default)

---

## 📚 Best Practices

### ✅ DO:
- Use Page Object Models for reusability
- Use `getTestUser()` for environment-specific users
- Tag tests with `@smoke`, `@critical`, etc.
- Use descriptive test names
- Wait for elements with `expect().toBeVisible()`
- Use locators by role, label, or text (not CSS selectors)

### ❌ DON'T:
- Hard-code credentials in tests
- Use CSS selectors when semantic locators are available
- Use `page.waitForTimeout()` unless absolutely necessary
- Skip test cleanup
- Commit sensitive data

---

## 🛠️ Troubleshooting

### Tests Failing to Connect

**Problem:** Cannot connect to `http://localhost:3000`

**Solution:**
```bash
# Make sure dev server is running
npm run dev

# Or let Playwright start it automatically (configured in playwright.config.ts)
```

### Wrong Environment Being Tested

**Problem:** Tests using wrong base URL or users

**Solution:**
```bash
# Explicitly set environment
TEST_ENV=qa npm test

# Or use the npm script
npm run test:qa
```

### Browser Not Installed

**Problem:** Playwright browsers not installed

**Solution:**
```bash
# Install browsers
npx playwright install

# Or install specific browser
npx playwright install chromium
```

---

## 📖 Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API](https://playwright.dev/docs/api/class-playwright)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)

---

## 🎯 Roadmap

**Future Test Suites:**
- User Management Tests
- Kanban Board Tests
- Task CRUD Tests
- Role-Based Access Control Tests
- API Integration Tests

---

**Last Updated:** November 11, 2025
**Playwright Version:** 1.56.1
**Node Version:** 20+

