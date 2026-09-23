/**
 * Task Repository Interface
 */

import type {
  Task,
  TaskWithRelations,
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
} from "./task.types";

export interface TaskRepository {
  create(data: CreateTaskData): Promise<Task>;
  findById(id: string): Promise<TaskWithRelations | null>;
  findByContact(contactId: string): Promise<TaskWithRelations[]>;
  findByAssignee(assignedToId: string): Promise<TaskWithRelations[]>;
  list(filters: TaskFilters): Promise<TaskWithRelations[]>;
  update(id: string, data: UpdateTaskData): Promise<Task>;
  complete(id: string): Promise<Task>;
  delete(id: string): Promise<void>;
}
