/**
 * Update Activity Use Case
 */

import type { ActivityRepository } from "@/domain/activity/activity.repository";
import type { Activity, UpdateActivityData } from "@/domain/activity/activity.types";
import { ValidationError, EntityNotFoundError } from "@/application/errors";

export class UpdateActivityUseCase {
  constructor(private activityRepository: ActivityRepository) {}

  async execute(id: string, data: UpdateActivityData): Promise<Activity> {
    // Check exists
    const existing = await this.activityRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError("Activity", id);
    }

    // Validate
    if (data.title !== undefined && !data.title?.trim()) {
      throw new ValidationError("יש להזין כותרת לפעילות");
    }

    // Update
    const updateData = { ...data };
    if (data.title) {
      updateData.title = data.title.trim();
    }
    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }

    return this.activityRepository.update(id, updateData);
  }
}
