const { test, expect } = require('@playwright/test');

test('Grievance Management: List and Status Verification', async ({ page }) => {

    // Mock API response
    await page.route(/.*\/superadmin\/grievances/, async route => {
        const json = {
            all: [
                {
                    _id: '101',
                    title: 'Broken Road',
                    category: 'Infrastructure',
                    status: 'Pending',
                    createdAt: '2025-01-01',
                    assignedTo: 'John Doe'
                },
                {
                    _id: '102',
                    title: 'No Water',
                    category: 'Water',
                    status: 'Resolved',
                    createdAt: '2025-01-02',
                    assignedTo: 'Jane Smith'
                }
            ]
        };
        await route.fulfill({ json });
    });

    await page.goto('/grievances');

    // Verify Table Headers
    await expect(page.getByText('Title')).toBeVisible();
    await expect(page.getByText('Category')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();

    // Verify Data Rows
    await expect(page.getByText('Broken Road')).toBeVisible();
    await expect(page.getByText('Infrastructure')).toBeVisible();

    // Verify Status Badge Text
    await expect(page.getByText('Pending')).toBeVisible();
    await expect(page.getByText('Resolved')).toBeVisible();

    // Verify Status Colors (Class check)
    // Pending should have yellow classes
    const pendingBadge = page.getByText('Pending');
    await expect(pendingBadge).toHaveClass(/bg-yellow-100/);
    await expect(pendingBadge).toHaveClass(/text-yellow-800/);

    // Resolved should have green classes
    const resolvedBadge = page.getByText('Resolved');
    await expect(resolvedBadge).toHaveClass(/bg-green-100/);
    await expect(resolvedBadge).toHaveClass(/text-green-800/);
});
