/**
 * Activity Repository Interface
 */

import type {
  Activity,
  ActivityWithRecorder,
  CreateActivityData,
  UpdateActivityData,
  ActivityFilters,
} from "./activity.types";

export interface ActivityRepository {
  create(data: CreateActivityData): Promise<Activity>;
  findById(id: string): Promise<ActivityWithRecorder | null>;
  findByContact(
    contactId: string,
    limit?: number
  ): Promise<ActivityWithRecorder[]>;
  list(filters: ActivityFilters): Promise<ActivityWithRecorder[]>;
  update(id: string, data: UpdateActivityData): Promise<Activity>;
  delete(id: string): Promise<void>;
}
