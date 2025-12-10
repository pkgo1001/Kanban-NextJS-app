/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                         USER SERVICE                                      ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Servicio para gestionar usuarios en la API                                ║
 * ║                                                                           ║
 * ║ FLUJO DE GESTIÓN DE USUARIOS (ADMIN):                                     ║
 * ║ ┌─────────────────────────────────────────────────────────────────────┐   ║
 * ║ │                                                                     │   ║
 * ║ │   Test                UserService              API                  │   ║
 * ║ │    │                      │                     │                   │   ║
 * ║ │    │  getAll(token)       │                     │                   │   ║
 * ║ │    │─────────────────────>│                     │                   │   ║
 * ║ │    │                      │  GET /users         │                   │   ║
 * ║ │    │                      │  + Bearer token     │                   │   ║
 * ║ │    │                      │────────────────────>│                   │   ║
 * ║ │    │                      │                     │ Check admin role  │   ║
 * ║ │    │                      │    [ users... ]     │                   │   ║
 * ║ │    │                      │<────────────────────│                   │   ║
 * ║ │    │  ApiResponse<Users>  │                     │                   │   ║
 * ║ │    │<─────────────────────│                     │                   │   ║
 * ║ │                                                                     │   ║
 * ║ └─────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║ FLUJO DE VERIFICACIÓN DE EMAIL:                                           ║
 * ║ ┌─────────────────────────────────────────────────────────────────────┐   ║
 * ║ │                                                                     │   ║
 * ║ │   Test                UserService              API                  │   ║
 * ║ │    │                      │                     │                   │   ║
 * ║ │    │  verifyEmail(id,tkn) │                     │                   │   ║
 * ║ │    │─────────────────────>│                     │                   │   ║
 * ║ │    │                      │ POST /users/{id}/   │                   │   ║
 * ║ │    │                      │   verify-email      │                   │   ║
 * ║ │    │                      │────────────────────>│                   │   ║
 * ║ │    │                      │                     │ Set emailVerified │   ║
 * ║ │    │                      │                     │ Clear token       │   ║
 * ║ │    │                      │  { message, user }  │                   │   ║
 * ║ │    │                      │<────────────────────│                   │   ║
 * ║ │    │ ApiResponse<Verify>  │                     │                   │   ║
 * ║ │    │<─────────────────────│                     │                   │   ║
 * ║ │                                                                     │   ║
 * ║ └─────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║ Permisos requeridos:                                                      ║
 * ║ • Todas las operaciones requieren rol ADMIN                               ║
 * ║ • Los admins no pueden eliminarse a sí mismos                             ║
 * ║                                                                           ║
 * ║ Endpoints cubiertos:                                                      ║
 * ║ • GET    /api/users              - Listar usuarios                        ║
 * ║ • POST   /api/users              - Crear usuario                          ║
 * ║ • PUT    /api/users/{id}         - Actualizar usuario                     ║
 * ║ • DELETE /api/users/{id}         - Eliminar usuario                       ║
 * ║ • POST   /api/users/{id}/verify-email   - Verificar email                 ║
 * ║ • POST   /api/users/{id}/reset-password - Resetear contraseña             ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { APIRequestContext } from '@playwright/test';
import { getBaseURL } from '../config/test-config';
import { 
  ApiResponse,
  User,
  UsersListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  VerifyEmailResponse,
  DeleteUserResponse,
  ResetPasswordResponse
} from '../models';

/**
 * Servicio de gestión de usuarios para pruebas de API
 * Encapsula operaciones CRUD y administrativas sobre usuarios
 * 
 * @example
 * // Crear instancia
 * const userService = new UserService(request);
 * 
 * // Obtener todos los usuarios
 * const users = await userService.getAll(adminToken);
 * 
 * // Eliminar usuario
 * await userService.delete(userId, adminToken);
 */
export class UserService {
  private request: APIRequestContext;
  private baseURL: string;

  /**
   * Constructor del servicio de usuarios
   * @param request - Contexto de request de Playwright
   */
  constructor(request: APIRequestContext) {
    this.request = request;
    this.baseURL = getBaseURL();
  }

