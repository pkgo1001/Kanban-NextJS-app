import { Page, Locator, expect } from '@playwright/test';

export class TaskPage {
    readonly page: Page;

    // Locators
    private readonly taskHeader: Locator;
    private readonly taskTitleInput: Locator;
    private readonly taskDescriptionInput: Locator;
    private readonly saveTaskButton: Locator;
    private readonly cancelTaskButton: Locator;
    private readonly priorityCombo: Locator;
    private readonly assigneeCombo: Locator;
    private readonly statusCombo: Locator;
    private readonly dueDatePicker: Locator;    
    private readonly tagsField: Locator;
    private readonly addTagsButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators
        this.taskHeader = page.getByRole('heading')
        this.taskTitleInput = page.getByPlaceholder('Task Title')
        this.taskDescriptionInput = page.getByPlaceholder('Task Description')
        this.priorityCombo = page.getByLabel('Priority')
        this.assigneeCombo = page.getByLabel('Assignee')
        this.statusCombo = page.getByLabel('Status')
        this.dueDatePicker = page.getByLabel('Due Date')        
        this.tagsField = page.getByPlaceholder('Add tag')
        this.addTagsButton = page.getByRole('button', { name: /Add/i })
        this.saveTaskButton = page.getByRole('button', { name: /Create Task/i })
        this.cancelTaskButton = page.getByRole('button', { name: /Cancel/i })
    }

    /** Getters */
    getTaskTitleInput(): Locator {
        return this.taskTitleInput;
    }
    
    getTaskDescriptionInput(): Locator {        
        return this.taskDescriptionInput;
    }

    getPriorityCombo(): Locator {
        return this.priorityCombo;
    }

    getAssigneeCombo(): Locator {
        return this.assigneeCombo;
    }

    getStatusCombo(): Locator {
        return this.statusCombo;
    }

    getDueDatePicker(): Locator {
        return this.dueDatePicker;
    }

    getTagsField(): Locator {
        return this.tagsField;
    }

    getAddTagsButton(): Locator {
        return this.addTagsButton;
    }   
    
    getSaveTaskButton(): Locator {
        return this.saveTaskButton;
    }
    
    getCancelTaskButton(): Locator {
        return this.cancelTaskButton;
    }
    /************* */

    waitForPageLoad() {
        return expect(this.taskHeader).toBeVisible();
    }
    async fillTaskTitle(title: string) {
        await this.taskTitleInput.clear();
        await this.taskTitleInput.fill(title);
    }

    async fillTaskDescription(description: string) {
        await this.taskDescriptionInput.clear();
        await this.taskDescriptionInput.fill(description);
    }
    
    async setPriority(priority: string) {
        await this.priorityCombo.click();
        await this.page.getByRole('option', { name: priority }).click();
    }

    async setAssignee(assignee: string) {
        await this.assigneeCombo.click()
        await this.page.getByRole('option', { name: assignee }).click();
    }

    async setStatus(status: string) {
        await this.statusCombo.click()
        await this.page.getByRole('option', { name: status }).click();
    }

    async setDueDate(date: string) {
        await this.dueDatePicker.fill(date);
    }

    async addTag(tag: string) {
        const existingTags = await this.page.locator('.tag-item').allTextContents();
        if (existingTags.includes(tag)) {
            return; // Tag already exists, do not add again
        }
        
        await this.tagsField.fill(existingTags +' '+ tag);
        await this.addTagsButton.click();
    }

    async createTask(title: string, description: string, priority: string, assignee: string, dueDate: string, tags: string[]) {
        await this.fillTaskTitle(title);
        await this.fillTaskDescription(description);
        await this.setPriority(priority);
        await this.setAssignee(assignee);
        await this.setDueDate(dueDate);
        for (const tag of tags) {
            await this.addTag(tag);
        }
        await this.saveTaskButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    clickCancel() {
        return this.cancelTaskButton.click();
    }

        
    

}   
