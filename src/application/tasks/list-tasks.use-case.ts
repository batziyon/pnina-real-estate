/**
 * List Tasks Use Case
 */

import type { TaskRepository } from "@/domain/task/task.repository";
import type { TaskWithRelations, TaskFilters } from "@/domain/task/task.types";

export class ListTasksUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(filters: TaskFilters): Promise<TaskWithRelations[]> {
    return this.taskRepository.list(filters);
  }

  async executeByContact(contactId: string): Promise<TaskWithRelations[]> {
    return this.taskRepository.findByContact(contactId);
  }

  async executeByAssignee(assignedToId: string): Promise<TaskWithRelations[]> {
    return this.taskRepository.findByAssignee(assignedToId);
  }
}
