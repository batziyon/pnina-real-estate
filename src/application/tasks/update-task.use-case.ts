/**
 * Update Task Use Case
 */

import type { TaskRepository } from "@/domain/task/task.repository";
import type { Task, UpdateTaskData } from "@/domain/task/task.types";
import { ValidationError, EntityNotFoundError } from "@/application/errors";

export class UpdateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(id: string, data: UpdateTaskData): Promise<Task> {
    // Check exists
    const existing = await this.taskRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError("Task", id);
    }

    // Validate
    if (data.title !== undefined && !data.title?.trim()) {
      throw new ValidationError("יש להזין כותרת למשימה");
    }

    // Update
    const updateData = { ...data };
    if (data.title) {
      updateData.title = data.title.trim();
    }
    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }

    return this.taskRepository.update(id, updateData);
  }
}
