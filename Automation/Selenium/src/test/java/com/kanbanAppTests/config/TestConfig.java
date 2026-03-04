package com.kanbanAppTests.config;

import java.util.Map;

public class TestConfig {

    public enum Environment { development, qa, production }

    private final String baseUrl;
    private final Map<String, TestUser> users;

    public TestConfig(String baseUrl, Map<String, TestUser> users) {
        this.baseUrl = baseUrl;
        this.users = users;
    }

    public String getBaseUrl() { return baseUrl; }
    public TestUser getAdmin() { return users.get("admin"); }
    public TestUser getSupervisor() { return users.get("supervisor"); }
    public TestUser getEmployee() { return users.get("employee"); }
    public TestUser getViewer() { return users.get("viewer"); }
    public TestUser getUser(String role) { return users.get(role); }

    public static class TestUser {
        public final String email;
        public final String password;
        public final String role;
        public final String name;

        public TestUser(String email, String password, String role, String name) {
            this.email = email;
            this.password = password;
            this.role = role;
            this.name = name;
        }
    }

    private static final Map<Environment, TestConfig> CONFIG = Map.of(
        Environment.development,
        new TestConfig("http://localhost:3000", Map.of(
            "admin", new TestUser("admin.dev@company.com", "admin123", "ADMIN", "Admin Dev"),
            "supervisor", new TestUser("robert.kim@company.com", "Testing1234!", "SUPERVISOR", "Robert Kim"),
            "employee", new TestUser("sarah.chen@company.com", "Testing1234!", "EMPLOYEE", "Sarah Chen"),
            "viewer", new TestUser("alex.rodriguez@company.com", "Testing1234!", "VIEWER", "Alex Rodriguez")
        )),
        Environment.qa,
        new TestConfig("http://localhost:3001", Map.of(
            "admin", new TestUser("admin.qa@company.com", "admin123", "ADMIN", "Admin QA"),
            "supervisor", new TestUser("alex.rodriguez@company.com", "password123", "SUPERVISOR", "Alex Rodriguez"),
            "employee", new TestUser("sarah.chen@company.com", "password123", "EMPLOYEE", "Sarah Chen"),
            "viewer", new TestUser("john.smith@company.com", "password123", "VIEWER", "John Smith")
        )),
        Environment.production,
        new TestConfig("http://localhost:3002", Map.of(
            "admin", new TestUser("admin.prd@company.com", "admin123", "ADMIN", "Admin Production"),
            "supervisor", new TestUser("alex.rodriguez@company.com", "password123", "SUPERVISOR", "Alex Rodriguez"),
            "employee", new TestUser("sarah.chen@company.com", "password123", "EMPLOYEE", "Sarah Chen"),
            "viewer", new TestUser("john.smith@company.com", "password123", "VIEWER", "John Smith")
        ))
    );

    public static TestConfig get() {
        String env = System.getProperty("test.env", "development").toLowerCase();//test.env is the environment variable that is set when running the command mvn test -Dtest.env=development. System.getProperty is a method that returns the value of the system property with the given name, if not set, it returns the default value, in this case, development. toLowerCase is a method that converts the string to lowercase.
        if (env.equals("qa") || env.equals("staging")) return CONFIG.get(Environment.qa);
        if (env.equals("prod") || env.equals("production")) return CONFIG.get(Environment.production);
        return CONFIG.get(Environment.development);//if the environment is not set, it returns the development environment.
    }
}