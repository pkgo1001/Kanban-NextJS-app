import {Page, Locator, expect} from '@playwright/test'

export class EditUserPage{
    readonly page:Page;
    private readonly pageHeader:Locator;
    private readonly fullNameTextbox:Locator;
    private readonly emailTextbox:Locator;
    private readonly roleDropdown:Locator;
    private readonly positiontextbox:Locator;
    private readonly cancelButton:Locator;
    private readonly saveButton:Locator;
    
    constructor(page:Page){
        this.page=page;
        this.pageHeader = page.getByRole('heading', { name: 'Edit User' });
        this.fullNameTextbox = page.getByLabel('Full Name')
        this.emailTextbox = page.getByLabel('Email')
        this.roleDropdown = page.getByRole('combobox')
        this.positiontextbox =  page.getByLabel('Position')
        this.cancelButton = page.getByRole('button', {name :'Cancel'})
        this.saveButton = page.getByRole('button', { name: 'Save Changes' })
    }
    getCancelButton():Locator{
        return this.cancelButton
    }
    getSaveButton():Locator{
        return this.saveButton
    }

    async waitForPageToLoad(){
        await expect(this.pageHeader).toBeVisible();
        await this.page.waitForLoadState('networkidle');
    }
    async enterFullName(fullName:string){
        await this.fullNameTextbox.clear();
        await this.fullNameTextbox.fill(fullName);
    }
    async enterEmail(email:string){
        await this.emailTextbox.clear();
        await this.emailTextbox.fill(email);
    }
    async selectRole(role:string){
        await this.roleDropdown.click();
        await this.page.getByRole('option', { name: role }).click();
    }
    async enterPosition(position:string){
        this.positiontextbox.clear();
        this.positiontextbox.fill(position);
    }
    async getCountErrorMessages():Promise<number>{
        return await this.page.locator('input:invalid').count()
    }



}//