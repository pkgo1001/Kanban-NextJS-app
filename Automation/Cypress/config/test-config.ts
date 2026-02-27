/*
Este archivo nos facilita la configuración de los tests para diferentes entornos (development, qa, production).
*/

export type Environment = 'development' | 'qa' | 'production';

export interface TestUser{
    email: string;
    password: string;
    role: string;
    name: string;
}

export interface EnvironmentConfig {
    baseURL: string;
    users: {
      admin: TestUser;
      supervisor: TestUser;
      employee: TestUser;
      viewer: TestUser;
    };
  }

  const config: Record<Environment, EnvironmentConfig> = {
    development: {
      baseURL: 'http://localhost:3000',
      users: {
        admin: { email: 'admin.dev@company.com', password: 'admin123', role: 'ADMIN', name: 'Admin Dev' },
        supervisor: { email: 'robert.kim@company.com', password: 'Testing1234!', role: 'SUPERVISOR', name: 'Robert Kim' },
        employee: { email: 'sarah.chen@company.com', password: 'Testing1234!', role: 'EMPLOYEE', name: 'Sarah Chen' },
        viewer: { email: 'alex.rodriguez@company.com', password: 'Testing1234!', role: 'VIEWER', name: 'Alex Rodriguez' },
      },
    },
    qa: {
      baseURL: 'http://localhost:3001',
      users: {
        admin: { email: 'admin.qa@company.com', password: 'admin123', role: 'ADMIN', name: 'Admin QA' },
        supervisor: { email: 'alex.rodriguez@company.com', password: 'password123', role: 'SUPERVISOR', name: 'Alex Rodriguez' },
        employee: { email: 'sarah.chen@company.com', password: 'password123', role: 'EMPLOYEE', name: 'Sarah Chen' },
        viewer: { email: 'john.smith@company.com', password: 'password123', role: 'VIEWER', name: 'John Smith' },
      },
    },
    production: {
      baseURL: 'http://localhost:3002',
      users: {
        admin: { email: 'admin.prd@company.com', password: 'admin123', role: 'ADMIN', name: 'Admin Production' },
        supervisor: { email: 'alex.rodriguez@company.com', password: 'password123', role: 'SUPERVISOR', name: 'Alex Rodriguez' },
        employee: { email: 'sarah.chen@company.com', password: 'password123', role: 'EMPLOYEE', name: 'Sarah Chen' },
        viewer: { email: 'john.smith@company.com', password: 'password123', role: 'VIEWER', name: 'John Smith' },
      },
    },
  };
  function getCurrentEnvironment(): Environment {
    const env = (process.env.TEST_ENV || 'development').toLowerCase();
    if (env === 'qa' || env === 'staging') return 'qa';
    if (env === 'prod' || env === 'production') return 'production';
    return 'development';
  }
  
  export function getConfig(): EnvironmentConfig {
    return config[getCurrentEnvironment()];
  }
  
  export function getTestUser(role: 'admin' | 'supervisor' | 'employee' | 'viewer'): TestUser {
    return getConfig().users[role];
  }