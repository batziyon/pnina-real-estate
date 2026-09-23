/**
 * Create Task Use Case
 */

import type { TaskRepository } from "@/domain/task/task.repository";
import type { Task, CreateTaskData } from "@/domain/task/task.types";
import { ValidationError } from "@/application/errors";

export class CreateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(data: CreateTaskData): Promise<Task> {
    // Validate
    if (!data.title?.trim()) {
      throw new ValidationError("יש להזין כותרת למשימה");
    }

    if (!data.assignedToId) {
      throw new ValidationError("יש לשייך את המשימה למשתמש");
    }

    if (!data.createdById) {
      throw new ValidationError("חסר מזהה יוצר המשימה");
    }

    // Create
    return this.taskRepository.create({
      ...data,
      title: data.title.trim(),
      description: data.description?.trim() || null,
    });
  }
}
