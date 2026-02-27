/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                       RESPONSE VALIDATOR                                  ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Utilidades para validar respuestas de la API de forma consistente         ║
 * ║                                                                           ║
 * ║ Flujo de validación:                                                      ║
 * ║ ┌─────────────────────────────────────────────────────────────────────┐   ║
 * ║ │                                                                     │   ║
 * ║ │   API Response                                                      │   ║
 * ║ │       │                                                             │   ║
 * ║ │       ▼                                                             │   ║
 * ║ │   ┌─────────────────────────────────────────────────────────────┐   │   ║
 * ║ │   │                   ResponseValidator                         │   │   ║
 * ║ │   │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │   │   ║
 * ║ │   │  │ validateStatus│  │ validateBody  │  │validateHeaders│   │   │   ║
 * ║ │   │  │               │  │               │  │               │   │   │   ║
 * ║ │   │  │ • 200 OK      │  │ • hasProperty │  │ • contentType │   │   │   ║
 * ║ │   │  │ • 201 Created │  │ • schema      │  │ • custom      │   │   │   ║
 * ║ │   │  │ • 4xx Errors  │  │ • deep equal  │  │               │   │   │   ║
 * ║ │   │  │ • 5xx Errors  │  │               │  │               │   │   │   ║
 * ║ │   │  └───────────────┘  └───────────────┘  └───────────────┘   │   │   ║
 * ║ │   └─────────────────────────────────────────────────────────────┘   │   ║
 * ║ │       │                                                             │   ║
 * ║ │       ▼                                                             │   ║
 * ║ │   ✅ Assertion Pass / ❌ Assertion Fail                             │   ║
 * ║ │                                                                     │   ║
 * ║ └─────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║ Beneficios:                                                               ║
 * ║ • Validaciones consistentes en todos los tests                            ║
 * ║ • Mensajes de error descriptivos                                          ║
 * ║ • Reduce duplicación de código                                            ║
 * ║ • Facilita mantenimiento                                                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { expect } from '@playwright/test';
import { ApiResponse } from '../../models';

/**
 * Códigos de estado HTTP comunes para validación
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

/**
 * Clase con métodos estáticos para validar respuestas de API
 * Proporciona assertions reutilizables y mensajes de error descriptivos
 * 
 * @example
 * const response = await authService.login(email, password);
 * ResponseValidator.validateSuccess(response);
 * ResponseValidator.validateHasProperty(response, 'token');
 */
export class ResponseValidator {
  
  /**
   * Valida que la respuesta tenga un status code específico
   * 
   * @param response - Respuesta de la API
   * @param expectedStatus - Status esperado
   * @param message - Mensaje personalizado (opcional)
   * 
   * @example
   * ResponseValidator.validateStatus(response, 200);
   * ResponseValidator.validateStatus(response, 201, 'User should be created');
   */
  static validateStatus<T>(
    response: ApiResponse<T>, 
    expectedStatus: number,
    message?: string
  ): void {
    const errorMessage = message || 
      `Expected status ${expectedStatus}, got ${response.status}. Body: ${JSON.stringify(response.body)}`;
    expect(response.status, errorMessage).toBe(expectedStatus);
  }

  /**
   * Valida que la respuesta sea exitosa (2xx)
   * 
   * @param response - Respuesta de la API
   * @param expectedStatus - Status esperado (default: 200)
   * 
   * @example
   * ResponseValidator.validateSuccess(response);
   * ResponseValidator.validateSuccess(response, 201);
   */
  static validateSuccess<T>(response: ApiResponse<T>, expectedStatus: number = 200): void {
    this.validateStatus(response, expectedStatus, 
      `Expected successful response (${expectedStatus}), got ${response.status}`);
  }

  /**
   * Valida que la respuesta sea de creación exitosa (201)
   * 
   * @param response - Respuesta de la API
   * 
   * @example
   * const response = await userService.create(userData, token);
   * ResponseValidator.validateCreated(response);
   */
  static validateCreated<T>(response: ApiResponse<T>): void {
    this.validateStatus(response, HttpStatus.CREATED, 
      `Expected resource to be created (201), got ${response.status}`);
  }

  /**
   * Valida que la respuesta sea un error de autenticación (401)
   * 
   * @param response - Respuesta de la API
   * 
   * @example
   * const response = await authService.login('wrong@email.com', 'wrongpass');
   * ResponseValidator.validateUnauthorized(response);
   */
  static validateUnauthorized<T>(response: ApiResponse<T>): void {
    this.validateStatus(response, HttpStatus.UNAUTHORIZED,
      `Expected unauthorized error (401), got ${response.status}`);
  }

  /**
   * Valida que la respuesta sea un error de permisos (403)
   * 
   * @param response - Respuesta de la API
   * 
   * @example
   * const response = await userService.delete(userId, viewerToken);
   * ResponseValidator.validateForbidden(response);
   */
  static validateForbidden<T>(response: ApiResponse<T>): void {
    this.validateStatus(response, HttpStatus.FORBIDDEN,
      `Expected forbidden error (403), got ${response.status}`);
  }

  /**
   * Valida que la respuesta sea un error de recurso no encontrado (404)
   * 
   * @param response - Respuesta de la API
   * 
   * @example
   * const response = await userService.update('non-existent-id', data, token);
   * ResponseValidator.validateNotFound(response);
   */
  static validateNotFound<T>(response: ApiResponse<T>): void {
    this.validateStatus(response, HttpStatus.NOT_FOUND,
      `Expected not found error (404), got ${response.status}`);
  }

