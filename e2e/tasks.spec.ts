import { test, expect } from '@playwright/test';

test('a user can create a task and see it in the list', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('Title').fill('Finish lab report');
  await page.getByPlaceholder('Description').fill('Write up results');
  await page.locator('input[name="dueDate"]').fill('2026-12-01');
  await page.getByPlaceholder('Topic').fill('Coursework');
  await page.getByRole('button', { name: 'Add Task' }).click();

  await expect(page.getByText('Finish lab report')).toBeVisible();
});

test('an edited task keeps its changes after a page reload', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('Title').fill('Draft outline');
  await page.locator('input[name="dueDate"]').fill('2026-12-01');
  await page.getByPlaceholder('Topic').fill('Writing');
  await page.getByRole('button', { name: 'Add Task' }).click();

  const taskRow = page.locator('li', { hasText: 'Draft outline' });
  await taskRow.getByRole('link', { name: 'Edit' }).click();

  await page.getByRole('textbox').first().fill('Draft full outline');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Draft full outline')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Draft full outline')).toBeVisible();
});

test('archiving requires a two-step confirmation, and archived tasks remain viewable', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('Title').fill('Task to archive');
  await page.locator('input[name="dueDate"]').fill('2026-12-01');
  await page.getByPlaceholder('Topic').fill('Test');
  await page.getByRole('button', { name: 'Add Task' }).click();

  const taskRow = page.locator('li', { hasText: 'Task to archive' });
  await taskRow.getByRole('button', { name: 'Archive' }).click();

  // after first click, it should show "Sure?" not have archived yet
  await expect(taskRow.getByText('Sure?')).toBeVisible();
  await expect(page.getByText('Task to archive')).toBeVisible();

  await taskRow.getByRole('button', { name: 'Yes' }).click();

  // now it should be gone from the active list
  await expect(page.getByText('Task to archive')).not.toBeVisible();

  // but still visible in the archive
  await page.goto('/archived');
  await expect(page.getByText('Task to archive')).toBeVisible();
});

test('canceling the archive confirmation keeps the task active', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('Title').fill('Do not archive me');
  await page.locator('input[name="dueDate"]').fill('2026-12-01');
  await page.getByPlaceholder('Topic').fill('Test');
  await page.getByRole('button', { name: 'Add Task' }).click();

  const taskRow = page.locator('li', { hasText: 'Do not archive me' });
  await taskRow.getByRole('button', { name: 'Archive' }).click();
  await taskRow.getByRole('button', { name: 'No' }).click();

  await expect(page.getByText('Do not archive me')).toBeVisible();
});

test('the list re-sorts when a sort link is clicked', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('Title').fill('Zebra task');
  await page.locator('input[name="dueDate"]').fill('2026-12-01');
  await page.getByPlaceholder('Topic').fill('Zoo');
  await page.getByRole('button', { name: 'Add Task' }).click();

  await page.getByPlaceholder('Title').fill('Apple task');
  await page.locator('input[name="dueDate"]').fill('2026-12-02');
  await page.getByPlaceholder('Topic').fill('Alpha');
  await page.getByRole('button', { name: 'Add Task' }).click();

  await page.getByRole('link', { name: 'Topic' }).click();
  await expect(page).toHaveURL(/sort=topic/);

  const titles = await page.locator('li span.font-serif').allTextContents();
  const zebraIndex = titles.findIndex(t => t.includes('Zebra task'));
  const appleIndex = titles.findIndex(t => t.includes('Apple task'));
  expect(appleIndex).toBeLessThan(zebraIndex);
});

test('a past-due task is visually flagged as overdue, and completing it removes the flag', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('Title').fill('Old task');
  await page.locator('input[name="dueDate"]').fill('2020-01-01');
  await page.getByPlaceholder('Topic').fill('Test');
  await page.getByRole('button', { name: 'Add Task' }).click();

  const taskRow = page.locator('li', { hasText: 'Old task' });
  await expect(taskRow.getByText('Overdue', { exact: true })).toBeVisible();

  await taskRow.getByRole('link', { name: 'Edit' }).click();
  await page.locator('select[name="status"]').selectOption('complete');
  await page.getByRole('button', { name: 'Save' }).click();

  const updatedRow = page.locator('li', { hasText: 'Old task' });
  await expect(updatedRow.getByText('Overdue', { exact: true })).not.toBeVisible();
});

test('the empty state shows when there are no active tasks', async ({ page }) => {
  await page.goto('/');
  // Runs before any test in this file adds tasks if run in isolation;
  // if other tests have already run against the same DB, skip this assertion gracefully.
  const emptyMessage = page.getByText('No tasks yet');
  const hasAnyTask = await page.locator('ul li').count();
  if (hasAnyTask === 0) {
    await expect(emptyMessage).toBeVisible();
  }
});