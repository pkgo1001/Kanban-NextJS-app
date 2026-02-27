/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                           TASK MODEL DEFINITIONS                          ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Este archivo contiene las definiciones de tipos para tareas en la API     ║
 * ║                                                                           ║
 * ║ Ciclo de vida de una tarea:                                               ║
 * ║ ┌─────────┐    ┌─────────────┐    ┌──────────┐                           ║
 * ║ │  TODO   │ →  │ IN-PROGRESS │ →  │   DONE   │                           ║
 * ║ └─────────┘    └─────────────┘    └──────────┘                           ║
 * ║                                                                           ║
 * ║ Permisos por rol:                                                         ║
 * ║ ┌─────────────┬────────┬────────┬────────┬────────┐                      ║
 * ║ │ Acción      │ Admin  │ Supv   │ Emp    │ Viewer │                      ║
 * ║ ├─────────────┼────────┼────────┼────────┼────────┤                      ║
 * ║ │ Create      │   ✓    │   ✓    │   ✓    │   ✗    │                      ║
 * ║ │ Edit (own)  │   ✓    │   ✓    │   ✓    │   ✗    │                      ║
 * ║ │ Edit (all)  │   ✓    │   ✓    │   ✗    │   ✗    │                      ║
 * ║ │ Delete      │   ✓    │   ✓    │   ✗    │   ✗    │                      ║
 * ║ │ Move        │   ✓    │   ✓    │   ✓    │   ✗    │                      ║
 * ║ └─────────────┴────────┴────────┴────────┴────────┘                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * Niveles de prioridad disponibles para tareas
 * - low: Baja prioridad (puede esperar)
 * - medium: Prioridad normal (completar en tiempo razonable)
 * - high: Alta prioridad (requiere atención inmediata)
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * Estados posibles de una tarea en el tablero Kanban
 * - todo: Pendiente (columna izquierda)
 * - in-progress: En progreso (columna central)
 * - done: Completada (columna derecha)
 */
export type TaskStatus = 'todo' | 'in-progress' | 'done';

/**
 * Datos requeridos para crear una nueva tarea
 * 
 * @example
 * const newTask: CreateTaskRequest = {
 *   title: 'Implementar login',
 *   description: 'Crear formulario de autenticación',
 *   priority: 'high',
 *   assignee: 'Sarah Chen',
 *   dueDate: '2025-12-31',
 *   tags: ['frontend', 'auth']
 * };
 */
export interface CreateTaskRequest {
  /** Título de la tarea (requerido) */
  title: string;
  /** Descripción detallada (opcional) */
  description?: string;
  /** Nivel de prioridad (default: medium) */
  priority?: TaskPriority;
  /** Estado inicial (default: todo) */
  status?: TaskStatus;
  /** Nombre del asignado (debe existir como Assignee) */
  assignee?: string;
  /** Fecha de vencimiento formato YYYY-MM-DD */
  dueDate?: string;
  /** Etiquetas para categorización */
  tags?: string[];
}

/**
 * Datos para actualizar una tarea existente
 * Todos los campos son opcionales - solo se actualizan los enviados
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
}

/**
 * Estructura completa de una tarea retornada por la API
 * 
 * @example
 * // Respuesta típica de GET /api/tasks/{id}
 * {
 *   id: "clx123...",
 *   title: "Implementar login",
 *   description: "Crear formulario de autenticación",
 *   priority: "high",
 *   status: "in-progress",
 *   assignee: "Sarah Chen",
 *   assigneeId: "clx456...",
 *   ownerId: "clx789...",
 *   dueDate: "2025-12-31",
 *   tags: ["frontend", "auth"]
 * }
 */
export interface Task {
  /** ID único de la tarea (CUID) */
  id: string;
  /** Título de la tarea */
  title: string;
  /** Descripción detallada */
  description?: string;
  /** Nivel de prioridad */
  priority: TaskPriority;
  /** Estado actual en el tablero */
  status: TaskStatus;
  /** Nombre del asignado */
  assignee?: string;
  /** ID del Assignee asociado */
  assigneeId?: string | null;
  /** ID del usuario propietario de la tarea */
  ownerId?: string | null;
  /** Fecha de vencimiento */
  dueDate?: string;
  /** Lista de etiquetas */
  tags: string[];
}

/**
 * Payload para cambio de estado (drag & drop)
 * Usado por PATCH /api/tasks/{id}
 */
export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

/**
 * Respuesta exitosa al eliminar una tarea
 */
export interface DeleteTaskResponse {
  success: boolean;
}