  /**
   * Valida que la respuesta sea un error de conflicto (409)
   * Típicamente usado cuando un recurso ya existe
   * 
   * @param response - Respuesta de la API
   * 
   * @example
   * const response = await authService.register(existingUser, token);
   * ResponseValidator.validateConflict(response);
   */
  static validateConflict<T>(response: ApiResponse<T>): void {
    this.validateStatus(response, HttpStatus.CONFLICT,
      `Expected conflict error (409), got ${response.status}`);
  }

  /**
   * Valida que la respuesta sea un error de validación (400)
   * 
   * @param response - Respuesta de la API
   * 
   * @example
   * const response = await authService.register(invalidData, token);
   * ResponseValidator.validateBadRequest(response);
   */
  static validateBadRequest<T>(response: ApiResponse<T>): void {
    this.validateStatus(response, HttpStatus.BAD_REQUEST,
      `Expected bad request error (400), got ${response.status}`);
  }

  /**
   * Valida que el body de la respuesta tenga una propiedad específica
   * 
   * @param response - Respuesta de la API
   * @param property - Nombre de la propiedad (soporta notación dot: 'user.name')
   * @param expectedValue - Valor esperado (opcional)
   * 
   * @example
   * // Solo verificar existencia
   * ResponseValidator.validateHasProperty(response, 'token');
   * 
   * // Verificar valor específico
   * ResponseValidator.validateHasProperty(response, 'user.name', 'Admin');
   * ResponseValidator.validateHasProperty(response, 'message', 'Login successful');
   */
  static validateHasProperty<T>(
    response: ApiResponse<T>,
    property: string,
    expectedValue?: unknown
  ): void {
    if (expectedValue !== undefined) {
      expect(response.body).toHaveProperty(property, expectedValue);
    } else {
      expect(response.body).toHaveProperty(property);
    }
  }

  /**
   * Valida que la respuesta tenga un mensaje de error específico
   * 
   * @param response - Respuesta de la API
   * @param errorMessage - Mensaje de error esperado (puede ser substring)
   * 
   * @example
   * ResponseValidator.validateErrorMessage(response, 'Invalid email or password');
   */
  static validateErrorMessage<T extends { error?: string; message?: string }>(
    response: ApiResponse<T>,
    errorMessage: string
  ): void {
    const body = response.body;
    const actualError = body.error || body.message || '';
    expect(actualError).toContain(errorMessage);
  }

  /**
   * Valida respuesta de error genérica con status y mensaje
   * 
   * @param response - Respuesta de la API
   * @param expectedStatus - Status esperado
   * @param errorMessage - Mensaje de error esperado (opcional)
   * 
   * @example
   * ResponseValidator.validateError(response, 401, 'Invalid credentials');
   * ResponseValidator.validateError(response, 403);
   */
  static validateError<T>(
    response: ApiResponse<T>,
    expectedStatus: number,
    errorMessage?: string
  ): void {
    this.validateStatus(response, expectedStatus);
    
    if (errorMessage) {
      this.validateErrorMessage(response as ApiResponse<{ error?: string; message?: string }>, errorMessage);
    }
  }

  /**
   * Valida que el body de la respuesta sea un array
   * 
   * @param response - Respuesta de la API
   * @param minLength - Longitud mínima esperada (opcional)
   * 
   * @example
   * const response = await taskService.getAll();
   * ResponseValidator.validateArray(response);
   * ResponseValidator.validateArray(response, 5); // Al menos 5 items
   */
  static validateArray<T>(response: ApiResponse<T[]>, minLength?: number): void {
    expect(Array.isArray(response.body)).toBe(true);
    
    if (minLength !== undefined) {
      expect(response.body.length).toBeGreaterThanOrEqual(minLength);
    }
  }

  /**
   * Valida que el body de la respuesta contenga un item específico
   * 
   * @param response - Respuesta de la API (array)
   * @param predicate - Función para encontrar el item
   * 
   * @example
   * ResponseValidator.validateArrayContains(
   *   response,
   *   item => item.email === 'admin@test.com'
   * );
   */
  static validateArrayContains<T>(
    response: ApiResponse<T[]>,
    predicate: (item: T) => boolean
  ): void {
    const found = response.body.some(predicate);
    expect(found, 'Expected array to contain matching item').toBe(true);
  }

  /**
   * Validación completa de respuesta de login exitoso
   * Combina múltiples validaciones comunes para login
   * 
   * @param response - Respuesta del login
   * @param expectedUserName - Nombre de usuario esperado (opcional)
   * 
   * @example
   * const response = await authService.login(email, password);
   * ResponseValidator.validateLoginSuccess(response, 'Admin Dev');
   */
  static validateLoginSuccess<T extends { token: string; user: { name: string } }>(
    response: ApiResponse<T>,
    expectedUserName?: string
  ): void {
    this.validateSuccess(response);
    this.validateHasProperty(response, 'token');
    this.validateHasProperty(response, 'user');
    
    if (expectedUserName) {
      this.validateHasProperty(response, 'user.name', expectedUserName);
    }
  }

  /**
   * Validación completa de respuesta de registro exitoso
   * 
   * @param response - Respuesta del registro
   * 
   * @example
   * const response = await authService.register(userData, token);
   * ResponseValidator.validateRegisterSuccess(response);
   */
  static validateRegisterSuccess<T extends { message: string; user: { id: string } }>(
    response: ApiResponse<T>
  ): void {
    this.validateCreated(response);
    this.validateHasProperty(response, 'message');
    this.validateHasProperty(response, 'user.id');
  }

  /**
   * Validación completa de respuesta de eliminación exitosa
   * 
   * @param response - Respuesta de delete
   * 
   * @example
   * const response = await userService.delete(userId, token);
   * ResponseValidator.validateDeleteSuccess(response);
   */
  static validateDeleteSuccess<T>(response: ApiResponse<T>): void {
    this.validateSuccess(response);
  }
}

