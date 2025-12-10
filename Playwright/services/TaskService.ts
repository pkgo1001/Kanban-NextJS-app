/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                         TASK SERVICE                                      ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Servicio para gestionar tareas en la API del tablero Kanban               ║
 * ║                                                                           ║
 * ║ FLUJO DE CREACIÓN DE TAREA:                                               ║
 * ║ ┌─────────────────────────────────────────────────────────────────────┐   ║
 * ║ │                                                                     │   ║
 * ║ │   Test                TaskService              API                  │   ║
 * ║ │    │                      │                     │                   │   ║
 * ║ │    │  create(data, token) │                     │                   │   ║
 * ║ │    │─────────────────────>│                     │                   │   ║
 * ║ │    │                      │  POST /tasks        │                   │   ║
 * ║ │    │                      │  + Bearer token     │                   │   ║
 * ║ │    │                      │────────────────────>│                   │   ║
 * ║ │    │                      │                     │ canCreateTask?    │   ║
 * ║ │    │                      │                     │ Validate data     │   ║
 * ║ │    │                      │                     │ Create task       │   ║
 * ║ │    │                      │                     │ Link assignee     │   ║
 * ║ │    │                      │                     │ Create tags       │   ║
 * ║ │    │                      │       { task }      │                   │   ║
 * ║ │    │                      │<────────────────────│                   │   ║
 * ║ │    │  ApiResponse<Task>   │                     │                   │   ║
 * ║ │    │<─────────────────────│                     │                   │   ║
 * ║ │                                                                     │   ║
 * ║ └─────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║ FLUJO DE CAMBIO DE ESTADO (DRAG & DROP):                                  ║
 * ║ ┌─────────────────────────────────────────────────────────────────────┐   ║
 * ║ │                                                                     │   ║
 * ║ │   Test                TaskService              API                  │   ║
 * ║ │    │                      │                     │                   │   ║
 * ║ │    │  updateStatus(       │                     │                   │   ║
 * ║ │    │    id, status, tkn)  │                     │                   │   ║
 * ║ │    │─────────────────────>│                     │                   │   ║
 * ║ │    │                      │ PATCH /tasks/{id}   │                   │   ║
 * ║ │    │                      │────────────────────>│                   │   ║
 * ║ │    │                      │                     │ canMoveTask?      │   ║
 * ║ │    │                      │                     │ Update status     │   ║
 * ║ │    │                      │   { updated task }  │                   │   ║
 * ║ │    │                      │<────────────────────│                   │   ║
 * ║ │    │  ApiResponse<Task>   │                     │                   │   ║
 * ║ │    │<─────────────────────│                     │                   │   ║
 * ║ │                                                                     │   ║
 * ║ └─────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║ CICLO DE VIDA DE UNA TAREA:                                               ║
 * ║                                                                           ║
 * ║   ┌────────┐     ┌──────────────┐     ┌────────┐     ┌──────────┐         ║
 * ║   │ CREATE │ ──> │     TODO     │ ──> │  IN    │ ──> │   DONE   │         ║
 * ║   └────────┘     │   (default)  │     │PROGRESS│     └────────┬─┘         ║
 * ║                  └──────────────┘     └────────┘              │           ║
 * ║                         ↑                 ↑                   │           ║
 * ║                         └────────────────────────────────────-┘           ║
 * ║                              (puede moverse en cualquier dirección)       ║
 * ║                                                                           ║
 * ║ Endpoints cubiertos:                                                      ║
 * ║ • GET    /api/tasks       - Listar todas las tareas (público)             ║
 * ║ • POST   /api/tasks       - Crear tarea (auth + canCreateTask)            ║
 * ║ • PUT    /api/tasks/{id}  - Actualizar tarea (auth + canEditTask)         ║
 * ║ • PATCH  /api/tasks/{id}  - Cambiar estado (auth + canMoveTask)           ║
 * ║ • DELETE /api/tasks/{id}  - Eliminar tarea (auth + canDeleteTask)         ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { APIRequestContext } from '@playwright/test';
import { getBaseURL } from '../config/test-config';
import { 
  ApiResponse,
  Task,
  TasksListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
  DeleteTaskResponse
} from '../models';

/**
 * Servicio de gestión de tareas para pruebas de API
 * Encapsula operaciones CRUD sobre tareas del tablero Kanban
 * 
 * @example
 * // Crear instancia
 * const taskService = new TaskService(request);
 * 
 * // Crear tarea
 * const task = await taskService.create({
 *   title: 'New Task',
 *   priority: 'high'
 * }, token);
 * 
 * // Mover a in-progress
 * await taskService.updateStatus(task.body.id, 'in-progress', token);
 */
