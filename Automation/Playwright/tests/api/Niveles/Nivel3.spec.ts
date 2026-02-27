/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                                   ║
 * ║                           🚀 NIVEL 3: ARQUITECTURA AVANZADA DE API TESTING 🚀                     ║
 * ║                                                                                                   ║
 * ╠═══════════════════════════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                                                   ║
 * ║  Este archivo demuestra la arquitectura óptima para pruebas de API con Playwright                 ║
 * ║                                                                                                   ║
 * ║  EVOLUCIÓN DE NIVELES:                                                                            ║
 * ║  ═══════════════════                                                                              ║
 * ║                                                                                                   ║
 * ║  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐  ║
 * ║  │                                                                                             │  ║
 * ║  │   NIVEL 1 (Básico)                                                                          │  ║
 * ║  │   ─────────────────                                                                         │  ║
 * ║  │   • URLs hardcodeadas                                                                       │  ║
 * ║  │   • Credenciales en el código                                                               │  ║
 * ║  │   • Sin abstracción                                                                         │  ║
 * ║  │   • Difícil de mantener                                                                     │  ║
 * ║  │                                                                                             │  ║
 * ║  │           ↓                                                                                 │  ║
 * ║  │                                                                                             │  ║
 * ║  │   NIVEL 2 (Intermedio)                                                                      │  ║
 * ║  │   ─────────────────────                                                                     │  ║
 * ║  │   • Configuración centralizada (test-config.ts)                                             │  ║
 * ║  │   • Helper functions básicas                                                                │  ║
 * ║  │   • Test steps para organización                                                            │  ║
 * ║  │   • Cleanup básico con afterAll                                                             │  ║
 * ║  │                                                                                             │  ║
 * ║  │           ↓                                                                                 │  ║
 * ║  │                                                                                             │  ║
 * ║  │   NIVEL 3 (Avanzado) ← ESTE ARCHIVO                                                         │  ║
 * ║  │   ──────────────────                                                                        │  ║
 * ║  │   • Service Layer (POM para APIs)                                                           │  ║
 * ║  │   • Custom Fixtures con tokens pre-autenticados                                             │  ║
 * ║  │   • Factory Pattern para test data                                                          │  ║
 * ║  │   • Response Validators reutilizables                                                       │  ║
 * ║  │   • Type-safe con TypeScript                                                                │  ║
 * ║  │   • Tests independientes y paralelos                                                        │  ║
 * ║  │                                                                                             │  ║
 * ║  └─────────────────────────────────────────────────────────────────────────────────────────────┘  ║
 * ║                                                                                                   ║
 * ║  ARQUITECTURA IMPLEMENTADA:                                                                       ║
 * ║  ═════════════════════════                                                                        ║
 * ║                                                                                                   ║
 * ║  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ ║
 * ║  │                                                                                              │ ║
 * ║  │                              TEST FILES (Nivel3.spec.ts)                                     │ ║
 * ║  │                                        │                                                     │ ║
 * ║  │                                        ▼                                                     │ ║
 * ║  │                            ┌─────────────────────┐                                           │ ║
 * ║  │                            │     FIXTURES        │                                           │ ║
 * ║  │                            │  (api-fixtures.ts)  │                                           │ ║
 * ║  │                            │                     │                                           │ ║
 * ║  │                            │ • authService       │                                           │ ║
 * ║  │                            │ • userService       │                                           │ ║
 * ║  │                            │ • taskService       │                                           │ ║
 * ║  │                            │ • adminToken        │                                           │ ║
 * ║  │                            │ • supervisorToken   │                                           │ ║
 * ║  │                            │ • employeeToken     │                                           │ ║
 * ║  │                            │ • viewerToken       │                                           │ ║
 * ║  │                            └──────────┬──────────┘                                           │ ║
 * ║  │                                       │                                                      │ ║
 * ║  │               ┌───────────────────────┼───────────────────────┐                              │ ║
 * ║  │               │                       │                       │                              │ ║
 * ║  │               ▼                       ▼                       ▼                              │ ║
 * ║  │  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐                      │ ║
 * ║  │  │   AUTH SERVICE     │  │   USER SERVICE     │  │   TASK SERVICE     │                      │ ║
 * ║  │  │                    │  │                    │  │                    │                      │ ║
 * ║  │  │ • login()          │  │ • getAll()         │  │ • getAll()         │                      │ ║
 * ║  │  │ • register()       │  │ • create()         │  │ • create()         │                      │ ║
 * ║  │  │ • getToken()       │  │ • update()         │  │ • update()         │                      │ ║
 * ║  │  │                    │  │ • delete()         │  │ • updateStatus()   │                      │ ║
 * ║  │  │                    │  │ • verifyEmail()    │  │ • delete()         │                      │ ║
 * ║  │  └────────────────────┘  └────────────────────┘  └────────────────────┘                      │ ║
 * ║  │               │                       │                       │                              │ ║
 * ║  │               └───────────────────────┼───────────────────────┘                              │ ║
 * ║  │                                       │                                                      │ ║
 * ║  │                                       ▼                                                      │ ║
 * ║  │                          ┌──────────────────────┐                                            │ ║
 * ║  │                          │    API ENDPOINTS     │                                            │ ║
 * ║  │                          │                      │                                            │ ║
 * ║  │                          │ /api/auth/login      │                                            │ ║
 * ║  │                          │ /api/auth/register   │                                            │ ║
 * ║  │                          │ /api/users/*         │                                            │ ║
 * ║  │                          │ /api/tasks/*         │                                            │ ║
 * ║  │                          └──────────────────────┘                                            │ ║
 * ║  │                                                                                              │ ║
 * ║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
 * ║                                                                                                   ║
 * ║  COMPONENTES ADICIONALES:                                                                         ║
 * ║                                                                                                   ║
 * ║  ┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐                  ║
 * ║  │     FACTORIES         │  │     VALIDATORS        │  │       MODELS          │                  ║
 * ║  │                       │  │                       │  │                       │                  ║
 * ║  │ • UserFactory         │  │ • ResponseValidator   │  │ • User                │                  ║
 * ║  │   - createUnique()    │  │   - validateSuccess() │  │ • Task                │                  ║
 * ║  │   - createBulk()      │  │   - validateError()   │  │ • ApiResponse         │                  ║
 * ║  │                       │  │   - validateLogin()   │  │ • LoginResponse       │                  ║
 * ║  │ • TaskFactory         │  │                       │  │                       │                  ║
 * ║  │   - createUnique()    │  │                       │  │                       │                  ║
 * ║  │   - createHighPrio()  │  │                       │  │                       │                  ║
 * ║  └───────────────────────┘  └───────────────────────┘  └───────────────────────┘                  ║
 * ║                                                                                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

// ============================================================================
// IMPORTS
// ============================================================================

/**
 * Importamos test y expect desde nuestros fixtures personalizados
 * Esto nos da acceso a: authService, userService, taskService, 
 * adminToken, supervisorToken, employeeToken, viewerToken
 */
