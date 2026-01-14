import { test, expect } from '@playwright/test';

test.describe('Alternance-360 E2E', () => {

    test('TSF Viewer - Apprentice Access', async ({ page }) => {
        // Login as Apprentice
        await page.goto('/login');
        await page.fill('input[type="email"]', 'apprenti@demo.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]', { force: true });
        await page.waitForURL('**/apprentice');

        // Go to TSF Demo
        await page.goto('/dashboard/tsf-demo');

        // Assertions
        await expect(page.locator('h1')).toContainText('Simulation Apprenti');
        await expect(page.getByText('U11 : Relation Client')).toBeVisible();

        // Toggle
        const firstTrigger = page.locator('button[type="button"][aria-expanded="false"]').first();
        await firstTrigger.click();
        const checkbox = page.locator('button[role="checkbox"]').first();
        const initialState = await checkbox.getAttribute('data-state') || '';
        await checkbox.click();
        await expect(checkbox).not.toHaveAttribute('data-state', initialState);
    });

    test('Batch Signing - Admin Access', async ({ page }) => {
        // Login as Admin
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@demo.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]', { force: true });
        await page.waitForURL('**/admin');

        // Go to Batch Demo
        await page.goto('/dashboard/batch-demo');

        // Assertions
        await expect(page.locator('h1')).toContainText('Signature de Groupe');
        await expect(page.getByText('Ulysse Apprenti')).toBeVisible(); // This might fail if Ulysse is not visible to admin?
        // Wait, Ulysse is linked to "ref-bts-mco" which is global.
        // getPromotionApprentices fetches by Referentiel.

        // Select All
        const selectAll = page.locator('thead button[role="checkbox"]');
        await selectAll.click();

        // Sign
        page.on('dialog', dialog => dialog.accept());
        await page.getByText('Signer 1 livrets').click();

        // Success
        await expect(page.getByText('Succès !')).toBeVisible({ timeout: 15000 });
    });

    test('Archiving - Admin Access', async ({ page }) => {
        // Login as Admin
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@demo.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]', { force: true });
        await page.waitForURL('**/admin');

        // Go to Maintenance
        await page.goto('/admin/maintenance');

        // Assertions
        await expect(page.locator('h1')).toContainText('Maintenance & Archivage');
        await expect(page.getByText("Procédure d'Archivage Annuel")).toBeVisible();
    });

});