export class TaskService {
  private request: APIRequestContext;
  private baseURL: string;

  /**
   * Constructor del servicio de tareas
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
   * Obtiene todas las tareas del sistema
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ ENDPOINT: GET /api/tasks                                              │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Headers:                                                              │
   * │   None required (public endpoint)                                     │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Success Response (200):                                               │
   * │   [                                                                   │
   * │     {                                                                 │
   * │       id, title, description, priority, status,                       │
   * │       assignee, assigneeId, ownerId, dueDate, tags                    │
   * │     },                                                                │
   * │     ...                                                               │
   * │   ]                                                                   │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Error Responses:                                                      │
   * │   500 - Internal server error                                         │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @returns Lista de todas las tareas
   * 
   * @example
   * const response = await taskService.getAll();
   * console.log(`Found ${response.body.length} tasks`);
   */
  async getAll(): Promise<ApiResponse<TasksListResponse>> {
    const response = await this.request.get(`${this.baseURL}/api/tasks`);

    return {
      status: response.status(),
      body: await response.json(),
      headers: response.headers()
    };
  }

  /**
   * Crea una nueva tarea
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ ENDPOINT: POST /api/tasks                                             │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Headers:                                                              │
   * │   Authorization: Bearer <token>                                       │
   * │   Content-Type: application/json                                      │
 * ├────────────────────────────────────────────────────────────────────────┤
 * │ Required Permission: canCreateTask (role check)                       │
 * │   ✓ ADMIN, SUPERVISOR                                                 │
 * │   ✗ EMPLOYEE, VIEWER                                                  │
 * ├────────────────────────────────────────────────────────────────────────┤
   * │ Request Body:                                                         │
   * │   {                                                                   │
   * │     title: string (required),                                         │
   * │     description?: string,                                             │
   * │     priority?: "low" | "medium" | "high" (default: medium),           │
   * │     status?: "todo" | "in-progress" | "done" (default: todo),         │
   * │     assignee?: string (nombre del asignado),                          │
   * │     dueDate?: string (YYYY-MM-DD),                                    │
   * │     tags?: string[]                                                   │
   * │   }                                                                   │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Success Response (200):                                               │
   * │   { id, title, description, priority, status, ... }                   │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Error Responses:                                                      │
   * │   401 - Authentication required                                       │
   * │   403 - You do not have permission to create tasks                    │
   * │   500 - Internal server error                                         │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @param taskData - Datos de la tarea a crear
   * @param token - Token de autenticación
   * @returns Tarea creada
   * 
   * @example
   * const response = await taskService.create({
   *   title: 'Implement feature X',
   *   description: 'Add new functionality',
   *   priority: 'high',
   *   assignee: 'Sarah Chen',
   *   tags: ['feature', 'sprint-1']
   * }, token);
   */
  async create(taskData: CreateTaskRequest, token: string): Promise<ApiResponse<Task>> {
    const response = await this.request.post(`${this.baseURL}/api/tasks`, {
      data: taskData,
      headers: this.getAuthHeaders(token)
    });

    return {
      status: response.status(),
      body: await response.json(),
      headers: response.headers()
    };
  }

