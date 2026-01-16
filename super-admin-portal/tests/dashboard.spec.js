const { test, expect } = require('@playwright/test');

test('Dashboard loads statistics and charts correctly', async ({ page }) => {

    // Mock API response for dashboard data
    await page.route(/.*\/superadmin\/grievances/, async route => {
        const json = {
            total: 100,
            total_pending: 40,
            total_resolved: 50,
            total_assigned: 10,
            // Recharts data is hardcoded in frontend, but this endpoint drives the cards
        };
        await route.fulfill({ json });
    });

    await page.goto('/dashboard'); // BaseURL is localhost:3000

    // Verify Stat Cards
    await expect(page.getByText('Total Grievances')).toBeVisible();
    await expect(page.getByText('100')).toBeVisible(); // Total

    await expect(page.getByText('Pending')).toBeVisible();
    await expect(page.getByText('40')).toBeVisible(); // Pending

    await expect(page.getByText('Resolved')).toBeVisible();
    await expect(page.getByText('50')).toBeVisible(); // Resolved

    await expect(page.getByText('Assigned')).toBeVisible();
    await expect(page.getByText('10')).toBeVisible(); // Assigned

    // Verify Charts are present (by title)
    await expect(page.getByText('Grievance Trends')).toBeVisible();
    await expect(page.getByText('Categories Distribution')).toBeVisible();

    // Optional: Check if SVG elements for charts are rendered
    await expect(page.locator('.recharts-surface').first()).toBeVisible();
});