  /**
   * Genera los headers de autenticación estándar
   * @param token - Token de autenticación
   * @returns Headers para requests autenticados
   */
  private getAuthHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Obtiene la lista de todos los usuarios del sistema
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ ENDPOINT: GET /api/users                                              │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Headers:                                                              │
   * │   Authorization: Bearer <admin_token> (ADMIN required)                │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Success Response (200):                                               │
   * │   [                                                                   │
   * │     { id, email, name, role, emailVerified, assignee: {...} },        │
   * │     ...                                                               │
   * │   ]                                                                   │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Error Responses:                                                      │
   * │   401 - Authentication required                                       │
   * │   403 - Admin role required                                           │
   * │   500 - Internal server error                                         │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @param token - Token de autenticación (admin)
   * @returns Lista de usuarios
   * 
   * @example
   * const response = await userService.getAll(adminToken);
   * if (response.status === 200) {
   *   console.log(`Found ${response.body.length} users`);
   * }
   */
  async getAll(token: string): Promise<ApiResponse<UsersListResponse>> {
    const response = await this.request.get(`${this.baseURL}/api/users`, {
      headers: this.getAuthHeaders(token)
    });

    return {
      status: response.status(),
      body: await response.json(),
      headers: response.headers()
    };
  }

  /**
   * Crea un nuevo usuario (Admin only)
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ ENDPOINT: POST /api/users                                             │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Headers:                                                              │
   * │   Authorization: Bearer <admin_token>                                 │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Request Body:                                                         │
   * │   {                                                                   │
   * │     email: string,                                                    │
   * │     name: string,                                                     │
   * │     password: string,                                                 │
   * │     role: string,                                                     │
   * │     assigneeName?: string,                                            │
   * │     assigneeDepartment?: string,                                      │
   * │     assigneeRole?: string                                             │
   * │   }                                                                   │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Success Response (201):                                               │
   * │   { id, email, name, role, ... }                                      │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Error Responses:                                                      │
   * │   400 - Missing required fields                                       │
   * │   401 - Authentication required                                       │
   * │   403 - Admin role required                                           │
   * │   409 - User already exists                                           │
   * │   500 - Internal server error                                         │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @param userData - Datos del usuario a crear
   * @param token - Token de autenticación (admin)
   * @returns Usuario creado
   */
  async create(userData: CreateUserRequest, token: string): Promise<ApiResponse<User>> {
    const response = await this.request.post(`${this.baseURL}/api/users`, {
      data: userData,
      headers: this.getAuthHeaders(token)
    });

    return {
      status: response.status(),
      body: await response.json(),
      headers: response.headers()
    };
  }

  /**
   * Actualiza un usuario existente (Admin only)
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ ENDPOINT: PUT /api/users/{id}                                         │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Path Parameters:                                                      │
   * │   id - ID del usuario a actualizar                                    │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Request Body (partial update):                                        │
   * │   { name?, email?, role? }                                            │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Success Response (200):                                               │
   * │   { id, email, name, role, ... } (usuario actualizado)                │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Error Responses:                                                      │
   * │   400 - Invalid data                                                  │
   * │   401 - Authentication required                                       │
   * │   403 - Admin role required                                           │
   * │   404 - User not found                                                │
   * │   500 - Internal server error                                         │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @param userId - ID del usuario
   * @param updateData - Campos a actualizar
   * @param token - Token de autenticación (admin)
   * @returns Usuario actualizado
   */
  async update(
    userId: string, 
    updateData: UpdateUserRequest, 
    token: string
  ): Promise<ApiResponse<User>> {
    const response = await this.request.put(`${this.baseURL}/api/users/${userId}`, {
      data: updateData,
      headers: this.getAuthHeaders(token)
    });

    return {
      status: response.status(),
      body: await response.json(),
      headers: response.headers()
    };
  }