  /**
   * Actualiza una tarea existente (actualización parcial o completa)
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ ENDPOINT: PUT /api/tasks/{id}                                         │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Path Parameters:                                                      │
   * │   id - ID de la tarea a actualizar                                    │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Required Permission:                                                  │
   * │   • Para cambios de status: canMoveTask                               │
   * │   • Para otros campos: canEditTask                                    │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Request Body (any subset of):                                         │
   * │   { title?, description?, priority?, status?, assignee?, dueDate?,    │
   * │     tags? }                                                           │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Success Response (200):                                               │
   * │   { id, title, ... } (tarea actualizada)                              │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Error Responses:                                                      │
   * │   401 - Authentication required                                       │
   * │   403 - Permission denied                                             │
   * │   404 - Task not found                                                │
   * │   500 - Internal server error                                         │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @param taskId - ID de la tarea
   * @param updateData - Campos a actualizar
   * @param token - Token de autenticación
   * @returns Tarea actualizada
   */
  async update(
    taskId: string, 
    updateData: UpdateTaskRequest, 
    token: string
  ): Promise<ApiResponse<Task>> {
    const response = await this.request.put(`${this.baseURL}/api/tasks/${taskId}`, {
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
   * Actualiza solo el estado de una tarea (usado por drag & drop)
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ ENDPOINT: PATCH /api/tasks/{id}                                       │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Path Parameters:                                                      │
   * │   id - ID de la tarea                                                 │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Required Permission: canMoveTask                                      │
   * │   ✓ ADMIN, SUPERVISOR - cualquier tarea                               │
   * │   ✓ EMPLOYEE - solo sus propias tareas                                │
   * │   ✗ VIEWER - ninguna                                                  │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Request Body:                                                         │
   * │   { status: "todo" | "in-progress" | "done" }                         │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Success Response (200):                                               │
   * │   { id, title, status, ... } (tarea con nuevo estado)                 │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Error Responses:                                                      │
   * │   401 - Authentication required                                       │
   * │   403 - Permission denied                                             │
   * │   404 - Task not found                                                │
   * │   500 - Internal server error                                         │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @param taskId - ID de la tarea
   * @param status - Nuevo estado
   * @param token - Token de autenticación
   * @returns Tarea actualizada
   * 
   * @example
   * // Mover tarea a "in-progress"
   * await taskService.updateStatus(taskId, 'in-progress', token);
   * 
   * // Marcar como completada
   * await taskService.updateStatus(taskId, 'done', token);
   */
  async updateStatus(
    taskId: string, 
    status: TaskStatus, 
    token: string
  ): Promise<ApiResponse<Task>> {
    const response = await this.request.patch(`${this.baseURL}/api/tasks/${taskId}`, {
      data: { status },
      headers: this.getAuthHeaders(token)
    });

    return {
      status: response.status(),
      body: await response.json(),
      headers: response.headers()
    };
  }

  /**
   * Elimina una tarea del sistema
   * 
   * ┌────────────────────────────────────────────────────────────────────────┐
   * │ ENDPOINT: DELETE /api/tasks/{id}                                      │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Path Parameters:                                                      │
   * │   id - ID de la tarea a eliminar                                      │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Required Permission: canDeleteTask                                    │
   * │   ✓ ADMIN - cualquier tarea                                           │
   * │   ✓ SUPERVISOR - tareas de su equipo                                  │
   * │   ✗ EMPLOYEE, VIEWER - ninguna                                        │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Success Response (200):                                               │
   * │   { success: true }                                                   │
   * ├────────────────────────────────────────────────────────────────────────┤
   * │ Error Responses:                                                      │
   * │   401 - Authentication required                                       │
   * │   403 - Permission denied                                             │
   * │   404 - Task not found                                                │
   * │   500 - Internal server error                                         │
   * └────────────────────────────────────────────────────────────────────────┘
   * 
   * @param taskId - ID de la tarea a eliminar
   * @param token - Token de autenticación
   * @returns Confirmación de eliminación
   */
  async delete(taskId: string, token: string): Promise<ApiResponse<DeleteTaskResponse>> {
    const response = await this.request.delete(`${this.baseURL}/api/tasks/${taskId}`, {
      headers: this.getAuthHeaders(token)
    });

    return {
      status: response.status(),
      body: await response.json(),
      headers: response.headers()
    };
  }

  /**
   * Busca tareas por título (búsqueda parcial)
   * Helper para facilitar búsquedas en tests
   * 
   * @param titleSubstring - Substring del título a buscar
   * @returns Array de tareas que coinciden
   * 
   * @example
   * const tasks = await taskService.findByTitle('Login');
   * console.log(`Found ${tasks.length} tasks with "Login" in title`);
   */
  async findByTitle(titleSubstring: string): Promise<Task[]> {
    const response = await this.getAll();
    if (response.status !== 200) return [];
    
    return response.body.filter(task => 
      task.title.toLowerCase().includes(titleSubstring.toLowerCase())
    );
  }

  /**
   * Busca tareas asignadas a una persona
   * 
   * @param assigneeName - Nombre del asignado
   * @returns Array de tareas asignadas
   */
  async findByAssignee(assigneeName: string): Promise<Task[]> {
    const response = await this.getAll();
    if (response.status !== 200) return [];
    
    return response.body.filter(task => 
      task.assignee?.toLowerCase() === assigneeName.toLowerCase()
    );
  }

  /**
   * Obtiene tareas filtradas por estado
   * 
   * @param status - Estado de las tareas a obtener
   * @returns Array de tareas en ese estado
   */
  async getByStatus(status: TaskStatus): Promise<Task[]> {
    const response = await this.getAll();
    if (response.status !== 200) return [];
    
    return response.body.filter(task => task.status === status);
  }

  /**
   * Verifica si una tarea existe
   * 
   * @param taskId - ID de la tarea
   * @returns true si existe, false si no
   */
  async exists(taskId: string): Promise<boolean> {
    const response = await this.getAll();
    if (response.status !== 200) return false;
    
    return response.body.some(task => task.id === taskId);
  }
}

