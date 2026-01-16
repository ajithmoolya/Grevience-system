const { test, expect } = require('@playwright/test');

test('Navigation Check', async ({ page }) => {
    // Navigate directly to dashboard
    await page.goto('/');

    // Navigate to Admins
    await page.getByRole('link', { name: 'Admins' }).click();

    await expect(page).toHaveURL(/\/admins/);
    await expect(page.getByText('Manage Admins')).toBeVisible();

    // Navigate to Staff
    await page.getByRole('link', { name: 'Staff' }).click();
    await expect(page).toHaveURL(/\/staff/);
    await expect(page.getByText('Manage Staff')).toBeVisible();

    // Navigate to Categories
    await page.getByRole('link', { name: 'Categories' }).click();
    await expect(page).toHaveURL(/\/categories/);
    await expect(page.getByText('Manage Categories')).toBeVisible();

    // Navigate to Grievances
    await page.getByRole('link', { name: 'Grievances' }).click();
    await expect(page).toHaveURL(/\/grievances/);

});
