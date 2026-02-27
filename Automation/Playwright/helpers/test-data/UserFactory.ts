/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                         USER FACTORY                                      ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Factory para generar datos de usuarios para pruebas                       ║
 * ║                                                                           ║
 * ║ ¿Por qué usar Factories?                                                  ║
 * ║ ┌─────────────────────────────────────────────────────────────────────┐   ║
 * ║ │ ❌ SIN FACTORY:                                                     │   ║
 * ║ │    const user = {                                                   │   ║
 * ║ │      email: 'test@test.com',  // ⚠️ Puede causar conflictos        │   ║
 * ║ │      password: '123',          // ⚠️ No cumple validación          │   ║
 * ║ │      name: 'Test'              // ⚠️ Datos estáticos               │   ║
 * ║ │    };                                                               │   ║
 * ║ │                                                                     │   ║
 * ║ │ ✅ CON FACTORY:                                                     │   ║
 * ║ │    const user = UserFactory.createUnique();                         │   ║
 * ║ │    // {                                                             │   ║
 * ║ │    //   email: 'user-1702345678123-x7k9m@test.com',  ← Único       │   ║
 * ║ │    //   password: 'SecurePass123!',                   ← Válido      │   ║
 * ║ │    //   name: 'Test User 1702345678123'               ← Dinámico    │   ║
 * ║ │    // }                                                             │   ║
 * ║ └─────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║ Ventajas:                                                                 ║
 * ║ • Emails únicos evitan errores 409 (Conflict)                             ║
 * ║ • Contraseñas cumplen validación de la API                                ║
 * ║ • Tests pueden ejecutarse en paralelo sin conflictos                      ║
 * ║ • Fácil personalización con overrides                                     ║
 * ║ • Datos consistentes y predecibles                                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { CreateUserRequest, UserRole } from '../../models';

/**
 * Factory para generar datos de usuarios de prueba
 * Garantiza datos únicos y válidos para cada test
 * 
 * @example
 * // Usuario básico único
 * const user = UserFactory.createUnique();
 * 
 * // Usuario con email específico
 * const customUser = UserFactory.createUnique({ name: 'John Doe' });
 * 
 * // Múltiples usuarios
 * const users = UserFactory.createBulk(5);
 */
export class UserFactory {
  /** Prefijo para emails generados */
  private static readonly EMAIL_PREFIX = 'testuser';
  
  /** Dominio para emails de prueba */
  private static readonly EMAIL_DOMAIN = 'test.com';
  
  /** Contraseña por defecto que cumple todos los requisitos */
  private static readonly DEFAULT_PASSWORD = 'SecurePass123!';

  /**
   * Genera un string aleatorio para garantizar unicidad
   * @param length - Longitud del string (default: 5)
   * @returns String aleatorio alfanumérico
   */
  private static generateRandomString(length: number = 5): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  /**
   * Genera un timestamp único basado en Date.now()
   * @returns Timestamp como string
   */
  private static getTimestamp(): string {
    return Date.now().toString();
  }

  /**
   * Crea un usuario único para pruebas
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ GENERACIÓN DE DATOS                                                   │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Email:    testuser-{timestamp}-{random}@test.com                      │
   * │           ↓                                                           │
   * │           Garantiza unicidad incluso en ejecución paralela            │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Password: SecurePass123!                                              │
   * │           ↓                                                           │
   * │           Cumple: min 8 chars, uppercase, lowercase, number           │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Name:     Test User {timestamp}                                       │
   * │           ↓                                                           │
   * │           Permite identificar usuario en logs/debug                   │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @param overrides - Campos a sobrescribir (opcional)
   * @returns Datos de usuario válidos y únicos
   * 
   * @example
   * // Usuario básico
   * const user = UserFactory.createUnique();
   * 
   * // Usuario con nombre específico
   * const namedUser = UserFactory.createUnique({ name: 'John Doe' });
   * 
   * // Usuario admin
   * const admin = UserFactory.createUnique({ role: 'ADMIN' });
   */
  static createUnique(overrides?: Partial<CreateUserRequest>): CreateUserRequest {
    const timestamp = this.getTimestamp();
    const randomStr = this.generateRandomString();

    return {
      email: `${this.EMAIL_PREFIX}-${timestamp}-${randomStr}@${this.EMAIL_DOMAIN}`,
      password: this.DEFAULT_PASSWORD,
      name: `Test User ${timestamp}`,
      ...overrides
    };
  }

