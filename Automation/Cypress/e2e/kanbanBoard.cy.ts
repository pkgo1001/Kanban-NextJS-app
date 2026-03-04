import {KanbanBoardPage} from '../page-objects/KanabanBoardPage';

describe('Kanban Board', () => {
  const kanbanBoardPage = new KanbanBoardPage();

  beforeEach(() => {
    cy.loginAs('admin');
    kanbanBoardPage.waitForPageLoad();

  });

  it('should display kanban board with all elements', () => {
    kanbanBoardPage.pagetitle.should('be.visible');

  });

  
});