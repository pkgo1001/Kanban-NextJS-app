

public class KanbanBoardPage {

 private final WebDriver driver;
 private final WebDriverWait wait;
private static final By PAGE_TITLE = By.xpath("//*[contains(text(),'Kanban Dashboard')]");






 public KanbanBoardPage(WebDriver driver) {
    this.driver = driver;
    this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
 }

}