  /**
   * Crea un usuario con un prefijo específico en el email
   * Útil para identificar usuarios de un test específico
   * 
   * @param prefix - Prefijo para el email
   * @param overrides - Campos adicionales a sobrescribir
   * @returns Datos de usuario con prefijo personalizado
   * 
   * @example
   * const user = UserFactory.createWithPrefix('nivel3');
   * // email: nivel3-1702345678123-x7k9m@test.com
   */
  static createWithPrefix(prefix: string, overrides?: Partial<CreateUserRequest>): CreateUserRequest {
    const timestamp = this.getTimestamp();
    const randomStr = this.generateRandomString();

    return {
      email: `${prefix}-${timestamp}-${randomStr}@${this.EMAIL_DOMAIN}`,
      password: this.DEFAULT_PASSWORD,
      name: `${prefix} User ${timestamp}`,
      ...overrides
    };
  }

  /**
   * Crea múltiples usuarios únicos
   * 
   * @param count - Cantidad de usuarios a crear
   * @param overrides - Campos a aplicar a todos los usuarios
   * @returns Array de datos de usuarios
   * 
   * @example
   * // 5 usuarios básicos
   * const users = UserFactory.createBulk(5);
   * 
   * // 3 usuarios con rol específico
   * const admins = UserFactory.createBulk(3, { role: 'ADMIN' });
   */
  static createBulk(count: number, overrides?: Partial<CreateUserRequest>): CreateUserRequest[] {
    return Array.from({ length: count }, () => this.createUnique(overrides));
  }

  /**
   * Crea un usuario para cada rol del sistema
   * Útil para tests de permisos
   * 
   * @returns Objeto con un usuario por rol
   * 
   * @example
   * const roleUsers = UserFactory.createForAllRoles();
   * // {
   * //   admin: { email: '...', role: 'ADMIN', ... },
   * //   supervisor: { email: '...', role: 'SUPERVISOR', ... },
   * //   employee: { email: '...', role: 'EMPLOYEE', ... },
   * //   viewer: { email: '...', role: 'VIEWER', ... }
   * // }
   */
  static createForAllRoles(): Record<Lowercase<UserRole>, CreateUserRequest> {
    const roles: UserRole[] = ['ADMIN', 'SUPERVISOR', 'EMPLOYEE', 'VIEWER'];
    const result: Record<string, CreateUserRequest> = {};

    roles.forEach(role => {
      result[role.toLowerCase()] = this.createUnique({ role });
    });

    return result as Record<Lowercase<UserRole>, CreateUserRequest>;
  }

  /**
   * Crea credenciales de login válidas
   * Útil para tests de autenticación
   * 
   * @param email - Email del usuario
   * @param password - Contraseña (opcional, usa default)
   * @returns Objeto con credenciales
   */
  static createCredentials(email: string, password?: string) {
    return {
      email,
      password: password || this.DEFAULT_PASSWORD
    };
  }

  /**
   * Crea datos de usuario con contraseña inválida
   * Útil para tests de validación negativa
   * 
   * @param invalidPassword - Contraseña inválida a usar
   * @returns Datos de usuario con contraseña inválida
   * 
   * @example
   * // Contraseña muy corta
   * const user = UserFactory.createWithInvalidPassword('123');
   * // Debería fallar validación de la API
   */
  static createWithInvalidPassword(invalidPassword: string): CreateUserRequest {
    return this.createUnique({ password: invalidPassword });
  }

  /**
   * Crea datos de usuario con email inválido
   * Útil para tests de validación negativa
   * 
   * @param invalidEmail - Email inválido a usar
   * @returns Datos de usuario con email inválido
   * 
   * @example
   * const user = UserFactory.createWithInvalidEmail('not-an-email');
   */
  static createWithInvalidEmail(invalidEmail: string): CreateUserRequest {
    const user = this.createUnique();
    return { ...user, email: invalidEmail };
  }
}

// Type helper para Lowercase
type Lowercase<T extends string> = T extends 'ADMIN' ? 'admin' :
  T extends 'SUPERVISOR' ? 'supervisor' :
  T extends 'EMPLOYEE' ? 'employee' :
  T extends 'VIEWER' ? 'viewer' : never;

