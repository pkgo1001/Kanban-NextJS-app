
import { test as testPlus, expect } from '../../fixtures/api-fixtures';
import { UserFactory, TaskFactory } from '../../helpers/test-data';
import { CreateTaskRequest } from '../../models'; 
import { LoginPage } from '../../pom/LoginPage';
import { KanbanPage } from '../../pom/KanbanPage';
import { TaskPage } from '../../pom/TaskPage';
import { getTestUser, getCurrentEnvironment, logTestConfig } from '../../config/test-config';
import { ResponseValidator } from '../../helpers/api/ResponseValidator';


testPlus.describe('Kanban I', () => {
    testPlus.describe.configure({ mode: 'serial' });
    let kanbanPage: KanbanPage;
    let loginPage: LoginPage;
    let taskPage: TaskPage;
    let testTaskTitle: string;
    let testTaskId: string;


    testPlus.beforeAll(async ({ workerTaskService, workerAdminToken }) => {
        logTestConfig(); //esto solo muestra la configuraciones de las pruebas
   
        //Crear un tarea para tests via API
        const time = new Date()         
        const now  = time.toISOString()
        testTaskTitle = 'New TASK for TESTING ' + now
        const taskData = TaskFactory.createAssigned('Sarah Chen', {
            title: testTaskTitle,
            priority: 'high',
            tags: ['nivel3', 'test', 'automated']
          });
          
        const response = await workerTaskService.create(taskData, workerAdminToken);
        if (response.status !== 200 && response.status !== 201) {
            throw new Error(`Failed to create test task: ${JSON.stringify(response.body)}`);
        }
        testTaskId = response.body.id; // Guardo el task ID para usarlo en el afterAll con el API, porque en el afterAll el page ya se ha destruido, por lo que no puedo eliminar el task via UI
        ResponseValidator.validateSuccess(response);

    });

    testPlus.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        kanbanPage = new KanbanPage(page);
        taskPage = new TaskPage(page)
        await loginPage.goto();
        const testUser = getTestUser('admin');
        await loginPage.login(testUser.email, testUser.password);
        await kanbanPage.waitForPageLoad();
    });

    testPlus.skip('should display kanban page with all elements @smoke', async () => {
        // Verify all elements are present
        await kanbanPage.waitForPageLoad();

        // Verify page title
        await expect(kanbanPage.getPageTitle()).toHaveText('Kanban Dashboard');

        // Verify columns are present
        await expect(kanbanPage.getKanbanColumn('TODO')).toBeVisible();
        await expect(kanbanPage.getKanbanColumn('In Progress')).toBeVisible();
        await expect(kanbanPage.getKanbanColumn('Done')).toBeVisible();
    });
    testPlus.skip('Should allow creating and deleting a new task in TODO column', async () => {

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
        await kanbanPage.page.reload()
        await kanbanPage.waitForPageLoad()
        await kanbanPage.page.waitForLoadState('networkidle')
        // Verify the task count in TODO column has increased by 1
        const updatedCardCount = await kanbanPage.getTaskCountByColumn('TODO')
        
        expect(updatedCardCount).toBe(initialCardCount + 1)

        // Delete the created task to clean up
        await kanbanPage.deleteTaskByText('New Task from Kanban Test ' + now)
    });
    testPlus.skip('Should allow creating and deleting a new task in In Progress column', async () => {
        const intialCardCount = await kanbanPage.getTaskCountByColumn('In Progress');
        const time = new Date()         
        const now = time.toISOString()
        await kanbanPage.getCreateTasksButtonTop('In Progress').click()
        await taskPage.waitForPageLoad()
        await taskPage.createTask(
            'New Task from Kanban Test ' + now,
            'This is a task created during kanban page testing on ' + now,
            'High',
            'Sarah Chen',
            '2024-12-31',
            ['testing', 'kanban']
        )
        await kanbanPage.page.reload()
        await kanbanPage.waitForPageLoad()
        await kanbanPage.page.waitForLoadState('networkidle')
        const updatedCardCount = await kanbanPage.getTaskCountByColumn('In Progress')
        expect(updatedCardCount).toBe(intialCardCount + 1)
        await kanbanPage.deleteTaskByText('New Task from Kanban Test ' + now)
    });
    testPlus.skip('Task can be dragged and dropped between columns',async({taskService,adminToken})=>{
        const initialTODOCardCount = await kanbanPage.getTaskCountByColumn('TODO')
        const initialInProgressCardCount = await kanbanPage.getTaskCountByColumn('In Progress')
        const time = new Date()         
        const now  = time.toISOString()
        const taskTitle = 'New Task from Kanban Test ' + now

        await testPlus.step('Create a new task in TODO column',async()=>{ 
            const taskData = TaskFactory.createAssigned('Sarah Chen', {
                title: taskTitle,
                priority: 'high',
                tags: ['nivel3', 'test', 'automated']
              });
              
            const response = await taskService.create(taskData, adminToken);
              
            ResponseValidator.validateSuccess(response);
            await kanbanPage.page.reload();
            await kanbanPage.waitForPageLoad()
            const updatedTODOCardCount = await kanbanPage.getTaskCountByColumn('TODO')
            expect(updatedTODOCardCount).toBe(initialTODOCardCount + 1)
        })
        
        await testPlus.step('Drag and drop the task to In Progress column',async()=>{
            await kanbanPage.dragAndDropTask(taskTitle, 'In Progress') 
            const updatedInProgressCardCount = await kanbanPage.getTaskCountByColumn('In Progress')
            expect(updatedInProgressCardCount).toBe(initialInProgressCardCount+1)
        })

        await testPlus.step('Delete the task from In Progress column',async()=>{
            await kanbanPage.deleteTaskByText(taskTitle)
            await kanbanPage.page.reload()
            await kanbanPage.waitForPageLoad()
            const updatedCardCount = await kanbanPage.getTaskCountByColumn('In Progress')
            expect(updatedCardCount).toBe(initialInProgressCardCount)
        })
    });
    testPlus.skip('Validate Title is required whne creating a task', async()=>{
       await kanbanPage.getCreateTasksButtonInColumn('TODO').click()
        await taskPage.waitForPageLoad()
        await taskPage.getTaskTitleInput().clear()
        await taskPage.getCreateTaskButton().click()
        expect(taskPage.getTitleErrorMessage()).toBeVisible()
        await taskPage.clickCancel()
    });
    testPlus.describe('Una Sola tarea...',()=>{
        testPlus('Change a tasks priority', async()=>{
            await kanbanPage.getTaskByText(testTaskTitle).locator(kanbanPage.getEditTaskButtons()).click()
            await taskPage.waitForPageLoad()
            await taskPage.setPriority('Low')
            await taskPage.clickSaveTaskButton();
            await taskPage.page.waitForLoadState('networkidle')

            await kanbanPage.page.reload()
            await kanbanPage.waitForPageLoad()
    
            await kanbanPage.getTaskByText(testTaskTitle).locator(kanbanPage.getEditTaskButtons()).click()
            await taskPage.waitForPageLoad()
            await taskPage.page.waitForLoadState('networkidle')
            // Verificar el texto sin abrir el dropdown
            await expect(taskPage.getPriorityCombo()).toContainText('Low', { timeout: 10000 })
            await taskPage.clickCancel() 
            await kanbanPage.waitForPageLoad() 
    
        });
        testPlus('Change Status', async()=>{
            await kanbanPage.getTaskByText(testTaskTitle).locator(kanbanPage.getEditTaskButtons()).click()
            await taskPage.waitForPageLoad()
            await taskPage.setStatus('Done')
            await taskPage.clickSaveTaskButton()
            await taskPage.page.waitForLoadState('networkidle')

            await kanbanPage.page.reload()
            await kanbanPage.waitForPageLoad()

            await kanbanPage.getTaskByText(testTaskTitle).locator(kanbanPage.getEditTaskButtons()).click()
            await taskPage.waitForPageLoad()
            expect(taskPage.getStatusCombo()).toContainText('Done')
            await taskPage.clickCancel() 
            await kanbanPage.waitForPageLoad()
        });
        testPlus('Change Assignee',async()=>{
            await kanbanPage.getTaskByText(testTaskTitle).locator(kanbanPage.getEditTaskButtons()).click()
            await taskPage.waitForPageLoad()
            await taskPage.setAssignee('David Park')
            await taskPage.clickSaveTaskButton()
            await taskPage.page.waitForLoadState('networkidle')

            await kanbanPage.page.reload()
            await kanbanPage.waitForPageLoad()

            await kanbanPage.getTaskByText(testTaskTitle).locator(kanbanPage.getEditTaskButtons()).click()
            await taskPage.waitForPageLoad()
            await taskPage.page.waitForLoadState('networkidle')
            await taskPage.page.waitForTimeout(500)
            await expect(taskPage.getAssigneeCombo()).toContainText('David Park', { timeout: 10000 })
            await taskPage.clickCancel() 
            await kanbanPage.waitForPageLoad()
        });
    });
    
    testPlus.afterAll(async ({ workerTaskService, workerAdminToken })=>{
        await workerTaskService.delete(testTaskId, workerAdminToken )
    })

});