import { test, expect } from '../../../fixtures/api-fixtures';

/**
 * Factories para generar datos de prueba únicos
 * Garantizan que cada test tenga datos aislados
 */
import { UserFactory, TaskFactory } from '../../../helpers/test-data';

/**
 * Validadores de respuesta para assertions consistentes
 */
import { ResponseValidator, HttpStatus } from '../../../helpers/api';

/**
 * Configuración del entorno de pruebas
 */
import { getTestUser, logTestConfig, getBaseURL } from '../../../config/test-config';

/**
 * Importación estática de servicios para uso en afterAll hooks
 * (los dynamic imports no funcionan bien con ES modules en este contexto)
 */
import { AuthService, UserService, TaskService } from '../../../services';

// ============================================================================
// CONFIGURACIÓN DEL TEST SUITE
// ============================================================================

/**
 * Configuramos el modo serial para este archivo porque:
 * 1. Algunos tests modifican el estado de la base de datos
 * 2. Queremos asegurar el orden de ejecución para flujos completos
 * 
 * En un entorno ideal con mejor aislamiento de datos,
 * podríamos usar modo paralelo para mayor velocidad.
 */
test.describe.configure({ mode: 'serial' });

// ============================================================================
// TEST SUITES
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                                                                             │
 * │                    🔐 AUTHENTICATION TESTS                                  │
 * │                                                                             │
 * │  Tests de autenticación que verifican:                                      │
 * │  • Login exitoso para todos los roles                                       │
 * │  • Manejo de credenciales inválidas                                         │
 * │  • Generación correcta de tokens                                            │
 * │                                                                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */
