/**
 * Activity Domain Types
 * Manual CRM activities recorded by agents.
 */

export type ActivityType =
  | "PHONE_CALL"
  | "MEETING"
  | "EMAIL_SENT"
  | "PROPERTY_SENT"
  | "FOLLOW_UP"
  | "OTHER";

export interface Activity {
  id: string;
  contactId: string;
  activityType: ActivityType;
  title: string;
  description: string | null;
  activityDate: Date;
  recordedById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateActivityData {
  contactId: string;
  activityType: ActivityType;
  title: string;
  description?: string | null;
  activityDate: Date;
  recordedById: string;
}

export interface UpdateActivityData {
  activityType?: ActivityType;
  title?: string;
  description?: string | null;
  activityDate?: Date;
}

export interface ActivityFilters {
  contactId?: string;
  activityType?: ActivityType;
  fromDate?: Date;
  toDate?: Date;
}

export interface ActivityWithRecorder extends Activity {
  recordedBy: {
    id: string;
    name: string;
    email: string;
  };
}
