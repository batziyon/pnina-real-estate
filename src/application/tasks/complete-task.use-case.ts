/**
 * Complete Task Use Case
 */

import type { TaskRepository } from "@/domain/task/task.repository";
import type { Task } from "@/domain/task/task.types";
import { EntityNotFoundError } from "@/application/errors";

export class CompleteTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(id: string): Promise<Task> {
    // Check exists
    const existing = await this.taskRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError("Task", id);
    }

    // Complete
    return this.taskRepository.complete(id);
  }
}