testPlus.describe('Kanban II',()=>{ // en serie, creando una tarea para cada test
    testPlus.describe.configure({ mode: 'serial' });
    let kanbanPage: KanbanPage;
    let loginPage: LoginPage;
    let taskPage: TaskPage;
    let testTaskTitle: string;
    let testTaskId: string;
    let taskData : CreateTaskRequest;
     

    testPlus.beforeAll(async()=>{
        logTestConfig(); //esto solo muestra la configuraciones de las pruebas
    })
    testPlus.beforeEach(async({taskService, adminToken, page})=>{
        loginPage = new LoginPage(page);
        kanbanPage = new KanbanPage(page);
        taskPage = new TaskPage(page);
        taskData = TaskFactory.createUnique();
        const response = await taskService.create(taskData, adminToken);
        testTaskTitle = taskData.title;
        testTaskId=response.body.id;
        ResponseValidator.validateSuccess(response);
        console.log(`Test task Creado. Titulo ${taskData.title}`);
        
        await loginPage.goto();
        const testUser = getTestUser('admin');
        await loginPage.login(testUser.email, testUser.password);
        await kanbanPage.waitForPageLoad(); 
    })


    testPlus('Change a tasks priority', async()=>{
        await kanbanPage.getTaskByText(testTaskTitle).locator(kanbanPage.getEditTaskButtons()).click()
        await taskPage.waitForPageLoad()
        await taskPage.setPriority('Low')
        await taskPage.getTaskDescriptionInput().click()
        await taskPage.clickSaveTaskButton()
        await taskPage.page.waitForLoadState('networkidle')

        await kanbanPage.page.reload()
        await kanbanPage.waitForPageLoad()

        await kanbanPage.getTaskByText(testTaskTitle).locator(kanbanPage.getEditTaskButtons()).click()
        await taskPage.waitForPageLoad()
        await taskPage.page.waitForLoadState('networkidle')
        // Verificar el texto sin abrir el dropdown
        await expect(taskPage.getPriorityCombo()).toContainText('Low', { timeout: 10000 })
        await taskPage.clickCancel() 
        await kanbanPage.waitForPageLoad() 

    });
    testPlus('Change Status', async()=>{
        await kanbanPage.getTaskByText(testTaskTitle).locator(kanbanPage.getEditTaskButtons()).click()
        await taskPage.waitForPageLoad()
        await taskPage.setStatus('Done')
        await taskPage.clickSaveTaskButton()
        await taskPage.page.waitForLoadState('networkidle')

        await kanbanPage.page.reload()
        await kanbanPage.waitForPageLoad()

        await kanbanPage.getTaskByText(testTaskTitle).locator(kanbanPage.getEditTaskButtons()).click()
        await taskPage.waitForPageLoad()
        expect(taskPage.getStatusCombo()).toContainText('Done')
        await taskPage.clickCancel() 
        await kanbanPage.waitForPageLoad()
    });
    testPlus('Change Assignee',async()=>{
        await kanbanPage.getTaskByText(testTaskTitle).locator(kanbanPage.getEditTaskButtons()).click()
        await taskPage.waitForPageLoad()
        await taskPage.setAssignee('David Park')
        await taskPage.clickSaveTaskButton();
        await taskPage.page.waitForLoadState('networkidle')

        await kanbanPage.page.reload()
        await kanbanPage.waitForPageLoad()

        await kanbanPage.getTaskByText(testTaskTitle).locator(kanbanPage.getEditTaskButtons()).click()
        await taskPage.waitForPageLoad()
        await taskPage.page.waitForLoadState('networkidle')
        await expect(taskPage.getAssigneeCombo()).toContainText('David Park', { timeout: 10000 })
        await taskPage.clickCancel() 
        await kanbanPage.waitForPageLoad()
    });

    testPlus.afterEach(async({taskService, adminToken})=>{
        await taskService.delete(testTaskId, adminToken)
    })
});//Describe
testPlus.describe('Kanban III',()=>{ //EN paralelo, creando una tarea en cada test
    testPlus.describe.configure({ mode: 'parallel' });
    // NO declarar page objects aquí cuando es parallel

    testPlus.beforeAll(async()=>{
        logTestConfig();
    })

    testPlus('Change a tasks priority', async({taskService, adminToken, page})=>{
        // Declarar page objects DENTRO del test
        const loginPage = new LoginPage(page);
        const kanbanPage = new KanbanPage(page);
        const taskPage = new TaskPage(page);
        
        await loginPage.goto();
        const testUser = getTestUser('admin');
        await loginPage.login(testUser.email, testUser.password);
        await kanbanPage.waitForPageLoad();

        let testTaskTitle: string;
        let testTaskId: string;
        let taskData : CreateTaskRequest;

        taskData = TaskFactory.createUnique();
        const response = await taskService.create(taskData, adminToken);
        testTaskTitle = taskData.title;
        testTaskId = response.body.id;
        ResponseValidator.validateSuccess(response);
        
        // ... resto del test usando kanbanPage, taskPage locales ...
        
        await taskService.delete(testTaskId, adminToken);
    });

    testPlus('Change Status', async({taskService, adminToken, page})=>{
        const loginPage = new LoginPage(page);
        const kanbanPage = new KanbanPage(page);
        const taskPage = new TaskPage(page);
        
        await loginPage.goto();
        const testUser = getTestUser('admin');
        await loginPage.login(testUser.email, testUser.password);
        await kanbanPage.waitForPageLoad();

        // ... resto del test ...
    });

    testPlus('Change Assignee', async({taskService, adminToken, page})=>{
        const loginPage = new LoginPage(page);
        const kanbanPage = new KanbanPage(page);
        const taskPage = new TaskPage(page);
        
        await loginPage.goto();
        const testUser = getTestUser('admin');
        await loginPage.login(testUser.email, testUser.password);
        await kanbanPage.waitForPageLoad(); 

    });
});//Describe