const { test, expect } = require('@playwright/test');

test.describe('Staff Management – Full CRUD Flow', () => {

  test.beforeEach(async ({ page }) => {

    // ---------------- MOCK APIs ----------------

    // States
    await page.route(/\/state$/, route =>
      route.fulfill({
        json: [{ "State Code": 29, "State Name": "Karnataka" }]
      })
    );

    // Categories
    await page.route(/\/getcategory$/, route =>
      route.fulfill({
        json: {
          exsiting_data: [{ _id: 'cat1', name: 'Sanitation' }]
        }
      })
    );

    // Staff list
    await page.route(/\/superadmin\/staff$/, route =>
      route.fulfill({
        json: {
          staff: [{
            _id: 's1',
            name: 'Existing Staff',
            email: 'existing@test.com',
            mobile: '9999999999',
            category: 'Sanitation',
            state: 'Karnataka',
            district: 'Udupi'
          }]
        }
      })
    );

    // Add staff
    await page.route(/\/superadmin\/addstaff$/, route =>
      route.fulfill({ status: 200, json: { message: 'staff added' } })
    );

    // Update staff
    await page.route(/\/superadmin\/updatestaff\/s1$/, route =>
      route.fulfill({ status: 200, json: { message: 'staff updated' } })
    );

    // Delete staff
    await page.route(/\/superadmin\/admin\/s1$/, route =>
      route.fulfill({ status: 200, json: { message: 'staff deleted' } })
    );

    // -------------------------------------------

    await page.goto('http://localhost:3000/staff', { waitUntil: 'networkidle' });
  });

  // ==================================================
  // ADD STAFF
  // ==================================================
  test('Add new staff', async ({ page }) => {

    await page.getByRole('button', { name: 'Add Staff' }).click();

    await expect(
      page.getByTestId('add-staff-title')
    ).toBeVisible();

    await page.fill('input[name="name"]', 'New Staff');
    await page.fill('input[name="email"]', 'newstaff@test.com');
    await page.fill('input[name="mobile"]', '9876543210');

    await Promise.all([
      page.waitForResponse(res =>
        res.url().includes('/superadmin/addstaff') && res.status() === 200
      ),
      page.getByTestId('submit-add-staff').click()
    ]);

    await expect(
      page.getByTestId('add-staff-title')
    ).not.toBeVisible();
  });

  // ==================================================
  // EDIT STAFF
  // ==================================================
  test('Edit staff', async ({ page }) => {

    await expect(page.getByText('Existing Staff')).toBeVisible();

    await page.getByRole('button', { name: 'Edit' }).click();

    await expect(
      page.getByTestId('edit-staff-title')
    ).toBeVisible();

    await page.fill('input[name="name"]', 'Updated Staff');

    await Promise.all([
      page.waitForResponse(res =>
        res.url().includes('/superadmin/updatestaff') && res.status() === 200
      ),
      page.getByTestId('submit-edit-staff').click()
    ]);

    await expect(
      page.getByTestId('edit-staff-title')
    ).not.toBeVisible();
  });

  // ==================================================
  // DELETE STAFF
  // ==================================================
  test('Delete staff', async ({ page }) => {

    await expect(page.getByText('Existing Staff')).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(
      page.getByText('Delete Staff?')
    ).toBeVisible();

    await Promise.all([
      page.waitForResponse(res =>
        res.url().includes('/superadmin/admin') && res.status() === 200
      ),
      page.getByTestId('confirm-delete-staff').click()
    ]);

    await expect(
      page.getByText('Delete Staff?')
    ).not.toBeVisible();
  });

});