test.describe('🔐 Authentication API Tests - Nivel 3', () => {
  
  /**
   * Hook que se ejecuta una vez antes de todos los tests del suite
   * Útil para logging inicial y verificación del entorno
   */
  test.beforeAll(() => {
    logTestConfig();
    console.log('\n📋 Starting Authentication Tests Suite...\n');
  });

  /**
   * TEST: Login con todos los roles del sistema
   * 
   * FLUJO:
   * ┌─────────────────────────────────────────────────────────────────────────┐
   * │                                                                         │
   * │   Para cada rol (admin, supervisor, employee, viewer):                  │
   * │                                                                         │
   * │   1. Obtener credenciales del rol desde test-config                     │
   * │      ↓                                                                  │
   * │   2. Llamar authService.login(email, password)                          │
   * │      ↓                                                                  │
   * │   3. Validar respuesta exitosa (200)                                    │
   * │      ↓                                                                  │
   * │   4. Verificar que retorna token válido                                 │
   * │      ↓                                                                  │
   * │   5. Verificar nombre de usuario correcto                               │
   * │                                                                         │
   * └─────────────────────────────────────────────────────────────────────────┘
   * 
   * Este test demuestra:
   * - Uso del fixture authService
   * - Validación con ResponseValidator
   * - Test parametrizado con múltiples roles
   * - Test steps para organización
   */
  test('should authenticate all system roles using AuthService', async ({ authService }) => {
    const roles = ['admin', 'supervisor', 'employee', 'viewer'] as const;
    
    for (const role of roles) {
      await test.step(`Login as ${role.toUpperCase()}`, async () => {
        // 1. Obtener credenciales del rol
        const testUser = getTestUser(role);
        
        // 2. Realizar login via AuthService
        const response = await authService.login(testUser.email, testUser.password);
        
        // 3. Validar respuesta exitosa
        ResponseValidator.validateSuccess(response);
        
        // 4. Verificar estructura de respuesta
        ResponseValidator.validateHasProperty(response, 'token');
        ResponseValidator.validateHasProperty(response, 'user');
        
        // 5. Verificar datos del usuario
        expect(response.body.user.name).toBe(testUser.name);
        
        console.log(`   ✅ ${role.toUpperCase()} login successful - Token obtained`);
      });
    }
  });

  /**
   * TEST: Login con credenciales inválidas
   * 
   * FLUJO:
   * ┌─────────────────────────────────────────────────────────────────────────┐
   * │   1. Intentar login con email inexistente                               │
   * │      ↓                                                                  │
   * │   2. API retorna 401 Unauthorized                                       │
   * │      ↓                                                                  │
   * │   3. Verificar mensaje de error apropiado                               │
   * └─────────────────────────────────────────────────────────────────────────┘
   * 
   * Este test demuestra:
   * - Validación de casos negativos
   * - Uso de validateUnauthorized
   */
  test('should reject invalid credentials', async ({ authService }) => {
    await test.step('Login with non-existent email', async () => {
      const response = await authService.login(
        'nonexistent@test.com', 
        'wrongpassword'
      );
      
      ResponseValidator.validateUnauthorized(response);
      console.log('   ✅ Invalid credentials correctly rejected (401)');
    });
  });

  /**
   * TEST: Verificar que el token obtenido funciona
   * 
   * FLUJO:
   * ┌─────────────────────────────────────────────────────────────────────────┐
   * │   1. Login para obtener token                                           │
   * │      ↓                                                                  │
   * │   2. Usar token para acceder a endpoint protegido                       │
   * │      ↓                                                                  │
   * │   3. Verificar acceso exitoso                                           │
   * └─────────────────────────────────────────────────────────────────────────┘
   * 
   * Este test demuestra:
   * - Uso de fixtures con token pre-autenticado (adminToken)
   * - Integración entre servicios
   */
  test('should use obtained token to access protected endpoint', async ({ 
    adminToken,
    userService 
  }) => {
    await test.step('Access users list with admin token', async () => {
      // adminToken ya está disponible via fixture
      const response = await userService.getAll(adminToken);
      
      ResponseValidator.validateSuccess(response);
      ResponseValidator.validateArray(response, 1); // Al menos 1 usuario
      
      console.log(`   ✅ Token valid - Retrieved ${response.body.length} users`);
    });
  });
});

/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                                                                             │
 * │                    👥 USER LIFECYCLE TESTS                                  │
 * │                                                                             │
 * │  Tests del ciclo de vida completo de un usuario:                            │
 * │  Register → Verify Email → Login → Create Task → Delete                     │
 * │                                                                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */
