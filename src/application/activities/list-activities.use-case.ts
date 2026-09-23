/**
 * List Activities Use Case
 */

import type { ActivityRepository } from "@/domain/activity/activity.repository";
import type {
  ActivityWithRecorder,
  ActivityFilters,
} from "@/domain/activity/activity.types";

export class ListActivitiesUseCase {
  constructor(private activityRepository: ActivityRepository) {}

  async execute(filters: ActivityFilters): Promise<ActivityWithRecorder[]> {
    return this.activityRepository.list(filters);
  }

  async executeByContact(contactId: string, limit?: number): Promise<ActivityWithRecorder[]> {
    return this.activityRepository.findByContact(contactId, limit);
  }
}
