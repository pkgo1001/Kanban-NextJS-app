package com.kanbanAppTests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class LoginPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private static final By PAGE_TITLE = By.xpath("//*[contains(text(),'Welcome Back')]"); //By es el tipo de dato definido por selenium para almacenar las ubicaciones de los elementos en la pagina.
    private static final By EMAIL_INPUT = By.cssSelector("input[placeholder='your@email.com']");
    private static final By PASSWORD_INPUT = By.cssSelector("input[placeholder='Enter your password']");
    private static final By SIGN_IN_BUTTON = By.xpath("//button[contains(.,'Sign In')]");
    private static final By ERROR_MESSAGE = By.cssSelector("div.bg-destructive\\/10 p.text-destructive");
    private static final By REGISTER_LINK = By.xpath("//a[contains(.,\"Don't have an account\")]");
    private static final By FORGOT_PASSWORD_LINK = By.xpath("//a[contains(.,'Forgot your password')]");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void visit(String baseUrl) {
        driver.get(baseUrl + "/login");
        waitForPageLoad();
    }

    public void waitForPageLoad() {
        wait.until(ExpectedConditions.visibilityOfElementLocated(PAGE_TITLE));
        wait.until(ExpectedConditions.visibilityOfElementLocated(EMAIL_INPUT));
        wait.until(ExpectedConditions.visibilityOfElementLocated(PASSWORD_INPUT));
    }

    public void fillEmail(String email) {
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(EMAIL_INPUT));
        el.clear();
        el.sendKeys(email);
    }

    public void fillPassword(String password) {
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(PASSWORD_INPUT));
        el.clear();
        el.sendKeys(password);
    }

    public void clickSignIn() {
        wait.until(ExpectedConditions.elementToBeClickable(SIGN_IN_BUTTON)).click();
    }

    public void login(String email, String password) {
        fillEmail(email);
        fillPassword(password);
        clickSignIn();
    }

    public boolean isErrorMessageVisible() {
        return driver.findElements(ERROR_MESSAGE).stream().anyMatch(WebElement::isDisplayed);
    }

    public String getErrorMessageText() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(ERROR_MESSAGE)).getText();
    }

    public boolean isOnHomePage(String baseUrl) {
        String url = driver.getCurrentUrl();
        return url.startsWith(baseUrl) && !url.contains("/login");
    }

    public WebElement getPageTitle() { return driver.findElement(PAGE_TITLE); }
    public WebElement getRegisterLink() { return driver.findElement(REGISTER_LINK); }
    public WebElement getForgotPasswordLink() { return driver.findElement(FORGOT_PASSWORD_LINK); }
}
