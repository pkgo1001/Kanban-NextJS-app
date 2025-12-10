/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                         API TEST FIXTURES                                 ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Fixtures personalizados de Playwright para pruebas de API                 ║
 * ║                                                                           ║
 * ║ ¿Qué son los Fixtures?                                                    ║
 * ║ ┌─────────────────────────────────────────────────────────────────────┐   ║
 * ║ │ Los fixtures son "dependencias" que se inyectan automáticamente     │   ║
 * ║ │ en los tests. Playwright los crea, los pasa al test, y luego los    │   ║
 * ║ │ limpia automáticamente.                                             │   ║
 * ║ │                                                                     │   ║
 * ║ │ test('example', async ({ request }) => {                            │   ║
 * ║ │                          ↑                                          │   ║
 * ║ │                    Fixture built-in de Playwright                   │   ║
 * ║ │ })                                                                  │   ║
 * ║ │                                                                     │   ║
 * ║ │ test('example', async ({ authService, adminToken }) => {            │   ║
 * ║ │                          ↑              ↑                           │   ║
 * ║ │                    Fixtures personalizados que creamos aquí         │   ║
 * ║ │ })                                                                  │   ║
 * ║ └─────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║ Flujo de los Fixtures:                                                    ║
 * ║ ┌─────────────────────────────────────────────────────────────────────┐   ║
 * ║ │                                                                     │   ║
 * ║ │   1. Playwright inicia el test                                      │   ║
 * ║ │          │                                                          │   ║
 * ║ │          ▼                                                          │   ║
 * ║ │   2. Crea fixtures solicitados                                      │   ║
 * ║ │          │                                                          │   ║
 * ║ │          ├──► authService = new AuthService(request)                │   ║
 * ║ │          │                                                          │   ║
 * ║ │          ├──► userService = new UserService(request)                │   ║
 * ║ │          │                                                          │   ║
 * ║ │          ├──► adminToken = await login(admin)                       │   ║
 * ║ │          │                                                          │   ║
 * ║ │          ▼                                                          │   ║
 * ║ │   3. Ejecuta el test con los fixtures                               │   ║
 * ║ │          │                                                          │   ║
 * ║ │          ▼                                                          │   ║
 * ║ │   4. Limpieza automática (si definida)                              │   ║
 * ║ │                                                                     │   ║
 * ║ └─────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║ Beneficios:                                                               ║
 * ║ • Elimina código repetitivo de setup                                      ║
 * ║ • Garantiza consistencia entre tests                                      ║
 * ║ • Facilita el testing de roles/permisos                                   ║
 * ║ • Maneja automáticamente la autenticación                                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { test as base } from '@playwright/test';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { TaskService } from '../services/TaskService';
import { getTestUser } from '../config/test-config';

/**
 * Definición de tipos para los fixtures personalizados
 * Cada propiedad define un fixture disponible en los tests
 */
type ApiFixtures = {
  /** Servicio de autenticación pre-configurado */
  authService: AuthService;
  
  /** Servicio de usuarios pre-configurado */
  userService: UserService;
  
  /** Servicio de tareas pre-configurado */
  taskService: TaskService;
  
  /** Token de autenticación para usuario Admin */
  adminToken: string;
  
  /** Token de autenticación para usuario Supervisor */
  supervisorToken: string;
  
  /** Token de autenticación para usuario Employee */
  employeeToken: string;
  
  /** Token de autenticación para usuario Viewer */
  viewerToken: string;
};

/**
 * Extensión del test de Playwright con fixtures personalizados para API
 * 
 * @example
 * // Importar el test extendido en lugar del de Playwright
 * import { test, expect } from '../fixtures/api-fixtures';
 * 
 * test('my api test', async ({ authService, adminToken }) => {
 *   // authService y adminToken están disponibles automáticamente
 *   const response = await authService.login('user@test.com', 'pass');
 * });
 */
