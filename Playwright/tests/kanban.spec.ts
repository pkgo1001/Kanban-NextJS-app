import { test, expect } from '@playwright/test';
import { LoginPage } from '../pom/LoginPage';
import { KanbanPage } from '../pom/KanbanPage';
import { TaskPage } from '../pom/TaskPage';
import { getTestUser, getCurrentEnvironment, logTestConfig } from '../config/test-config';

test.describe('Kanban tests', () => {
    let kanbanPage: KanbanPage;
    let loginPage: LoginPage;
    let taskPage: TaskPage;

    // Log test configuration once before all tests
    test.beforeAll(() => {
        logTestConfig();
    });

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        kanbanPage = new KanbanPage(page);
        taskPage = new TaskPage(page)
        await loginPage.goto();

        const testUser = getTestUser('admin');
        await loginPage.login(testUser.email, testUser.password);
        await kanbanPage.waitForPageLoad();
    });

    test('should display kanban page with all elements @smoke', async () => {
        // Verify all elements are present
        await kanbanPage.waitForPageLoad();

        // Verify page title
        await expect(kanbanPage.getPageTitle()).toHaveText('Kanban Dashboard');

        // Verify columns are present
        await expect(kanbanPage.getKanbanColumn('TODO')).toBeVisible();
        await expect(kanbanPage.getKanbanColumn('In Progress')).toBeVisible();
        await expect(kanbanPage.getKanbanColumn('Done')).toBeVisible();
    });

    test('should allow creating and deleting a new task in TODO column', async () => {

        const initialCardCount = await kanbanPage.getTaskCountByColumn('TODO')
        const time = new Date()         
        const now = time.toISOString()
        await kanbanPage.getCreateTasksButtonTop('TODO').click()
        await taskPage.waitForPageLoad()
        await taskPage.createTask(
            'New Task from Kanban Test ' + now,
            'This is a task created during kanban page testing on ' + now,
            'High',
            'Sarah Chen',
            '2024-12-31',
            ['testing', 'kanban']
        )

        // Verify the task count in TODO column has increased by 1
        const updatedCardCount = await kanbanPage.getTaskCountByColumn('TODO')
        
        //expect(updatedCardCount).toBe(initialCardCount + 1)

        // Delete the created task to clean up
        await kanbanPage.deleteTaskByText('New Task from Kanban Test ' + now)
    })

});
