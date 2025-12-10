/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                           USER MODEL DEFINITIONS                          ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Este archivo contiene las definiciones de tipos para usuarios en la API   ║
 * ║                                                                           ║
 * ║ Flujo de datos:                                                           ║
 * ║ ┌─────────────────────────────────────────────────────────────────────┐   ║
 * ║ │  Test → UserService → API Endpoint → Response → Type Validation    │   ║
 * ║ └─────────────────────────────────────────────────────────────────────┘   ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * Roles disponibles en el sistema
 * - ADMIN: Acceso completo, puede gestionar usuarios y todas las tareas
 * - SUPERVISOR: Puede gestionar tareas de su equipo
 * - EMPLOYEE: Puede gestionar sus propias tareas
 * - VIEWER: Solo lectura
 */
export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE' | 'VIEWER';

/**
 * Datos necesarios para crear un nuevo usuario
 * 
 * @example
 * const newUser: CreateUserRequest = {
 *   email: 'test@example.com',
 *   password: 'SecurePass123!',
 *   name: 'Test User'
 * };
 */
export interface CreateUserRequest {
  /** Email único del usuario (será su identificador de login) */
  email: string;
  /** Contraseña (min 8 chars, mayúscula, minúscula, número) */
  password: string;
  /** Nombre completo del usuario */
  name: string;
  /** Rol del usuario (opcional, default: EMPLOYEE) */
  role?: UserRole;
}

/**
 * Datos para actualizar un usuario existente
 * Todos los campos son opcionales
 */
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
}

/**
 * Estructura del usuario retornada por la API
 * 
 * @example
 * // Respuesta típica de GET /api/users/{id}
 * {
 *   id: "clx123...",
 *   email: "test@example.com",
 *   name: "Test User",
 *   role: "EMPLOYEE",
 *   emailVerified: true,
 *   assigneeId: "clx456...",
 *   createdAt: "2025-01-01T00:00:00.000Z",
 *   updatedAt: "2025-01-01T00:00:00.000Z"
 * }
 */
export interface User {
  /** ID único generado por Prisma (CUID) */
  id: string;
  /** Email del usuario */
  email: string;
  /** Nombre completo */
  name: string;
  /** Rol del usuario en el sistema */
  role: UserRole;
  /** Indica si el email ha sido verificado */
  emailVerified: boolean;
  /** ID del Assignee asociado (para asignación de tareas) */
  assigneeId: string | null;
  /** Fecha de creación */
  createdAt: string;
  /** Fecha de última actualización */
  updatedAt: string;
  /** Información del Assignee (opcional, incluida en algunas respuestas) */
  assignee?: {
    name: string;
    department: string;
    role: string;
  };
}

/**
 * Credenciales para autenticación
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Usuario autenticado con información completa
 */
export interface AuthenticatedUser extends User {
  /** Token de autenticación (JWT o temp_token en desarrollo) */
  token: string;
}

/**
 * Configuración de usuario de prueba
 * Usado por el sistema de fixtures
 */
export interface TestUserConfig {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

