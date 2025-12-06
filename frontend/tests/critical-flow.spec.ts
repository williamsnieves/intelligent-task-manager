import { test, expect } from '@playwright/test';

test.describe('Critical User Flow', () => {
  const timestamp = Date.now();
  const user = {
    name: `Test User ${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'password123',
  };
  const project = {
    name: `Project ${timestamp}`,
    color: '#ff0000',
  };
  const task = {
    title: `Task ${timestamp}`,
    description: 'E2E Test Task Details',
  };

  test('should complete the full lifecycle: register -> login -> create project -> create task', async ({ page }) => {
    // 1. Register
    await page.goto('/register');
    await page.fill('input[type="text"]', user.name);
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button:has-text("Register")');

    // Verify redirect to login
    await expect(page).toHaveURL(/\/login/);

    // 2. Login
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button:has-text("Sign in")');

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    // Use .first() because "Task Manager" appears in both desktop sidebar and mobile header
    await expect(page.getByText('Task Manager', { exact: true }).first()).toBeVisible();

    // 3. Create Project
    // Click the "+" button in sidebar
    await page.click('button[title="Add Project"]');
    
    // Fill Modal
    await page.fill('input[placeholder="My Awesome Project"]', project.name);
    await page.fill('input[type="color"]', project.color);
    await page.click('button:has-text("Create Project")');

    // Verify project appears in sidebar
    await expect(page.getByRole('button', { name: project.name })).toBeVisible();

    // 4. Select Project
    await page.click(`button:has-text("${project.name}")`);

    // 5. Create Task
    // Click "+ Add Task" button
    await page.click('button:has-text("+ Add Task")');
    
    // Fill Task Modal
    await page.fill('input[placeholder="What needs to be done?"]', task.title);
    await page.fill('textarea[placeholder="Add details..."]', task.description);
    
    // Project should be auto-selected because we are in project view
    // Use explicit selector for the submit button inside the modal to avoid clicking the "open modal" button behind overlay
    await page.click('button[type="submit"]:has-text("Add Task")');

    // Verify task appears
    await expect(page.getByText(task.title)).toBeVisible();

    // 6. Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/\/login/);
  });
});

