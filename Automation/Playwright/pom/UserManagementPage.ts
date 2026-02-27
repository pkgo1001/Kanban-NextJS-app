import { Page, Locator, expect, LocatorScreenshotOptions } from '@playwright/test';

export class UserManagementPage{
    readonly page:Page;
    private readonly pageHeader:Locator;
    private readonly addUserButton:Locator;
    private readonly usersTable:Locator;
    private readonly userTableRows:Locator;

    constructor(page:Page){
        this.page =page;
        this.pageHeader= page.getByRole('heading', { name: 'User Management' });
        this.addUserButton=page.getByRole('button',{name:'Add User'});
        this.usersTable=page.getByRole('table')
        this.userTableRows= page.getByRole('table').getByRole('row')

    }//Constructor
    getUsersTable():Locator{
        return this.userstable
    }
    getUserTableRows(){
        return this.userTableRows
    }
    async waitForPageToBeReady(){
        this.page.waitForLoadState('networkidle');
        expect(this.pageHeader).toBeVisible();
        expect(this.usersTable).toBeVisible();
    }
    getRowByEmail(email:string):Locator{
        return this.page.getByRole('row', { name: email })
    }
    async openEditUserByEmail(email:string){
        this.getRowByEmail(email).getByRole('button', { name: 'Edit user' }).first().click()
    }
    async openResetPasswordByEmail(email:string){
        this.getRowByEmail(email).getByRole('button', { name: 'Reset password' }).first()
    }
    async openAddUser(){
        await this.addUserButton.click();
    }

}//Class