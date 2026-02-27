package com.kanbanAppTests.tests;

import com.kanbanAppTests.config.TestConfig;
import com.kanbanAppTests.pageobjects.LoginPage;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

class LoginPageTest {

    WebDriver driver;
    TestConfig config;
    LoginPage loginPage;

    @BeforeEach
    void setUp() {
        config = TestConfig.get();
        ChromeOptions options = new ChromeOptions();
        // Headless by default; use -Dheadless=false for headed (browser visible)
        if (!"false".equalsIgnoreCase(System.getProperty("headless", "true"))) {
            options.addArguments("--headless=new");
        }
        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
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
    void shouldLoginSuccessfullyWithAdmin() {
        loginPage.visit(config.getBaseUrl());
        loginPage.login(config.getAdmin().email, config.getAdmin().password);
        assertTrue(loginPage.isOnHomePage(config.getBaseUrl()));
    }
}