/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                         TASK FACTORY                                      ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Factory para generar datos de tareas para pruebas                         ║
 * ║                                                                           ║
 * ║ Estructura de una tarea Kanban:                                           ║
 * ║ ┌─────────────────────────────────────────────────────────────────────┐   ║
 * ║ │  ┌─────────────────────────────────────────────────────────────┐    │   ║
 * ║ │  │ 🔴 HIGH    Task Title                           📅 Dec 31   │    │   ║
 * ║ │  ├─────────────────────────────────────────────────────────────┤    │   ║
 * ║ │  │ Task description goes here...                               │    │   ║
 * ║ │  ├─────────────────────────────────────────────────────────────┤    │   ║
 * ║ │  │ 👤 Assignee Name                                            │    │   ║
 * ║ │  │ 🏷️ [tag1] [tag2]                                            │    │   ║
 * ║ │  └─────────────────────────────────────────────────────────────┘    │   ║
 * ║ └─────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║ Prioridades:                                                              ║
 * ║ • 🔴 high   - Requiere atención inmediata                                 ║
 * ║ • 🟡 medium - Prioridad normal (default)                                  ║
 * ║ • 🟢 low    - Puede esperar                                               ║
 * ║                                                                           ║
 * ║ Estados:                                                                  ║
 * ║ • todo        - Pendiente                                                 ║
 * ║ • in-progress - En progreso                                               ║
 * ║ • done        - Completada                                                ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { CreateTaskRequest, TaskPriority, TaskStatus } from '../../models';

/**
 * Factory para generar datos de tareas de prueba
 * Garantiza datos únicos y válidos para cada test
 * 
 * @example
 * // Tarea básica
 * const task = TaskFactory.createUnique();
 * 
 * // Tarea de alta prioridad
 * const urgentTask = TaskFactory.createHighPriority();
 * 
 * // Tarea asignada
 * const assignedTask = TaskFactory.createAssigned('Sarah Chen');
 */
export class TaskFactory {
  /** Prefijo para títulos de tareas */
  private static readonly TITLE_PREFIX = 'Test Task';

  /**
   * Genera un timestamp único
   * @returns Timestamp como string
   */
  private static getTimestamp(): string {
    return Date.now().toString();
  }

  /**
   * Genera una fecha futura para dueDate
   * @param daysFromNow - Días desde hoy
   * @returns Fecha en formato YYYY-MM-DD
   */
  private static getFutureDate(daysFromNow: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }

  /**
   * Crea una tarea única para pruebas
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ DATOS GENERADOS                                                       │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ title:       "Test Task {timestamp}"                                  │
   * │ description: "Automated test task created at {timestamp}"             │
   * │ priority:    "medium" (default)                                       │
   * │ status:      "todo" (default de la API)                               │
   * │ dueDate:     30 días desde hoy                                        │
   * │ tags:        ["automated", "test"]                                    │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @param overrides - Campos a sobrescribir
   * @returns Datos de tarea válidos y únicos
   * 
   * @example
   * const task = TaskFactory.createUnique();
   * const customTask = TaskFactory.createUnique({ priority: 'high' });
   */
  static createUnique(overrides?: Partial<CreateTaskRequest>): CreateTaskRequest {
    const timestamp = this.getTimestamp();

    return {
      title: `${this.TITLE_PREFIX} ${timestamp}`,
      description: `Automated test task created at ${timestamp}`,
      priority: 'medium',
      dueDate: this.getFutureDate(30),
      tags: ['automated', 'test'],
      ...overrides
    };
  }

  /**
   * Crea una tarea con un prefijo específico en el título
   * Útil para identificar tareas de un test específico
   * 
   * @param prefix - Prefijo para el título
   * @param overrides - Campos adicionales
   * @returns Datos de tarea con prefijo personalizado
   * 
   * @example
   * const task = TaskFactory.createWithPrefix('Nivel3');
   * // title: "Nivel3 - Test Task 1702345678123"
   */
  static createWithPrefix(prefix: string, overrides?: Partial<CreateTaskRequest>): CreateTaskRequest {
    const timestamp = this.getTimestamp();

    return {
      title: `${prefix} - ${this.TITLE_PREFIX} ${timestamp}`,
      description: `${prefix} automated test task created at ${timestamp}`,
      priority: 'medium',
      dueDate: this.getFutureDate(30),
      tags: ['automated', 'test', prefix.toLowerCase()],
      ...overrides
    };
  }

  /**
   * Crea una tarea de alta prioridad
   * 
   * @param overrides - Campos adicionales
   * @returns Tarea con prioridad high
   * 
   * @example
   * const urgentTask = TaskFactory.createHighPriority({
   *   title: 'Fix critical bug'
   * });
   */
  static createHighPriority(overrides?: Partial<CreateTaskRequest>): CreateTaskRequest {
    return this.createUnique({
      priority: 'high',
      tags: ['urgent', 'automated', 'test'],
      ...overrides
    });
  }

