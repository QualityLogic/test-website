const { test, expect } = require('@playwright/test');

const PAGE_URL = '/pages/html5FormInputs.html';

test.describe('HTML5 Form Inputs page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test.describe('page structure', () => {
    test('loads with correct heading', async ({ page }) => {
      await expect(page.locator('h3')).toHaveText('HTML5 Form Input Types');
    });

    test('has Home link back to index', async ({ page }) => {
      const homeLink = page.locator('#link-container a');
      await expect(homeLink).toHaveAttribute('href', '../index.html');
      await expect(homeLink).toHaveText('Home');
    });

    test('has three content sections', async ({ page }) => {
      await expect(page.locator('.content')).toHaveCount(3);
    });
  });

  test.describe('date and time inputs', () => {
    test('date input exists with correct default value', async ({ page }) => {
      const input = page.locator('#date-markup-input-type');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('type', 'date');
      await expect(input).toHaveValue('2025-01-15');
    });

    test('datetime-local input exists with correct default value', async ({ page }) => {
      const input = page.locator('#new-input-type-form-input-2');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('type', 'datetime-local');
      await expect(input).toHaveValue('2025-01-15T09:30');
    });

    test('month input exists with correct default value', async ({ page }) => {
      const input = page.locator('#month-markup-input-type');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('type', 'month');
      await expect(input).toHaveValue('2025-01');
    });

    test('time input exists with correct default value', async ({ page }) => {
      const input = page.locator('#time-markup-input-type');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('type', 'time');
      await expect(input).toHaveValue('09:30');
    });

    test('week input exists with correct default value', async ({ page }) => {
      const input = page.locator('#week-markup-input-type');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('type', 'week');
      await expect(input).toHaveValue('2025-W03');
    });

    test('date input accepts new value', async ({ page }) => {
      const input = page.locator('#date-markup-input-type');
      await input.fill('2026-06-15');
      await expect(input).toHaveValue('2026-06-15');
    });

    test('date input respects min/max constraints', async ({ page }) => {
      const input = page.locator('#date-markup-input-type');
      await expect(input).toHaveAttribute('min', '2020-01-01');
      await expect(input).toHaveAttribute('max', '2030-12-31');
    });

    test('time input accepts new value', async ({ page }) => {
      const input = page.locator('#time-markup-input-type');
      await input.fill('14:45');
      await expect(input).toHaveValue('14:45');
    });
  });

  test.describe('color inputs', () => {
    test('primary color input exists with correct default', async ({ page }) => {
      const input = page.locator('#color-input-1');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('type', 'color');
      await expect(input).toHaveValue('#008079');
    });

    test('secondary color input exists with correct default', async ({ page }) => {
      const input = page.locator('#color-input-2');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('type', 'color');
      await expect(input).toHaveValue('#222222');
    });

    test('color input accepts new value', async ({ page }) => {
      const input = page.locator('#color-input-1');
      await input.evaluate(el => { el.value = '#ff0000'; el.dispatchEvent(new Event('input')); });
      await expect(input).toHaveValue('#ff0000');
    });
  });

  test.describe('range input', () => {
    test('range input exists with correct defaults', async ({ page }) => {
      const input = page.locator('#range-input');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('type', 'range');
      await expect(input).toHaveAttribute('min', '1');
      await expect(input).toHaveAttribute('max', '10');
      await expect(input).toHaveAttribute('step', '1');
      await expect(input).toHaveValue('5');
    });

    test('range display shows current value', async ({ page }) => {
      await expect(page.locator('#range-display')).toHaveText('5');
    });

    test('range display updates when slider moves', async ({ page }) => {
      const input = page.locator('#range-input');
      await input.fill('8');
      await expect(page.locator('#range-display')).toHaveText('8');
    });

    test('range input clamps to min/max', async ({ page }) => {
      const input = page.locator('#range-input');
      await input.fill('1');
      await expect(input).toHaveValue('1');
      await input.fill('10');
      await expect(input).toHaveValue('10');
    });
  });

  test.describe('labels and accessibility', () => {
    test('all date/time inputs have associated labels', async ({ page }) => {
      const pairs = [
        ['date-markup-input-type', 'Date:'],
        ['new-input-type-form-input-2', 'Datetime-local:'],
        ['month-markup-input-type', 'Month:'],
        ['time-markup-input-type', 'Time:'],
        ['week-markup-input-type', 'Week:'],
      ];
      for (const [id, text] of pairs) {
        await expect(page.locator(`label[for="${id}"]`)).toHaveText(text);
      }
    });

    test('color inputs have associated labels', async ({ page }) => {
      await expect(page.locator('label[for="color-input-1"]')).toHaveText('Primary Color');
      await expect(page.locator('label[for="color-input-2"]')).toHaveText('Secondary Color');
    });

    test('range input has associated label', async ({ page }) => {
      await expect(page.locator('label[for="range-input"]')).toHaveText('Volume (1-10):');
    });
  });
});

test.describe('index page link to HTML5 Form Inputs', () => {
  test('index page has link to html5FormInputs', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('#link-container a[href="./pages/html5FormInputs.html"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveText('HTML5 Form Inputs');
  });

  test('link navigates to HTML5 Form Inputs page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="./pages/html5FormInputs.html"]');
    await expect(page.locator('h3')).toHaveText('HTML5 Form Input Types');
  });
});

test.describe('existing index page links unchanged', () => {
  test('all original links still present', async ({ page }) => {
    await page.goto('/');
    const expectedLinks = [
      ['./pages/complexRoles.html', 'Complex Roles'],
      ['./pages/datePicker.html', 'Date Picker'],
      ['./pages/dialogs.html', 'Dialogs'],
      ['./pages/doubleClick.html', 'Double Click'],
      ['./pages/draganddropcoords.html', 'Drag and drop coordinates'],
      ['./pages/dynamicIframe.html', 'Dynamic Iframe'],
      ['./pages/externalLink.html', 'External Link'],
      ['./pages/externalIframeWithShadow.html', 'External Iframe WITH Shadow Root'],
      ['./pages/externalIframeWithoutShadow.html', 'External Iframe WITHOUT Shadow Root'],
      ['./pages/externalSiteWithImage.html', 'External Site With Image'],
      ['./pages/fileUpload.html', 'File Upload'],
      ['./pages/internalIframe.html', 'Internal Iframe'],
      ['./pages/richTextEditor.html', 'Rich Text Editor'],
      ['./pages/sampleVideo.html', 'Sample Video'],
      ['./pages/simpleRoles.html', 'Simple Roles'],
      ['./pages/drag_drop_coords.html', 'Drag And Drop By Coordinates'],
    ];
    for (const [href, text] of expectedLinks) {
      const link = page.locator(`#link-container a[href="${href}"]`);
      await expect(link).toBeVisible();
      await expect(link).toHaveText(text);
    }
  });
});
