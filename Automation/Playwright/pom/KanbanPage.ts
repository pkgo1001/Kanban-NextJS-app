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
    private readonly editTaskButtons: Locator;
    private readonly userMangamentButton:Locator;
    

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
        this.editTaskButtons = page.getByRole('button', { name: 'Edit task' })
        this.userMangamentButton = page.getByRole('button', { name: 'User Management' })

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
    /** Getters */
    getPageTitle(): Locator {
        return this.pageTitle;
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
    getEditTaskButtons():Locator{
        return this.editTaskButtons;
    }
    getUserManagementButton():Locator{
        return this.userMangamentButton;
    }

    /***Actions */
    async deleteTaskByText(text:string){
        this.page.on('dialog', dialog => dialog.accept())
        await this.getTaskByText(text).locator(this.getDeleteTaskButton()).click()
    }
    async dragAndDropTask(taskText: string, targetColumn: string) {
        const task = this.getTaskByText(taskText);
        const column = this.getKanbanColumn(targetColumn);
        
        // Localizar el drag handle (botón con cursor-grab) dentro del task card, o sea, el boton que permite arrastrar la tarjeta.
        const dragHandle = task.locator('button.cursor-grab').first();
        
        // Esperar a que los elementos estén visibles, o sea, que la tarjeta y la columna estén visibles.
        await dragHandle.waitFor({ state: 'visible' });
        await column.waitFor({ state: 'visible' });
        
        // Obtener las coordenadas del drag handle y la columna destino, o sea, las coordenadas del boton que permite arrastrar la tarjeta y las coordenadas de la columna destino.
        const handleBox = await dragHandle.boundingBox();
        const columnBox = await column.boundingBox();
        
        if (!handleBox || !columnBox) {
            throw new Error('Could not get bounding box for drag handle or column');
        }
        
        // Coordenadas del centro del drag handle, o sea, las coordenadas del centro del boton que permite arrastrar la tarjeta.
        const startX = handleBox.x + handleBox.width / 2; //Esta formula calcula el centro de la tarjeta, 
        const startY = handleBox.y + handleBox.height / 2;
        
        // Coordenadas del destino (centro de la columna, un poco hacia abajo)
        const endX = columnBox.x + columnBox.width / 2;
        const endY = columnBox.y + 150; // Un poco dentro de la columna
        
        // Simular drag and drop con eventos de puntero para @dnd-kit
        await this.page.mouse.move(startX, startY);
        await this.page.mouse.down();
        
        // Mover primero una distancia pequeña para activar el sensor (>8px)
        await this.page.mouse.move(startX + 10, startY + 10, { steps: 5 });
        
        // Luego mover al destino
        await this.page.mouse.move(endX, endY, { steps: 25 });
        
        // Esperar un momento para que @dnd-kit procese el movimiento
        await this.page.waitForTimeout(200);
        
        await this.page.mouse.up();
        
        // Esperar a que se complete la actualización del estado
        await this.page.waitForTimeout(500);
    }
}//Class