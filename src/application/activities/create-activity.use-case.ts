/**
 * Create Activity Use Case
 */

import type { ActivityRepository } from "@/domain/activity/activity.repository";
import type { Activity, CreateActivityData } from "@/domain/activity/activity.types";
import { ValidationError } from "@/application/errors";

export class CreateActivityUseCase {
  constructor(private activityRepository: ActivityRepository) {}

  async execute(data: CreateActivityData): Promise<Activity> {
    // Validate
    if (!data.title?.trim()) {
      throw new ValidationError("יש להזין כותרת לפעילות");
    }

    if (!data.activityType) {
      throw new ValidationError("יש לבחור סוג פעילות");
    }

    if (!data.activityDate) {
      throw new ValidationError("יש להזין תאריך פעילות");
    }

    // Create
    return this.activityRepository.create({
      ...data,
      title: data.title.trim(),
      description: data.description?.trim() || null,
    });
  }
}
