/**
 * Delete Activity Use Case
 */

import type { ActivityRepository } from "@/domain/activity/activity.repository";
import { EntityNotFoundError } from "@/application/errors";

export class DeleteActivityUseCase {
  constructor(private activityRepository: ActivityRepository) {}

  async execute(id: string): Promise<void> {
    // Check exists
    const existing = await this.activityRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError("Activity", id);
    }

    // Delete
    await this.activityRepository.delete(id);
  }
}
