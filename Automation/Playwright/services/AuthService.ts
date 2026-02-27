/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                         AUTH SERVICE                                      ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Servicio para gestionar autenticación en la API                           ║
 * ║                                                                           ║
 * ║ FLUJO DE LOGIN:                                                           ║
 * ║ ┌─────────────────────────────────────────────────────────────────────┐   ║
 * ║ │                                                                     │   ║
 * ║ │  Test                 AuthService              API                  │   ║
 * ║ │   │                       │                     │                   │   ║
 * ║ │   │  login(email, pass)   │                     │                   │   ║
 * ║ │   │──────────────────────>│                     │                   │   ║
 * ║ │   │                       │                     │                   │   ║
 * ║ │   │                       │  POST /auth/login   │                   │   ║
 * ║ │   │                       │────────────────────>│                   │   ║
 * ║ │   │                       │                     │                   │   ║
 * ║ │   │                       │                     │ Validate creds    │   ║
 * ║ │   │                       │                     │ Generate token    │   ║
 * ║ │   │                       │                     │                   │   ║
 * ║ │   │                       │  { user, token }    │                   │   ║
 * ║ │   │                       │<────────────────────│                   │   ║
 * ║ │   │                       │                     │                   │   ║
 * ║ │   │  ApiResponse<Login>   │                     │                   │   ║
 * ║ │   │<──────────────────────│                     │                   │   ║
 * ║ │   │                       │                     │                   │   ║
 * ║ └─────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║ FLUJO DE REGISTRO:                                                        ║
 * ║ ┌─────────────────────────────────────────────────────────────────────┐   ║
 * ║ │                                                                     │   ║
 * ║ │  Test                 AuthService              API                  │   ║
 * ║ │   │                       │                     │                   │   ║
 * ║ │   │  register(data, tkn)  │                     │                   │   ║
 * ║ │   │──────────────────────>│                     │                   │   ║
 * ║ │   │                       │                     │                   │   ║
 * ║ │   │                       │  POST /auth/register│                   │   ║
 * ║ │   │                       │  + Bearer token     │                   │   ║
 * ║ │   │                       │────────────────────>│                   │   ║
 * ║ │   │                       │                     │                   │   ║
 * ║ │   │                       │                     │ Validate data     │   ║
 * ║ │   │                       │                     │ Check duplicates  │   ║
 * ║ │   │                       │                     │ Create user       │   ║
 * ║ │   │                       │                     │ Create assignee   │   ║
 * ║ │   │                       │                     │ Gen verify token  │   ║
 * ║ │   │                       │                     │                   │   ║
 * ║ │   │                       │  { message, user }  │                   │   ║
 * ║ │   │                       │<────────────────────│                   │   ║
 * ║ │   │                       │                     │                   │   ║
 * ║ │   │  ApiResponse<Regist>  │                     │                   │   ║
 * ║ │   │<──────────────────────│                     │                   │   ║
 * ║ │   │                       │                     │                   │   ║
 * ║ └─────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║ Endpoints cubiertos:                                                      ║
 * ║ • POST /api/auth/login    - Autenticar usuario                            ║
 * ║ • POST /api/auth/register - Registrar nuevo usuario                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { APIRequestContext } from '@playwright/test';
import { getBaseURL } from '../config/test-config';
import { 
  ApiResponse, 
  LoginSuccessResponse, 
  RegisterSuccessResponse,
  CreateUserRequest,
  LoginCredentials
} from '../models';

/**
 * Servicio de autenticación para pruebas de API
 * Encapsula todas las operaciones de auth proporcionando una interfaz limpia
 * 
 * @example
 * // Crear instancia
 * const authService = new AuthService(request);
 * 
 * // Login
 * const loginResponse = await authService.login('user@test.com', 'password');
 * console.log(loginResponse.body.token);
 * 
 * // Registro
 * const registerResponse = await authService.register(
 *   { email: 'new@test.com', password: 'Pass123!', name: 'New User' },
 *   adminToken
 * );
 */
export class AuthService {
  /** Contexto de request de Playwright para hacer llamadas HTTP */
  private request: APIRequestContext;
  
  /** URL base de la API (obtenida de configuración) */
  private baseURL: string;