  /**
   * Elimina un usuario del sistema (Admin only)
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ ENDPOINT: DELETE /api/users/{id}                                      │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Path Parameters:                                                      │
   * │   id - ID del usuario a eliminar                                      │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Important:                                                            │
   * │   • Los admins NO pueden eliminarse a sí mismos                       │
   * │   • Se elimina el usuario y su perfil Assignee asociado               │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Success Response (200):                                               │
   * │   { success: true, message: "User deleted successfully" }             │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Error Responses:                                                      │
   * │   401 - Authentication required                                       │
   * │   403 - Admin role required / Cannot delete yourself                  │
   * │   404 - User not found                                                │
   * │   500 - Internal server error                                         │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @param userId - ID del usuario a eliminar
   * @param token - Token de autenticación (admin)
   * @returns Confirmación de eliminación
   * 
   * @example
   * const response = await userService.delete(userId, adminToken);
   * expect(response.status).toBe(200);
   * expect(response.body.message).toBe('User deleted successfully');
   */
  async delete(userId: string, token: string): Promise<ApiResponse<DeleteUserResponse>> {
    const response = await this.request.delete(`${this.baseURL}/api/users/${userId}`, {
      headers: this.getAuthHeaders(token)
    });

    return {
      status: response.status(),
      body: await response.json(),
      headers: response.headers()
    };
  }

  /**
   * Verifica el email de un usuario manualmente (Admin only)
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ ENDPOINT: POST /api/users/{id}/verify-email                           │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Path Parameters:                                                      │
   * │   id - ID del usuario                                                 │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Side Effects:                                                         │
   * │   • Establece emailVerified = true                                    │
   * │   • Limpia emailVerificationToken                                     │
   * │   • Habilita acceso completo al sistema                               │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Success Response (200):                                               │
   * │   { message: "Email verified successfully", user: {...} }             │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Error Responses:                                                      │
   * │   401 - Authentication required                                       │
   * │   403 - Admin role required                                           │
   * │   404 - User not found                                                │
   * │   500 - Internal server error                                         │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @param userId - ID del usuario
   * @param token - Token de autenticación (admin)
   * @returns Confirmación de verificación
   */
  async verifyEmail(userId: string, token: string): Promise<ApiResponse<VerifyEmailResponse>> {
    const response = await this.request.post(
      `${this.baseURL}/api/users/${userId}/verify-email`,
      { headers: this.getAuthHeaders(token) }
    );

    return {
      status: response.status(),
      body: await response.json(),
      headers: response.headers()
    };
  }

  /**
   * Resetea la contraseña de un usuario (Admin only)
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ ENDPOINT: POST /api/users/{id}/reset-password                         │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Path Parameters:                                                      │
   * │   id - ID del usuario                                                 │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Request Body:                                                         │
   * │   { newPassword: string } (min 6 caracteres)                          │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Success Response (200):                                               │
   * │   { success: true, message: "Password reset successfully" }           │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Error Responses:                                                      │
   * │   400 - Password too short                                            │
   * │   401 - Authentication required                                       │
   * │   403 - Admin role required                                           │
   * │   404 - User not found                                                │
   * │   500 - Internal server error                                         │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @param userId - ID del usuario
   * @param newPassword - Nueva contraseña
   * @param token - Token de autenticación (admin)
   * @returns Confirmación de reset
   */
  async resetPassword(
    userId: string, 
    newPassword: string, 
    token: string
  ): Promise<ApiResponse<ResetPasswordResponse>> {
    const response = await this.request.post(
      `${this.baseURL}/api/users/${userId}/reset-password`,
      {
        data: { newPassword },
        headers: this.getAuthHeaders(token)
      }
    );

    return {
      status: response.status(),
      body: await response.json(),
      headers: response.headers()
    };
  }

  /**
   * Busca un usuario por email en la lista de usuarios
   * Método helper para facilitar búsquedas en tests
   * 
   * @param email - Email del usuario a buscar
   * @param token - Token de autenticación (admin)
   * @returns Usuario encontrado o null
   * 
   * @example
   * const user = await userService.findByEmail('test@example.com', token);
   * if (user) {
   *   console.log(`Found user: ${user.name}`);
   * }
   */
  async findByEmail(email: string, token: string): Promise<User | null> {
    const response = await this.getAll(token);
    if (response.status !== 200) return null;
    
    return response.body.find(user => user.email === email) || null;
  }

  /**
   * Verifica si un usuario existe en el sistema
   * 
   * @param userId - ID del usuario
   * @param token - Token de autenticación (admin)
   * @returns true si existe, false si no
   */
  async exists(userId: string, token: string): Promise<boolean> {
    const response = await this.getAll(token);
    if (response.status !== 200) return false;
    
    return response.body.some(user => user.id === userId);
  }
}

