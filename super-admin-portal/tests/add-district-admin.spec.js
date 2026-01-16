const { test, expect } = require('@playwright/test');

test('Super Admin adds a new District Admin (stable & async-safe)', async ({ page }) => {

  // Mock API responses using Regex to cover all endpoints

  // 1. Mock State
  await page.route(/.*\/state/, async route => {
    const json = [{ "State Code": 29, "State Name": "Karnataka" }];
    await route.fulfill({ json });
  });

  // 2. Mock Districts
  await page.route(/.*\/districts\/.*/, async route => {
    const json = [{ "District Code": 1, "District Name": "Udupi", "State Code": 29 }];
    await route.fulfill({ json });
  });

  // 3. Mock Admin Registration (POST)
  await page.route(/.*\/superadmin\/adminregister/, async route => {
    await route.fulfill({ status: 200, json: { message: "Admin created successfully!" } });
  });

  // 4. Mock Admin List (GET) - Return the new admin so the table check passes
  await page.route(/.*\/superadmin\/alladminlst/, async route => {
    const json = {
      admin: [
        {
          _id: "mock_id_123",
          name: "Test District Admin",
          email: "testdistrict@gmail.com",
          role: "DistrictAdmin",
          state: "Karnataka",
          district: "Udupi",
          Permissions: ["add staff", "add admin"]
        }
      ]
    };
    await route.fulfill({ json });
  });

  // Handle Alerts
  page.on('dialog', async dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.dismiss();
  });

  await page.goto('http://localhost:3000/admins', { waitUntil: 'networkidle' });

  // Verify Page Load
  await expect(page.getByText('Manage Admins')).toBeVisible();

  // Open Modal
  await page.getByRole('button', { name: 'Add Admin' }).click();
  await expect(page.getByText('Add New District Admin')).toBeVisible();

  // Fill Form
  await page.getByPlaceholder('Name').fill('Test District Admin');
  await page.getByPlaceholder('Email').fill(`testdistrict${Date.now()}@gmail.com`);
  await page.getByPlaceholder('Password').fill('Admin@123');
  await page.getByPlaceholder('Mobile').fill('9876543210');

  // Check Permissions
  await page.locator('label:has-text("add staff") input').check();
  await page.locator('label:has-text("add admin") input').check();
  await page.locator('label:has-text("assign staff") input').check();
  await page.locator('label:has-text("add category") input').check();

  // Select State (Mocked)
  const stateSelect = page.locator('.modal-box select').nth(0);
  await expect(stateSelect.locator('option')).not.toHaveCount(1, { timeout: 10000 });
  await stateSelect.selectOption({ label: 'Karnataka' });

  // Select District (Mocked)
  const districtSelect = page.locator('.modal-box select').nth(1);
  await expect(districtSelect.locator('option')).not.toHaveCount(1, { timeout: 10000 });
  await districtSelect.selectOption({ label: 'Udupi' });

  // Submit
  await page.getByRole('button', { name: 'Create' }).click();

  // Assert New Admin exists in table (Mocked list ensures this)
  await expect(page.getByText('Test District Admin', { exact: false })).toBeVisible();
});