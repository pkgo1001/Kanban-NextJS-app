export class KanbanBoardPage{

   get pagetitle(){return cy.get('.container > .text-2xl')};
   get userName(){ return cy.get('.container > .text-2xl')};
   get themeChangeButton(){return cy.get('.gap-4 > .inline-flex')};
   get logOutButton(){return cy.get('.gap-4 > .h-8')};
   get userManagementButton(){return cy.get('div.gap-2 > .justify-center')};
   get totalTaskCountLabel(){return cy.get('.mb-6 > .gap-6 > :nth-child(1)')};
   get todoCountLabel(){return cy.get('.mb-6 > .gap-6 > :nth-child(3)')};
   get inProgressCountlabel(){return cy.get('.mb-6 > .gap-6 > :nth-child(5)')};
   get doneCountLabel(){return cy.get('.gap-6 > :nth-child(7)')};
   get todoColumn(){return cy.get('div.rounded-xl.border.text-card-foreground.shadow.flex.flex-col:nth-of-type(1)')}
   get inProgressColumn(){return cy.get('div.rounded-xl.border.text-card-foreground.shadow.flex.flex-col:nth-of-type(2)')}
   get doneColumn(){return cy.get('div.rounded-xl.border.text-card-foreground.shadow.flex.flex-col:nth-of-type(3)')}


   public waitForPageLoad():void{
    this.getColumnByName('TODO').should('be.visible');
    this.getColumnByName('In Progress').should('be.visible');
    this.getColumnByName('Done').should('be.visible');
   }
   public getColumnByName(name:string){
    return cy.get(`div.rounded-xl.border.text-card-foreground.shadow.flex.flex-col:has(div>div>div>div)`).contains(name)
   }
   public ExpandMinimizeColumn(column:string):void{
    this.getColumnByName(column).find('[tittle$="all"]]').click(); //Select all elements with an attribute value that ends with specific characters: [attribute$="value"], Examples:  img[src$=".jpg"]
   }

   public getAddTaskButtonByColumn(column:string):void{
    this.getColumnByName(column).find('[tittle="Add task"]]').click(); //Select all elements with an attribute value that ends with specific characters: [attribute$="value"], Examples:  img[src$=".jpg"]
   }


}