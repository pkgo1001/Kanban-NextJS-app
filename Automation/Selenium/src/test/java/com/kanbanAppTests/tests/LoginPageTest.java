package com.kanbanAppTests.tests;

import com.kanbanAppTests.config.TestConfig;
import com.kanbanAppTests.pageobjects.LoginPage;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

class LoginPageTest {

    WebDriver driver;
    WebDriverWait wait;
    TestConfig config;
    LoginPage loginPage;

    @BeforeEach
    void setUp() {
        config = TestConfig.get();
        ChromeOptions options = new ChromeOptions(); //Opciones como headless, browser size y browser type.
        // Headless by default; use -Dheadless=false for headed (browser visible)
        if (!"false".equalsIgnoreCase(System.getProperty("headless", "true"))) { //Esto compara el string "false" con el valor de la propiedad headless, si es false, se agrega el argumento --headless=new, si es true, se agrega el argumento --headless=new. Es un forma rara de evaluar que el headless sea false, pero es el estandar de JAVA
            options.addArguments("--headless=new");
        }
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(5)); //explicit wait is the time to wait for the element to be visible, clickable, etc., it checks the element every 5 seconds for the condition to be true during the time of the wait, which is 5 seconds, so if the element is not visible, it will wait for 5 seconds and check again, and so on until the condition is true or the wait time is reached.
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));//implicit wait is the time to wait for the element to be visible, clickable, etc.
        driver.manage().window().maximize();
        loginPage = new LoginPage(driver);
    }

    @AfterEach
    void tearDown() {
        if (driver != null) driver.quit();
    }

    @Test
    void shouldDisplayLoginPageWithAllElements() {
        loginPage.visit(config.getBaseUrl());
        assertTrue(loginPage.getPageTitle().isDisplayed());
        assertTrue(loginPage.getRegisterLink().isDisplayed());
        assertTrue(loginPage.getForgotPasswordLink().isDisplayed());
    }

    @Test
    void shouldAllowTypingInEmailAndPassword() {
        loginPage.visit(config.getBaseUrl());
        loginPage.fillEmail("test@example.com");
        loginPage.fillPassword("TestPassword123!");
        // Opcional: leer valor de los inputs si expones getters en LoginPage
    }

    @Test
    void shouldShowErrorForInvalidCredentials() {
        loginPage.visit(config.getBaseUrl());
        loginPage.login("invalid@email.com", "wrongpassword");
        assertTrue(loginPage.isErrorMessageVisible());
        assertTrue(loginPage.getErrorMessageText().contains("Invalid email or password"));
    }

    @Test
    void shouldLoginSuccessfullyWithAdmin(){
        loginPage.visit(config.getBaseUrl());
        loginPage.login(config.getAdmin().email, config.getAdmin().password);
        wait.until(d -> !d.getCurrentUrl().contains("/login"));
        assertTrue(loginPage.isOnHomePage(config.getBaseUrl()));
    }
}