const { test, expect } = require('@playwright/test');

const CHOOSER_URL = '/pages/login.html';

const PORTALS = [
  {
    id: 'teacher-admin',
    file: 'loginTeacher.html',
    href: 'loginTeacher.html',
    label: 'Teachers and administrators',
    subtitle: 'Teachers and administrators',
    title: 'Teacher and Administrator Login | My Test Portal',
    usernameLabel: 'Email',
    usernameType: 'email',
    hasSchoolId: false,
    hasQr: false,
  },
  {
    id: 'parent',
    file: 'loginParent.html',
    href: 'loginParent.html',
    label: 'Parents and caregivers',
    subtitle: 'Parents and caregivers',
    title: 'Parent and Caregiver Login | My Test Portal',
    usernameLabel: 'Email',
    usernameType: 'email',
    hasSchoolId: false,
    hasQr: false,
  },
  {
    id: 'students',
    file: 'loginStudent.html',
    href: 'loginStudent.html',
    label: 'Students',
    subtitle: 'Students',
    title: 'Student Login | My Test Portal',
    usernameLabel: 'Username',
    usernameType: 'text',
    hasSchoolId: true,
    hasQr: true,
  },
];

test.describe('Portal Login chooser page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(CHOOSER_URL);
  });

  test('loads with correct heading and title', async ({ page }) => {
    await expect(page).toHaveTitle('Login | My Test Portal');
    await expect(page.locator('.zb-headline')).toHaveText('Please select your user type:');
  });

  test('shows exactly three role-selection buttons', async ({ page }) => {
    await expect(page.locator('.role-icon-container .choose-role-link')).toHaveCount(3);
  });

  test('each role button has the expected id, href and label', async ({ page }) => {
    for (const portal of PORTALS) {
      const link = page.locator(`#${portal.id}`);
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', portal.href);
      await expect(link.locator('.role-label')).toHaveText(portal.label);
    }
  });

  test('has Home link back to index', async ({ page }) => {
    const homeLink = page.locator('#link-container a');
    await expect(homeLink).toHaveAttribute('href', '../index.html');
    await expect(homeLink).toHaveText('Home');
  });
});

test.describe('Direct navigation to a portal fails', () => {
  // The portals are only reachable by clicking a button. Navigating straight
  // to a portal URL (or reloading one) bounces back to the chooser, mirroring
  // the live site where a direct hit on /login/user lands on /login.
  for (const portal of PORTALS) {
    test(`direct navigation to ${portal.file} redirects to the chooser`, async ({ page }) => {
      await page.goto(`/pages/${portal.file}`, { waitUntil: 'networkidle' });
      await expect(page).toHaveURL(new RegExp(`${CHOOSER_URL}$`));
      await expect(page.locator('.zb-headline')).toHaveText('Please select your user type:');
      await expect(page.locator('.portal-login-form')).toHaveCount(0);
    });
  }
});

test.describe('Clicking a role button succeeds', () => {
  for (const portal of PORTALS) {
    test.describe(`${portal.label} portal`, () => {

      test.beforeEach(async ({ page }) => {
        await page.goto(CHOOSER_URL);
        await page.click(`#${portal.id}`);
        await page.waitForLoadState('networkidle');
      });

      test('navigates to the portal with the correct URL and title', async ({ page }) => {
        await expect(page).toHaveURL(new RegExp(`/pages/${portal.file}$`));
        await expect(page).toHaveTitle(portal.title);
      });

      test('shows the Welcome heading and role subtitle', async ({ page }) => {
        await expect(page.locator('.welcome')).toHaveText('Welcome!');
        await expect(page.locator('.role-subtitle')).toHaveText(portal.subtitle);
      });

      test('shows the login form with username and password fields', async ({ page }) => {
        await expect(page.locator('.portal-login-form')).toBeVisible();
        await expect(page.locator(`label[for="username"]`)).toHaveText(portal.usernameLabel);
        await expect(page.locator('#username')).toHaveAttribute('type', portal.usernameType);
        await expect(page.locator('#password')).toHaveAttribute('type', 'password');
      });

      test('shows the three SSO buttons', async ({ page }) => {
        await expect(page.locator('.sso-btn')).toHaveCount(3);
        await expect(page.locator('#sso-button-google')).toContainText('Sign in with Google');
        await expect(page.locator('#sso-button-clever')).toContainText('Sign in with Clever');
        await expect(page.locator('#sso-button-classlink')).toContainText('Sign in with Class Link');
      });

      test(`${portal.hasSchoolId ? 'has' : 'does not have'} a School ID field`, async ({ page }) => {
        await expect(page.locator('#schoolId')).toHaveCount(portal.hasSchoolId ? 1 : 0);
      });

      test(`${portal.hasQr ? 'has' : 'does not have'} a QR-code login button`, async ({ page }) => {
        await expect(page.locator('#qrLoginButton')).toHaveCount(portal.hasQr ? 1 : 0);
      });

      test('reloading the portal bounces back to the chooser', async ({ page }) => {
        await page.reload({ waitUntil: 'networkidle' });
        await expect(page).toHaveURL(new RegExp(`${CHOOSER_URL}$`));
        await expect(page.locator('.zb-headline')).toHaveText('Please select your user type:');
      });
    });
  }
});

test.describe('Portal interactions', () => {

  test('show/hide password toggle reveals the password', async ({ page }) => {
    await page.goto(CHOOSER_URL);
    await page.click('#teacher-admin');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
    await page.click('#showPasswordButton');
    await expect(page.locator('#password')).toHaveAttribute('type', 'text');
    await page.click('#showPasswordButton');
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
  });

  test('submitting the form shows a local status message', async ({ page }) => {
    await page.goto(CHOOSER_URL);
    await page.click('#parent');
    await page.waitForLoadState('networkidle');
    await page.fill('#username', 'caregiver@example.com');
    await page.fill('#password', 'secret');
    await page.click('.login-btn');
    await expect(page.locator('#login-status')).toContainText('parent');
  });

  test('empty submit prompts for the username', async ({ page }) => {
    await page.goto(CHOOSER_URL);
    await page.click('#teacher-admin');
    await page.waitForLoadState('networkidle');
    await page.click('.login-btn');
    await expect(page.locator('#login-status')).toContainText('email');
  });

  test('role switcher navigates between portals (in-app click works)', async ({ page }) => {
    await page.goto(CHOOSER_URL);
    await page.click('#teacher-admin');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.role-subtitle')).toHaveText('Teachers and administrators');

    await page.click('#switch-student');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/pages\/loginStudent\.html$/);
    await expect(page.locator('.role-subtitle')).toHaveText('Students');

    await page.click('#switch-parent');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/pages\/loginParent\.html$/);
    await expect(page.locator('.role-subtitle')).toHaveText('Parents and caregivers');
  });
});

test.describe('index page link to Portal Login', () => {
  test('index page has a Portal Login link', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('#link-container a[href="./pages/login.html"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveText('Portal Login');
  });

  test('link navigates to the chooser page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="./pages/login.html"]');
    await expect(page.locator('.zb-headline')).toHaveText('Please select your user type:');
  });
});
