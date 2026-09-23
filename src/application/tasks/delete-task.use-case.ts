/**
 * Delete Task Use Case
 */

import type { TaskRepository } from "@/domain/task/task.repository";
import { EntityNotFoundError } from "@/application/errors";

export class DeleteTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(id: string): Promise<void> {
    // Check exists
    const existing = await this.taskRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError("Task", id);
    }

    // Delete
    await this.taskRepository.delete(id);
  }
}