export const test = base.extend<ApiFixtures>({
  /**
   * Fixture: AuthService
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ Proporciona una instancia de AuthService lista para usar              │
   * │                                                                       │
   * │ Dependencias: request (fixture de Playwright)                         │
   * │ Lifecycle: Creado por test, destruido después del test                │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @example
   * test('login test', async ({ authService }) => {
   *   const response = await authService.login('user@test.com', 'pass');
   * });
   */
  authService: async ({ request }, use) => {
    const service = new AuthService(request);
    await use(service);
    // No cleanup necesario - el request se limpia automáticamente
  },

  /**
   * Fixture: UserService
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ Proporciona una instancia de UserService lista para usar              │
   * │                                                                       │
   * │ Dependencias: request                                                 │
   * │ Lifecycle: Creado por test                                            │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @example
   * test('list users', async ({ userService, adminToken }) => {
   *   const response = await userService.getAll(adminToken);
   * });
   */
  userService: async ({ request }, use) => {
    const service = new UserService(request);
    await use(service);
  },

  /**
   * Fixture: TaskService
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ Proporciona una instancia de TaskService lista para usar              │
   * │                                                                       │
   * │ Dependencias: request                                                 │
   * │ Lifecycle: Creado por test                                            │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @example
   * test('create task', async ({ taskService, adminToken }) => {
   *   const response = await taskService.create({ title: 'Test' }, adminToken);
   * });
   */
  taskService: async ({ request }, use) => {
    const service = new TaskService(request);
    await use(service);
  },

  /**
   * Fixture: adminToken
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ Token de autenticación para usuario con rol ADMIN                     │
   * │                                                                       │
   * │ Flujo:                                                                │
   * │ 1. Obtiene credenciales del admin desde test-config                   │
   * │ 2. Realiza login vía AuthService                                      │
   * │ 3. Extrae y retorna el token                                          │
   * │                                                                       │
   * │ Dependencias: authService (fixture)                                   │
   * │ Permisos del Admin:                                                   │
   * │   ✓ Gestionar usuarios                                                │
   * │   ✓ Crear/Editar/Eliminar cualquier tarea                             │
   * │   ✓ Acceso completo al sistema                                        │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @example
   * test('admin can delete user', async ({ userService, adminToken }) => {
   *   const response = await userService.delete(userId, adminToken);
   *   expect(response.status).toBe(200);
   * });
   */
  adminToken: async ({ authService }, use) => {
    const admin = getTestUser('admin');
    const response = await authService.login(admin.email, admin.password);
    
    if (response.status !== 200) {
      throw new Error(`Failed to get admin token: ${JSON.stringify(response.body)}`);
    }
    
    await use(response.body.token);
  },

  /**
   * Fixture: supervisorToken
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ Token de autenticación para usuario con rol SUPERVISOR                │
   * │                                                                       │
   * │ Permisos del Supervisor:                                              │
   * │   ✓ Crear tareas                                                      │
   * │   ✓ Editar cualquier tarea                                            │
   * │   ✓ Eliminar tareas de su equipo                                      │
   * │   ✓ Mover tareas                                                      │
   * │   ✗ Gestionar usuarios                                                │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @example
   * test('supervisor can create task', async ({ taskService, supervisorToken }) => {
   *   const response = await taskService.create(taskData, supervisorToken);
   *   expect(response.status).toBe(200);
   * });
   */
  supervisorToken: async ({ authService }, use) => {
    const supervisor = getTestUser('supervisor');
    const response = await authService.login(supervisor.email, supervisor.password);
    
    if (response.status !== 200) {
      throw new Error(`Failed to get supervisor token: ${JSON.stringify(response.body)}`);
    }
    
    await use(response.body.token);
  },

  /**
   * Fixture: employeeToken
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ Token de autenticación para usuario con rol EMPLOYEE                  │
   * │                                                                       │
   * │ Permisos del Employee:                                                │
   * │   ✓ Ver tareas                                                        │
   * │   ✓ Mover sus propias tareas asignadas                                │
   * │   ✗ Crear tareas                                                      │
   * │   ✗ Eliminar tareas                                                   │
   * │   ✗ Editar tareas de otros                                            │
   * │   ✗ Gestionar usuarios                                                │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @example
   * test('employee cannot create task', async ({ taskService, employeeToken }) => {
   *   const response = await taskService.create(taskData, employeeToken);
   *   expect(response.status).toBe(403); // Forbidden
   * });
   */
  employeeToken: async ({ authService }, use) => {
    const employee = getTestUser('employee');
    const response = await authService.login(employee.email, employee.password);
    
    if (response.status !== 200) {
      throw new Error(`Failed to get employee token: ${JSON.stringify(response.body)}`);
    }
    
    await use(response.body.token);
  },

  /**
   * Fixture: viewerToken
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ Token de autenticación para usuario con rol VIEWER                    │
   * │                                                                       │
   * │ Permisos del Viewer:                                                  │
   * │   ✓ Ver tareas (GET)                                                  │
   * │   ✗ Crear tareas                                                      │
   * │   ✗ Editar tareas                                                     │
   * │   ✗ Eliminar tareas                                                   │
   * │   ✗ Mover tareas                                                      │
   * │   ✗ Gestionar usuarios                                                │
   * │                                                                       │
   * │ Útil para tests de permisos negativos                                 │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @example
   * test('viewer cannot create task', async ({ taskService, viewerToken }) => {
   *   const response = await taskService.create(taskData, viewerToken);
   *   expect(response.status).toBe(403); // Forbidden
   * });
   */
  viewerToken: async ({ authService }, use) => {
    const viewer = getTestUser('viewer');
    const response = await authService.login(viewer.email, viewer.password);
    
    if (response.status !== 200) {
      throw new Error(`Failed to get viewer token: ${JSON.stringify(response.body)}`);
    }
    
    await use(response.body.token);
  },
});

/**
 * Re-exportar expect de Playwright para uso conveniente
 * Permite importar test y expect desde el mismo archivo
 * 
 * @example
 * import { test, expect } from '../fixtures/api-fixtures';
 */
export { expect } from '@playwright/test';

/**
 * Re-exportar los servicios y helpers para acceso conveniente
 */
export { AuthService, UserService, TaskService };

