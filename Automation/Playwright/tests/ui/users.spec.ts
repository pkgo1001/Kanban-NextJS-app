import { LoginPage } from '../../pom/LoginPage';
import {KanbanPage} from '@/pom/KanbanPage'
import {UserManagementPage} from '@/pom/UserManagementPage'
import {EditUserPage} from '@/pom/EditUserPage'
import {test,expect} from '@playwright/test'
import { getTestUser, getCurrentEnvironment, logTestConfig } from '../../config/test-config';


test.describe('User Management',()=>{
    let kanbanPage : KanbanPage;
    let userManagementPage: UserManagementPage;
    let editUserPage: EditUserPage
    let loginPage:LoginPage;
    test.beforeAll('',()=>{
        logTestConfig();
    })
    test.beforeEach(async ({page})=>{
        kanbanPage  =   new KanbanPage(page);
        userManagementPage  =   new UserManagementPage(page);
        editUserPage    =   new EditUserPage(page);
        loginPage = new LoginPage(page)

        await loginPage.goto();
        const testUser = getTestUser('admin');
        await loginPage.login(testUser.email, testUser.password);
        await kanbanPage.waitForPageLoad(); 
        await kanbanPage.getUserManagementButton().click()
    })
    test('User mangement Loads',async ()=>{
        await userManagementPage.waitForPageToBeReady();
        expect(userManagementPage.getUsersTable()).toBeVisible();
        expect(await userManagementPage.getUserTableRows().count()).toBeGreaterThan(1)
    })
    test('Validate users table',async()=>{
        const testUser = getTestUser('admin');
        const row = userManagementPage.getRowByEmail(testUser.email)
        //expect(row)
        expect(await userManagementPage.getUserTableRows().count()).toBeGreaterThan(1)
        
    })

})//Describe