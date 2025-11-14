import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Login Page
 * URL: /login
 */
export class KanbanPage {
    readonly page: Page;

    // Locators
    private readonly pageTitle: Locator;
    private readonly todoColumn: Locator;
    private readonly inProgressColumn: Locator;
    private readonly doneColumn: Locator;
    private readonly addTaskButton: Locator;
    private readonly taskList: Locator;
    private readonly filterTasksInput: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators
        this.pageTitle = page.getByRole('heading', { name: 'Kanban Dashboard' });
        this.todoColumn = page.locator('div.grid.grid-cols-1.md\\:grid-cols-3 > div').filter({hasText: /^TODO/})
        this.inProgressColumn = page.locator('div.grid.grid-cols-1.md\\:grid-cols-3 > div').filter({hasText: /^In Progress/})
        this.doneColumn = page.locator('div.grid.grid-cols-1.md\\:grid-cols-3 > div').filter({hasText: /^Done/})
        this.addTaskButton = page.getByRole('button', { name: /Add task/i });
        this.taskList = page.locator('.rounded-xl.border.bg-card')
        this.filterTasksInput = page.getByPlaceholder('Filter tasks...')
    }

    /** Getters */
    getPageTitle(): Locator {
        return this.pageTitle;
    }   

    /**
     * Navigate to Kanban page
     */
    async goto() {
        await this.page.goto('/kanban');
        await this.waitForPageLoad();
    }

    /**
     * Wait for the page to fully load
     */
    async waitForPageLoad() {
        await expect(this.pageTitle).toBeVisible();
        await expect(this.addTaskButton.last()).toBeVisible();
    }

    getKanbanColumn(column: string): Locator {
        const key = column.trim().toLowerCase()
        switch (key) {
            case 'todo':         return this.todoColumn
            case 'in progress':  return this.inProgressColumn
            case 'done':         return this.doneColumn
            default:
            throw new Error(`Invalid column name: ${column}. Valid: TODO, In Progress, Done.`)
        }
    }
    getCreateTasksButtonTop(column: string): Locator {
        return this.getKanbanColumn(column).locator(this.addTaskButton).first()
    }
    getCreateTasksButtonInColumn(column: string): Locator {
        return this.getKanbanColumn(column).locator(this.addTaskButton).last()
    }
    getFilterTaskInputByColumn(column:string):Locator{
        return this.getKanbanColumn(column).locator(this.filterTasksInput)
    }
    /*Get the number of cards on the Kanban board*/
    async getTaskCountByColumn(column:string): Promise<number> {
        return await this.getKanbanColumn(column).locator(this.taskList).count();
    }
    getTaskByText(text:string):Locator{
        return this.page.locator('.rounded-xl.border.bg-card').filter({hasText:text})
    }
    getDeleteTaskButton():Locator{
        return this.page.getByRole('button', {name:'Delete task'})
    }

    /***Actions */
    async deleteTaskByText(text:string){
        this.page.on('dialog', dialog => dialog.accept())
        await this.getTaskByText(text).locator(this.getDeleteTaskButton()).click()
    }

}//Class