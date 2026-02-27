/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                          MODELS INDEX EXPORT                              ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Punto de entrada centralizado para todos los modelos/tipos                ║
 * ║                                                                           ║
 * ║ Uso:                                                                      ║
 * ║ import { User, Task, ApiResponse } from '../models';                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

// User related types
export {
  UserRole,
  CreateUserRequest,
  UpdateUserRequest,
  User,
  LoginCredentials,
  AuthenticatedUser,
  TestUserConfig
} from './User';

// Task related types
export {
  TaskPriority,
  TaskStatus,
  CreateTaskRequest,
  UpdateTaskRequest,
  Task,
  UpdateTaskStatusRequest,
  DeleteTaskResponse as TaskDeleteResponse
} from './Task';

// API Response types
export {
  ApiResponse,
  LoginSuccessResponse,
  RegisterSuccessResponse,
  UsersListResponse,
  VerifyEmailResponse,
  DeleteUserResponse,
  ResetPasswordResponse,
  TasksListResponse,
  DeleteTaskResponse,
  ValidationError,
  ValidationErrorResponse,
  ErrorResponse,
  MessageErrorResponse,
  ApiResult,
  AuthHeaders,
  BasicHeaders
} from './ApiResponse';