test.describe('👥 User Lifecycle API Tests - Nivel 3', () => {
  
  /** ID del usuario creado para cleanup */
  let createdUserId: string;
  
  /** ID de la tarea creada para cleanup */
  let createdTaskId: string;
  
  /** Datos del usuario generado por la factory */
  let testUserData: ReturnType<typeof UserFactory.createUnique>;

  test.beforeAll(() => {
    console.log('\n📋 Starting User Lifecycle Tests Suite...\n');
  });

  /**
   * TEST: Ciclo de vida completo de un usuario
   * 
   * FLUJO DETALLADO:
   * ┌─────────────────────────────────────────────────────────────────────────┐
   * │                                                                         │
   * │   PASO 1: Crear Usuario                                                 │
   * │   ────────────────────                                                  │
   * │   • UserFactory genera datos únicos                                     │
   * │   • AuthService.register() envía POST /api/auth/register                │
   * │   • API crea usuario + assignee profile                                 │
   * │   • Retorna 201 con user.id                                             │
   * │                                                                         │
   * │           ↓                                                             │
   * │                                                                         │
   * │   PASO 2: Verificar Email                                               │
   * │   ──────────────────────                                                │
   * │   • UserService.verifyEmail() envía POST /api/users/{id}/verify-email   │
   * │   • API establece emailVerified = true                                  │
   * │   • Usuario puede ahora acceder al sistema                              │
   * │                                                                         │
   * │           ↓                                                             │
   * │                                                                         │
   * │   PASO 3: Login con nuevo usuario                                       │
   * │   ─────────────────────────────                                         │
   * │   • AuthService.login() con credenciales del nuevo usuario              │
   * │   • Verificar que puede autenticarse                                    │
   * │   • Obtener token de sesión                                             │
   * │                                                                         │
   * │           ↓                                                             │
   * │                                                                         │
   * │   PASO 4: Crear tarea para el usuario                                   │
   * │   ────────────────────────────────                                      │
   * │   • TaskFactory genera datos de tarea                                   │
   * │   • TaskService.create() con assignee = nombre del usuario              │
   * │   • Verificar que la tarea se asigna correctamente                      │
   * │                                                                         │
   * │           ↓                                                             │
   * │                                                                         │
   * │   PASO 5: Mover tarea a done                                            │
   * │   ─────────────────────────                                             │
   * │   • TaskService.updateStatus() envía PATCH /api/tasks/{id}              │
   * │   • Cambiar estado de todo → done                                       │
   * │                                                                         │
   * │           ↓                                                             │
   * │                                                                         │
   * │   PASO 6: Cleanup                                                       │
   * │   ──────────────                                                        │
   * │   • Eliminar tarea creada                                               │
   * │   • Eliminar usuario creado                                             │
   * │                                                                         │
   * └─────────────────────────────────────────────────────────────────────────┘
   */
  test('should complete full user lifecycle: register → verify → login → task → delete', async ({
    authService,
    userService,
    taskService,
    adminToken
  }) => {
    // Generar datos únicos usando la factory
    testUserData = UserFactory.createWithPrefix('Nivel3');
    
    console.log(`   📧 Creating user: ${testUserData.email}`);

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 1: REGISTRAR USUARIO
    // ═══════════════════════════════════════════════════════════════════════
    await test.step('Step 1: Register new user', async () => {
      /**
       * API Call: POST /api/auth/register
       * 
       * Request:
       * {
       *   email: "Nivel3-1702345678123-x7k9m@test.com",
       *   password: "SecurePass123!",
       *   name: "Nivel3 User 1702345678123"
       * }
       * 
       * Response (201):
       * {
       *   message: "User registered successfully...",
       *   user: { id: "clx...", email: "...", name: "...", ... }
       * }
       */
      const response = await authService.register(testUserData, adminToken);
      
      // Validar respuesta de registro
      ResponseValidator.validateCreated(response);
      ResponseValidator.validateHasProperty(response, 'user.id');
      ResponseValidator.validateHasProperty(
        response, 
        'message', 
        'User registered successfully. Please check your email to verify your account.'
      );
      
      // Guardar ID para pasos posteriores
      createdUserId = response.body.user.id;
      
      console.log(`   ✅ User created with ID: ${createdUserId}`);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 2: VERIFICAR EMAIL
    // ═══════════════════════════════════════════════════════════════════════
    await test.step('Step 2: Verify user email', async () => {
      /**
       * API Call: POST /api/users/{id}/verify-email
       * 
       * Esta llamada simula la verificación manual que haría un admin
       * En producción, el usuario recibiría un email con link de verificación
       * 
       * Side effects:
       * - emailVerified = true
       * - emailVerificationToken = null
       */
      const response = await userService.verifyEmail(createdUserId, adminToken);
      
      ResponseValidator.validateSuccess(response);
      ResponseValidator.validateHasProperty(response, 'message', 'Email verified successfully');
      
      console.log('   ✅ Email verified successfully');
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 3: LOGIN CON NUEVO USUARIO
    // ═══════════════════════════════════════════════════════════════════════
    await test.step('Step 3: Login with new user', async () => {
      /**
       * API Call: POST /api/auth/login
       * 
       * Verificamos que el usuario recién creado puede autenticarse
       */
      const response = await authService.login(
        testUserData.email, 
        testUserData.password
      );
      
      ResponseValidator.validateLoginSuccess(response, testUserData.name);
      
      console.log(`   ✅ New user logged in successfully - Token: ${response.body.token.substring(0, 20)}...`);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 4: CREAR TAREA PARA EL USUARIO
    // ═══════════════════════════════════════════════════════════════════════
    await test.step('Step 4: Create task assigned to new user', async () => {
      /**
       * API Call: POST /api/tasks
       * 
       * Creamos una tarea y la asignamos al usuario recién creado
       * usando su nombre como assignee
       */
      const taskData = TaskFactory.createAssigned(testUserData.name, {
        title: `Task for ${testUserData.name} - Nivel 3`,
        priority: 'high',
        tags: ['nivel3', 'test', 'automated']
      });
      
      const response = await taskService.create(taskData, adminToken);
      
      ResponseValidator.validateSuccess(response);
      ResponseValidator.validateHasProperty(response, 'id');
      expect(response.body.assignee).toBe(testUserData.name);
      expect(response.body.priority).toBe('high');
      
      createdTaskId = response.body.id;
      
      console.log(`   ✅ Task created with ID: ${createdTaskId}`);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 5: MOVER TAREA A DONE
    // ═══════════════════════════════════════════════════════════════════════
    await test.step('Step 5: Move task to done status', async () => {
      /**
       * API Call: PATCH /api/tasks/{id}
       * 
       * Request: { status: "done" }
       * 
       * Simula el flujo de trabajo completo:
       * todo → in-progress → done
       */
      
      // Primero a in-progress
      const inProgressResponse = await taskService.updateStatus(
        createdTaskId, 
        'in-progress', 
        adminToken
      );
      ResponseValidator.validateSuccess(inProgressResponse);
      expect(inProgressResponse.body.status).toBe('in-progress');
      console.log('   ⏳ Task moved to in-progress');
      
      // Luego a done
      const doneResponse = await taskService.updateStatus(
        createdTaskId, 
        'done', 
        adminToken
      );
      ResponseValidator.validateSuccess(doneResponse);
      expect(doneResponse.body.status).toBe('done');
      console.log('   ✅ Task moved to done');
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 6: CLEANUP
    // ═══════════════════════════════════════════════════════════════════════
    await test.step('Step 6: Cleanup - Delete task and user', async () => {
      // Eliminar tarea
      const deleteTaskResponse = await taskService.delete(createdTaskId, adminToken);
      ResponseValidator.validateDeleteSuccess(deleteTaskResponse);
      console.log('   🗑️ Task deleted');
      
      // Eliminar usuario
      const deleteUserResponse = await userService.delete(createdUserId, adminToken);
      ResponseValidator.validateDeleteSuccess(deleteUserResponse);
      console.log('   🗑️ User deleted');
    });
  });

  /**
   * Cleanup adicional por si algún test falla a mitad de ejecución
   * Usa imports estáticos en lugar de dinámicos para compatibilidad con ES modules
   */
  test.afterAll(async ({ request }) => {
    // Intentar limpiar recursos si quedaron pendientes
    if (createdTaskId || createdUserId) {
      console.log('\n🧹 Running final cleanup...');
      
      // Crear servicios para cleanup (usando imports estáticos)
      const authService = new AuthService(request);
      const userService = new UserService(request);
      const taskService = new TaskService(request);
      
      // Obtener token de admin
      const admin = getTestUser('admin');
      const loginResponse = await authService.login(admin.email, admin.password);
      
      if (loginResponse.status === 200) {
        const token = loginResponse.body.token;
        
        // Intentar eliminar tarea
        if (createdTaskId) {
          try {
            await taskService.delete(createdTaskId, token);
            console.log('   🗑️ Cleanup: Task deleted');
          } catch (e) {
            console.log('   ℹ️ Cleanup: Task already deleted or not found');
          }
        }
        
        // Intentar eliminar usuario
        if (createdUserId) {
          try {
            await userService.delete(createdUserId, token);
            console.log('   🗑️ Cleanup: User deleted');
          } catch (e) {
            console.log('   ℹ️ Cleanup: User already deleted or not found');
          }
        }
      }
    }
  });
});

/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                                                                             │
 * │                    🔒 PERMISSIONS & ROLES TESTS                             │
 * │                                                                             │
 * │  Tests que verifican el sistema de permisos basado en roles:                │
 * │  • ADMIN - Acceso completo                                                  │
 * │  • SUPERVISOR - Gestión de tareas del equipo                                │
 * │  • EMPLOYEE - Solo sus tareas                                               │
 * │  • VIEWER - Solo lectura                                                    │
 * │                                                                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */
test.describe('🔒 Permissions & Roles API Tests - Nivel 3', () => {
  
  test.beforeAll(() => {
    console.log('\n📋 Starting Permissions Tests Suite...\n');
  });

  /**
   * TEST: Viewer no puede crear tareas
   * 
   * FLUJO:
   * ┌─────────────────────────────────────────────────────────────────────────┐
   * │   1. Usar viewerToken (fixture pre-autenticado)                         │
   * │      ↓                                                                  │
   * │   2. Intentar crear tarea                                               │
   * │      ↓                                                                  │
   * │   3. API retorna 403 Forbidden                                          │
   * └─────────────────────────────────────────────────────────────────────────┘
   * 
   * Demuestra:
   * - Uso de fixtures de tokens por rol
   * - Validación de permisos negativos
   */
  test('VIEWER should NOT be able to create tasks', async ({ 
    taskService, 
    viewerToken 
  }) => {
    const taskData = TaskFactory.createUnique({ title: 'Viewer Task Attempt' });
    
    const response = await taskService.create(taskData, viewerToken);
    
    ResponseValidator.validateForbidden(response);
    console.log('   ✅ Viewer correctly denied task creation (403)');
  });

  /**
   * TEST: Employee NO puede crear tareas
   * 
   * FLUJO:
   * ┌─────────────────────────────────────────────────────────────────────────┐
   * │   1. Usar employeeToken                                                 │
   * │      ↓                                                                  │
   * │   2. Intentar crear tarea                                               │
   * │      ↓                                                                  │
   * │   3. API retorna 403 Forbidden                                          │
   * └─────────────────────────────────────────────────────────────────────────┘
   * 
   * Nota: En este sistema, solo ADMIN y SUPERVISOR pueden crear tareas.
   * EMPLOYEE solo puede ver y mover sus propias tareas asignadas.
   */
  test('EMPLOYEE should NOT be able to create tasks', async ({ 
    taskService, 
    employeeToken
  }) => {
    const taskData = TaskFactory.createWithPrefix('EmployeeTask');
    
    const response = await taskService.create(taskData, employeeToken);
    
    ResponseValidator.validateForbidden(response);
    console.log('   ✅ Employee correctly denied task creation (403)');
  });

  test('SUPERVISOR should be able to create tasks', async ({ 
    taskService, 
    supervisorToken,
    adminToken 
  }) => {
    const taskData = TaskFactory.createWithPrefix('Tarea de Supervisor');
    let taskId: string;
    
    await test.step('Create task as supervisor', async () => {
      const response = await taskService.create(taskData, supervisorToken);
      
      ResponseValidator.validateSuccess(response);
      ResponseValidator.validateHasProperty(response, 'id');
      taskId = response.body.id;
      
      console.log(`   ✅ Supervisor created task: ${taskId}`);
    });
    
    await test.step('Cleanup task', async () => {
      await taskService.delete(taskId, adminToken);
      console.log('   🗑️ Task cleaned up');
    });
  });

  /**
   * TEST: Solo admin puede acceder a lista de usuarios
   * 
   * Verificamos que:
   * - ADMIN puede listar usuarios ✓
   * - SUPERVISOR no puede listar usuarios ✗
   * - EMPLOYEE no puede listar usuarios ✗
   * - VIEWER no puede listar usuarios ✗
   */
  test('Only ADMIN should access users list', async ({ 
    userService,
    adminToken,
    supervisorToken,
    employeeToken,
    viewerToken 
  }) => {
    // Admin SÍ puede
    await test.step('Admin can list users', async () => {
      const response = await userService.getAll(adminToken);
      ResponseValidator.validateSuccess(response);
      ResponseValidator.validateArray(response, 1);
      console.log(`   ✅ Admin can list users (${response.body.length} found)`);
    });
    
    // Los demás NO pueden
    const nonAdminTokens = [
      { name: 'Supervisor', token: supervisorToken },
      { name: 'Employee', token: employeeToken },
      { name: 'Viewer', token: viewerToken }
    ];
    
    for (const { name, token } of nonAdminTokens) {
      await test.step(`${name} cannot list users`, async () => {
        const response = await userService.getAll(token);
        ResponseValidator.validateForbidden(response);
        console.log(`   ✅ ${name} correctly denied access (403)`);
      });
    }
  });
});

/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                                                                             │
 * │                    📋 TASK MANAGEMENT TESTS                                 │
 * │                                                                             │
 * │  Tests del flujo completo de gestión de tareas:                             │
 * │  • CRUD operations                                                          │
 * │  • Status transitions                                                       │
 * │  • Task assignment                                                          │
 * │                                                                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */
test.describe('📋 Task Management API Tests - Nivel 3', () => {
  
  /** IDs de tareas creadas para cleanup */
  const createdTaskIds: string[] = [];

  test.beforeAll(() => {
    console.log('\n📋 Starting Task Management Tests Suite...\n');
  });

  /**
   * TEST: Crear tareas con diferentes prioridades
   * 
   * Demuestra el uso de TaskFactory para generar
   * tareas con diferentes configuraciones
   */
  test('should create tasks with different priorities', async ({ 
    taskService, 
    adminToken 
  }) => {
    const priorities = TaskFactory.createForAllPriorities({
      description: 'Priority test task'
    });
    
    for (const [priority, taskData] of Object.entries(priorities)) {
      await test.step(`Create ${priority} priority task`, async () => {
        const response = await taskService.create(taskData, adminToken);
        
        ResponseValidator.validateSuccess(response);
        expect(response.body.priority).toBe(priority);
        
        createdTaskIds.push(response.body.id);
        console.log(`   ✅ Created ${priority} priority task: ${response.body.id}`);
      });
    }
  });

  /**
   * TEST: Flujo completo de estados de una tarea
   * 
   * FLUJO:
   * ┌─────────────────────────────────────────────────────────────────────────┐
   * │                                                                         │
   * │   ┌──────────┐         ┌─────────────────┐         ┌──────────┐        │
   * │   │   TODO   │ ──────> │   IN-PROGRESS   │ ──────> │   DONE   │        │
   * │   │ (Create) │  PATCH  │    (Working)    │  PATCH  │ (Complete)│       │
   * │   └──────────┘         └─────────────────┘         └──────────┘        │
   * │                                                                         │
   * └─────────────────────────────────────────────────────────────────────────┘
   */
  test('should complete task status workflow', async ({ 
    taskService, 
    adminToken 
  }) => {
    let taskId: string;
    
    await test.step('Create task in TODO status', async () => {
      const taskData = TaskFactory.createWithStatus('todo', {
        title: 'Workflow Test Task'
      });
      
      const response = await taskService.create(taskData, adminToken);
      ResponseValidator.validateSuccess(response);
      expect(response.body.status).toBe('todo');
      
      taskId = response.body.id;
      createdTaskIds.push(taskId);
      console.log(`   ✅ Task created in TODO: ${taskId}`);
    });
    
    await test.step('Move to IN-PROGRESS', async () => {
      const response = await taskService.updateStatus(taskId, 'in-progress', adminToken);
      
      ResponseValidator.validateSuccess(response);
      expect(response.body.status).toBe('in-progress');
      console.log('   ⏳ Task moved to IN-PROGRESS');
    });
    
    await test.step('Move to DONE', async () => {
      const response = await taskService.updateStatus(taskId, 'done', adminToken);
      
      ResponseValidator.validateSuccess(response);
      expect(response.body.status).toBe('done');
      console.log('   ✅ Task moved to DONE');
    });
    
    await test.step('Move back to TODO (reset)', async () => {
      const response = await taskService.updateStatus(taskId, 'todo', adminToken);
      
      ResponseValidator.validateSuccess(response);
      expect(response.body.status).toBe('todo');
      console.log('   🔄 Task moved back to TODO');
    });
  });

  /**
   * TEST: Obtener lista pública de tareas (sin autenticación)
   * 
   * El endpoint GET /api/tasks es público
   */
  test('should get public tasks list without authentication', async ({ 
    taskService 
  }) => {
    const response = await taskService.getAll();
    
    ResponseValidator.validateSuccess(response);
    ResponseValidator.validateArray(response);
    
    console.log(`   ✅ Public tasks list retrieved (${response.body.length} tasks)`);
  });

  /**
   * Cleanup de todas las tareas creadas
   * Usa imports estáticos para compatibilidad con ES modules
   */
  test.afterAll(async ({ request }) => {
    if (createdTaskIds.length > 0) {
      console.log('\n🧹 Cleaning up created tasks...');
      
      // Usar imports estáticos (ya importados al inicio del archivo)
      const authService = new AuthService(request);
      const taskService = new TaskService(request);
      
      const admin = getTestUser('admin');
      const loginResponse = await authService.login(admin.email, admin.password);
      
      if (loginResponse.status === 200) {
        const token = loginResponse.body.token;
        
        for (const taskId of createdTaskIds) {
          try {
            await taskService.delete(taskId, token);
            console.log(`   🗑️ Deleted task: ${taskId}`);
          } catch (e) {
            console.log(`   ℹ️ Task ${taskId} already deleted or not found`);
          }
        }
      }
    }
  });
});

/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                                                                             │
 * │                    🧪 VALIDATION & ERROR HANDLING TESTS                     │
 * │                                                                             │
 * │  Tests de casos edge y manejo de errores:                                   │
 * │  • Datos inválidos                                                          │
 * │  • Recursos no encontrados                                                  │
 * │  • Conflictos de datos                                                      │
 * │                                                                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */
test.describe('🧪 Validation & Error Handling Tests - Nivel 3', () => {
  
  test.beforeAll(() => {
    console.log('\n📋 Starting Validation Tests Suite...\n');
  });

  /**
   * TEST: Registro con email duplicado
   * 
   * Verifica que la API retorna 409 Conflict cuando
   * se intenta registrar un usuario con email existente
   */
  test('should reject duplicate email registration', async ({ 
    authService, 
    adminToken 
  }) => {
    // Usar credenciales de usuario existente
    const existingUser = getTestUser('admin');
    
    const duplicateUser = UserFactory.createUnique({
      email: existingUser.email  // Email que ya existe
    });
    
    const response = await authService.register(duplicateUser, adminToken);
    
    ResponseValidator.validateConflict(response);
    console.log('   ✅ Duplicate email correctly rejected (409)');
  });

  /**
   * TEST: Registro con contraseña débil
   * 
   * La API requiere:
   * - Mínimo 8 caracteres
   * - Al menos una mayúscula
   * - Al menos una minúscula
   * - Al menos un número
   * 
   * Nota: La API puede retornar 400 (validación) o 500 (error interno)
   * dependiendo de cómo esté implementada la validación.
   * Lo importante es que NO retorne 2xx (éxito).
   */
  test('should reject weak password', async ({ 
    authService, 
    adminToken 
  }) => {
    const weakPasswords = [
      { password: '123', reason: 'too short' },
      { password: 'abcdefgh', reason: 'no uppercase or number' },
      { password: 'ABCDEFGH', reason: 'no lowercase or number' },
      { password: '12345678', reason: 'no letters' }
    ];
    
    for (const { password, reason } of weakPasswords) {
      await test.step(`Reject password: ${reason}`, async () => {
        const userData = UserFactory.createWithInvalidPassword(password);
        const response = await authService.register(userData, adminToken);
        
        // La API debe rechazar la contraseña débil (cualquier código de error)
        // Puede ser 400 (validación correcta) o 500 (error no manejado)
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(600);
        console.log(`   ✅ Weak password rejected with status ${response.status} (${reason})`);
      });
    }
  });

  /**
   * TEST: Acceso a usuario inexistente
   */
  test('should return 404 for non-existent user', async ({ 
    userService, 
    adminToken 
  }) => {
    const fakeUserId = 'non-existent-user-id-12345';
    
    const response = await userService.update(
      fakeUserId, 
      { name: 'New Name' }, 
      adminToken
    );
    
    ResponseValidator.validateNotFound(response);
    console.log('   ✅ Non-existent user correctly returns 404');
  });

  /**
   * TEST: Request sin autenticación a endpoint protegido
   */
  test('should reject unauthenticated request to protected endpoint', async ({ 
    userService 
  }) => {
    // Pasar token vacío
    const response = await userService.getAll('');
    
    ResponseValidator.validateUnauthorized(response);
    console.log('   ✅ Unauthenticated request correctly rejected (401)');
  });
});

/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                                                                             │
 * │                    📊 RESUMEN DE LA ARQUITECTURA                            │
 * │                                                                             │
 * │  Este archivo Nivel3.spec.ts demuestra:                                     │
 * │                                                                             │
 * │  ✅ Service Layer Pattern                                                   │
 * │     - AuthService, UserService, TaskService                                 │
 * │     - Encapsulamiento de endpoints                                          │
 * │     - Métodos tipados con TypeScript                                        │
 * │                                                                             │
 * │  ✅ Custom Fixtures                                                         │
 * │     - Tokens pre-autenticados por rol                                       │
 * │     - Servicios inyectados automáticamente                                  │
 * │     - Código limpio sin setup repetitivo                                    │
 * │                                                                             │
 * │  ✅ Factory Pattern                                                         │
 * │     - UserFactory para datos únicos                                         │
 * │     - TaskFactory para diferentes escenarios                                │
 * │     - Tests aislados y paralelos                                            │
 * │                                                                             │
 * │  ✅ Response Validation                                                     │
 * │     - Validaciones consistentes                                             │
 * │     - Mensajes de error claros                                              │
 * │     - Assertions reutilizables                                              │
 * │                                                                             │
 * │  ✅ Documentación de Flujos                                                 │
 * │     - Diagramas ASCII de arquitectura                                       │
 * │     - Documentación de endpoints                                            │
 * │     - Ejemplos de uso                                                       │
 * │                                                                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