  /**
   * Constructor del servicio de autenticación
   * 
   * @param request - Contexto de request de Playwright
   * 
   * @example
   * // En un test
   * test('login test', async ({ request }) => {
   *   const authService = new AuthService(request);
   *   // usar el servicio...
   * });
   */
  constructor(request: APIRequestContext) {
    this.request = request;
    this.baseURL = getBaseURL();
  }

  /**
   * Autentica un usuario en el sistema
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ ENDPOINT: POST /api/auth/login                                        │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Request Body:                                                         │
   * │   { email: string, password: string }                                 │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Success Response (200):                                               │
   * │   { message: string, user: User, token: string }                      │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Error Responses:                                                      │
   * │   400 - Validation failed (campos faltantes o inválidos)              │
   * │   401 - Invalid email or password                                     │
   * │   403 - Email not verified (si enforcement está habilitado)           │
   * │   500 - Internal server error                                         │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Respuesta de la API con status, body y headers
   * 
   * @example
   * const response = await authService.login('admin@test.com', 'admin123');
   * 
   * if (response.status === 200) {
   *   const token = response.body.token;
   *   const user = response.body.user;
   *   console.log(`Logged in as ${user.name}`);
   * }
   */
  async login(email: string, password: string): Promise<ApiResponse<LoginSuccessResponse>> {
    const response = await this.request.post(`${this.baseURL}/api/auth/login`, {
      data: { email, password },
      headers: { 'Content-Type': 'application/json' }
    });

    return {
      status: response.status(),
      body: await response.json(),
      headers: response.headers()
    };
  }

  /**
   * Versión alternativa de login usando objeto de credenciales
   * Útil cuando ya tienes un objeto de credenciales configurado
   * 
   * @param credentials - Objeto con email y password
   * @returns Respuesta de la API
   * 
   * @example
   * const credentials = { email: 'test@test.com', password: 'pass123' };
   * const response = await authService.loginWithCredentials(credentials);
   */
  async loginWithCredentials(credentials: LoginCredentials): Promise<ApiResponse<LoginSuccessResponse>> {
    return this.login(credentials.email, credentials.password);
  }

  /**
   * Registra un nuevo usuario en el sistema
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ ENDPOINT: POST /api/auth/register                                     │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Headers:                                                              │
   * │   Authorization: Bearer <admin_token>                                 │
   * │   Content-Type: application/json                                      │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Request Body:                                                         │
   * │   {                                                                   │
   * │     email: string (required),                                         │
   * │     password: string (required, min 8 chars, upper+lower+number),     │
   * │     name: string (required)                                           │
   * │   }                                                                   │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Success Response (201):                                               │
   * │   {                                                                   │
   * │     message: "User registered successfully...",                       │
   * │     user: { id, email, name, role, ... }                              │
   * │   }                                                                   │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Error Responses:                                                      │
   * │   400 - Validation failed                                             │
   * │   409 - User with this email already exists                           │
   * │   500 - Internal server error                                         │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Side Effects:                                                         │
   * │   • Crea un perfil Assignee vinculado al usuario                      │
   * │   • Genera token de verificación de email                             │
   * │   • (TODO) Envía email de verificación                                │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @param userData - Datos del nuevo usuario
   * @param token - Token de autenticación (admin requerido)
   * @returns Respuesta de la API
   * 
   * @example
   * const newUser = {
   *   email: `user-${Date.now()}@test.com`,
   *   password: 'SecurePass123!',
   *   name: 'New Test User'
   * };
   * 
   * const response = await authService.register(newUser, adminToken);
   * 
   * if (response.status === 201) {
   *   console.log(`Created user: ${response.body.user.id}`);
   * }
   */
  async register(
    userData: CreateUserRequest, 
    token: string
  ): Promise<ApiResponse<RegisterSuccessResponse>> {
    const response = await this.request.post(`${this.baseURL}/api/auth/register`, {
      data: userData,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return {
      status: response.status(),
      body: await response.json(),
      headers: response.headers()
    };
  }

  /**
   * Helper para obtener rápidamente un token de autenticación
   * Útil para configurar tests que necesitan autenticación
   * 
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Token de autenticación o null si falla
   * 
   * @example
   * const token = await authService.getToken('admin@test.com', 'admin123');
   * if (token) {
   *   // usar token para requests autenticados
   * }
   */
  async getToken(email: string, password: string): Promise<string | null> {
    const response = await this.login(email, password);
    return response.status === 200 ? response.body.token : null;
  }
}

