/**
 * Test Configuration for Multi-Environment Support
 * Supports: development, qa, production
 */

export type Environment = 'development' | 'qa' | 'production';

export interface TestUser {
  email: string;
  password: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE' | 'VIEWER';
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
      admin: {
        email: 'admin.dev@company.com',
        password: 'admin123',
        role: 'ADMIN',
        name: 'Admin Dev'
      },
      supervisor: {
        email: 'alex.rodriguez@company.com',
        password: 'password123',
        role: 'SUPERVISOR',
        name: 'Alex Rodriguez'
      },
      employee: {
        email: 'sarah.chen@company.com',
        password: 'password123',
        role: 'EMPLOYEE',
        name: 'Sarah Chen'
      },
      viewer: {
        email: 'john.smith@company.com',
        password: 'password123',
        role: 'VIEWER',
        name: 'John Smith'
      }
    }
  },
  qa: {
    baseURL: 'http://localhost:3001',
    users: {
      admin: {
        email: 'admin.qa@company.com',
        password: 'admin123',
        role: 'ADMIN',
        name: 'Admin QA'
      },
      supervisor: {
        email: 'alex.rodriguez@company.com',
        password: 'password123',
        role: 'SUPERVISOR',
        name: 'Alex Rodriguez'
      },
      employee: {
        email: 'sarah.chen@company.com',
        password: 'password123',
        role: 'EMPLOYEE',
        name: 'Sarah Chen'
      },
      viewer: {
        email: 'john.smith@company.com',
        password: 'password123',
        role: 'VIEWER',
        name: 'John Smith'
      }
    }
  },
  production: {
    baseURL: 'http://localhost:3002',
    users: {
      admin: {
        email: 'admin.prd@company.com',
        password: 'admin123',
        role: 'ADMIN',
        name: 'Admin Production'
      },
      supervisor: {
        email: 'alex.rodriguez@company.com',
        password: 'password123',
        role: 'SUPERVISOR',
        name: 'Alex Rodriguez'
      },
      employee: {
        email: 'sarah.chen@company.com',
        password: 'password123',
        role: 'EMPLOYEE',
        name: 'Sarah Chen'
      },
      viewer: {
        email: 'john.smith@company.com',
        password: 'password123',
        role: 'VIEWER',
        name: 'John Smith'
      }
    }
  }
};

/**
 * Get current environment from environment variable
 * Defaults to 'development' if not set
 */
export function getCurrentEnvironment(): Environment {
  const env = (process.env.TEST_ENV || 'development').toLowerCase();
  
  if (env === 'qa' || env === 'staging') {
    return 'qa';
  }
  
  if (env === 'prod' || env === 'production') {
    return 'production';
  }
  
  return 'development';
}

/**
 * Get configuration for current environment
 */
export function getConfig(): EnvironmentConfig {
  const env = getCurrentEnvironment();
  return config[env];
}

/**
 * Get base URL for current environment
 */
export function getBaseURL(): string {
  return getConfig().baseURL;
}

/**
 * Get test users for current environment
 */
export function getTestUsers() {
  return getConfig().users;
}

/**
 * Get specific test user by role
 */
export function getTestUser(role: 'admin' | 'supervisor' | 'employee' | 'viewer'): TestUser {
  return getConfig().users[role];
}

/**
 * Log current test configuration
 */
export function logTestConfig() {
  const env = getCurrentEnvironment();
  const cfg = getConfig();
  
  console.log('\n🧪 Test Configuration:');
  console.log(`   Environment: ${env.toUpperCase()}`);
  console.log(`   Base URL: ${cfg.baseURL}`);
  console.log(`   Admin User: ${cfg.users.admin.email}`);
  console.log('');
}