  /**
   * Crea una tarea de baja prioridad
   * 
   * @param overrides - Campos adicionales
   * @returns Tarea con prioridad low
   */
  static createLowPriority(overrides?: Partial<CreateTaskRequest>): CreateTaskRequest {
    return this.createUnique({
      priority: 'low',
      dueDate: this.getFutureDate(90), // Más tiempo para tareas de baja prioridad
      ...overrides
    });
  }

  /**
   * Crea una tarea asignada a una persona específica
   * 
   * @param assigneeName - Nombre del asignado (debe existir como Assignee)
   * @param overrides - Campos adicionales
   * @returns Tarea asignada
   * 
   * @example
   * const task = TaskFactory.createAssigned('Sarah Chen');
   */
  static createAssigned(assigneeName: string, overrides?: Partial<CreateTaskRequest>): CreateTaskRequest {
    return this.createUnique({
      assignee: assigneeName,
      ...overrides
    });
  }

  /**
   * Crea una tarea con estado específico
   * 
   * @param status - Estado inicial de la tarea
   * @param overrides - Campos adicionales
   * @returns Tarea con estado específico
   * 
   * @example
   * const inProgressTask = TaskFactory.createWithStatus('in-progress');
   */
  static createWithStatus(status: TaskStatus, overrides?: Partial<CreateTaskRequest>): CreateTaskRequest {
    return this.createUnique({
      status,
      ...overrides
    });
  }

  /**
   * Crea múltiples tareas únicas
   * 
   * @param count - Cantidad de tareas
   * @param overrides - Campos a aplicar a todas
   * @returns Array de tareas
   * 
   * @example
   * const tasks = TaskFactory.createBulk(5, { priority: 'high' });
   */
  static createBulk(count: number, overrides?: Partial<CreateTaskRequest>): CreateTaskRequest[] {
    return Array.from({ length: count }, (_, index) => 
      this.createUnique({
        ...overrides,
        title: `${this.TITLE_PREFIX} ${this.getTimestamp()}-${index}`
      })
    );
  }

  /**
   * Crea una tarea para cada prioridad
   * Útil para tests de filtrado por prioridad
   * 
   * @param overrides - Campos adicionales
   * @returns Objeto con una tarea por prioridad
   * 
   * @example
   * const tasks = TaskFactory.createForAllPriorities();
   * // { low: {...}, medium: {...}, high: {...} }
   */
  static createForAllPriorities(overrides?: Partial<CreateTaskRequest>): Record<TaskPriority, CreateTaskRequest> {
    return {
      low: this.createLowPriority(overrides),
      medium: this.createUnique(overrides),
      high: this.createHighPriority(overrides)
    };
  }

  /**
   * Crea una tarea para cada estado
   * Útil para tests de flujo de trabajo
   * 
   * @param overrides - Campos adicionales
   * @returns Objeto con una tarea por estado
   */
  static createForAllStatuses(overrides?: Partial<CreateTaskRequest>): Record<TaskStatus, CreateTaskRequest> {
    return {
      'todo': this.createWithStatus('todo', overrides),
      'in-progress': this.createWithStatus('in-progress', overrides),
      'done': this.createWithStatus('done', overrides)
    };
  }

  /**
   * Crea una tarea con fecha de vencimiento específica
   * 
   * @param daysFromNow - Días desde hoy (negativo para fechas pasadas)
   * @param overrides - Campos adicionales
   * @returns Tarea con fecha específica
   * 
   * @example
   * // Tarea vencida
   * const overdueTask = TaskFactory.createWithDueDate(-5);
   * 
   * // Tarea para mañana
   * const tomorrowTask = TaskFactory.createWithDueDate(1);
   */
  static createWithDueDate(daysFromNow: number, overrides?: Partial<CreateTaskRequest>): CreateTaskRequest {
    return this.createUnique({
      dueDate: this.getFutureDate(daysFromNow),
      ...overrides
    });
  }

  /**
   * Crea una tarea con tags específicos
   * 
   * @param tags - Array de tags
   * @param overrides - Campos adicionales
   * @returns Tarea con tags personalizados
   * 
   * @example
   * const task = TaskFactory.createWithTags(['frontend', 'bug', 'urgent']);
   */
  static createWithTags(tags: string[], overrides?: Partial<CreateTaskRequest>): CreateTaskRequest {
    return this.createUnique({
      tags,
      ...overrides
    });
  }

  /**
   * Crea una tarea mínima (solo campos requeridos)
   * Útil para tests de validación
   * 
   * @returns Tarea con datos mínimos
   */
  static createMinimal(): CreateTaskRequest {
    return {
      title: `Minimal Task ${this.getTimestamp()}`
    };
  }

  /**
   * Crea una tarea con título inválido (vacío)
   * Útil para tests de validación negativa
   * 
   * @returns Tarea con título inválido
   */
  static createWithInvalidTitle(): CreateTaskRequest {
    return {
      title: '',
      description: 'Task with empty title for validation test'
    };
  }
}

