/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                      API RESPONSE TYPE DEFINITIONS                        ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Este archivo define los tipos de respuestas estándar de la API            ║
 * ║                                                                           ║
 * ║ Estructura de respuestas:                                                 ║
 * ║ ┌──────────────────────────────────────────────────────────────────────┐  ║
 * ║ │  SUCCESS (2xx)           │  ERROR (4xx/5xx)                         │  ║
 * ║ │  ─────────────────────   │  ────────────────────────────────────    │  ║
 * ║ │  {                       │  {                                       │  ║
 * ║ │    status: 200,          │    status: 401,                          │  ║
 * ║ │    body: { data... },    │    body: { error: "message" },           │  ║
 * ║ │    headers: {...}        │    headers: {...}                        │  ║
 * ║ │  }                       │  }                                       │  ║
 * ║ └──────────────────────────────────────────────────────────────────────┘  ║
 * ║                                                                           ║
 * ║ Códigos de estado comunes:                                                ║
 * ║ • 200 - OK (éxito)                                                        ║
 * ║ • 201 - Created (recurso creado)                                          ║
 * ║ • 400 - Bad Request (validación fallida)                                  ║
 * ║ • 401 - Unauthorized (no autenticado)                                     ║
 * ║ • 403 - Forbidden (sin permisos)                                          ║
 * ║ • 404 - Not Found (recurso no existe)                                     ║
 * ║ • 409 - Conflict (recurso ya existe)                                      ║
 * ║ • 500 - Internal Server Error                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { User, AuthenticatedUser } from './User';
import { Task } from './Task';

/**
 * Estructura genérica de respuesta de la API
 * Envuelve todas las respuestas para manejo uniforme
 * 
 * @template T - Tipo del body de la respuesta
 * 
 * @example
 * // Uso con tipo específico
 * const response: ApiResponse<User> = await userService.getById(id);
 * if (response.status === 200) {
 *   console.log(response.body.name);
 * }
 */
export interface ApiResponse<T> {
  /** Código de estado HTTP */
  status: number;
  /** Cuerpo de la respuesta (parseado de JSON) */
  body: T;
  /** Headers de la respuesta */
  headers: Record<string, string>;
}

// ============================================================================
// AUTH RESPONSES
// ============================================================================

/**
 * Respuesta exitosa de login
 * POST /api/auth/login → 200
 */
export interface LoginSuccessResponse {
  message: string;
  user: User;
  token: string;
}

/**
 * Respuesta exitosa de registro
 * POST /api/auth/register → 201
 */
export interface RegisterSuccessResponse {
  message: string;
  user: User;
}

// ============================================================================
// USER RESPONSES
// ============================================================================

/**
 * Respuesta de lista de usuarios
 * GET /api/users → 200
 */
export type UsersListResponse = User[];

/**
 * Respuesta exitosa al verificar email
 * POST /api/users/{id}/verify-email → 200
 */
export interface VerifyEmailResponse {
  message: string;
  user: User;
}

/**
 * Respuesta exitosa al eliminar usuario
 * DELETE /api/users/{id} → 200
 */
export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

/**
 * Respuesta exitosa al resetear password
 * POST /api/users/{id}/reset-password → 200
 */
export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// TASK RESPONSES
// ============================================================================

/**
 * Respuesta de lista de tareas
 * GET /api/tasks → 200
 */
export type TasksListResponse = Task[];

/**
 * Respuesta exitosa al eliminar tarea
 * DELETE /api/tasks/{id} → 200
 */
export interface DeleteTaskResponse {
  success: boolean;
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

/**
 * Estructura de error de validación
 * Retornada cuando los datos enviados no pasan la validación
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Respuesta de error de validación
 * Típicamente retornada con status 400
 */
export interface ValidationErrorResponse {
  message: string;
  errors: ValidationError[];
}

/**
 * Respuesta de error genérico
 * Usada para errores 401, 403, 404, 409, 500
 */
export interface ErrorResponse {
  error: string;
}

/**
 * Respuesta de error con mensaje (formato alternativo)
 */
export interface MessageErrorResponse {
  message: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Helper type para respuestas que pueden ser éxito o error
 * 
 * @example
 * type LoginResult = ApiResult<LoginSuccessResponse, ErrorResponse>;
 */
export type ApiResult<TSuccess, TError = ErrorResponse> = 
  | { success: true; data: TSuccess }
  | { success: false; error: TError };

/**
 * Tipo para headers de autenticación
 */
export interface AuthHeaders {
  'Content-Type': 'application/json';
  'Authorization': `Bearer ${string}`;
}

/**
 * Tipo para headers básicos sin autenticación
 */
export interface BasicHeaders {
  'Content-Type': 'application/json';
}

