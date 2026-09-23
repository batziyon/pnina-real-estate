/**
 * Task Domain Types
 * CRM tasks/todos for agents.
 */

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: string;
  contactId: string | null;
  propertyId: string | null;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToId: string;
  createdById: string;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskData {
  contactId?: string | null;
  propertyId?: string | null;
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  priority?: TaskPriority;
  assignedToId: string;
  createdById: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  dueDate?: Date | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedToId?: string;
}

export interface TaskFilters {
  contactId?: string;
  propertyId?: string;
  assignedToId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  overdue?: boolean;
}

export interface TaskWithRelations extends Task {
  assignedTo: {
    id: string;
    name: string;
    email: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  contact?: {
    id: string;
    name: string;
  } | null;
  property?: {
    id: string;
    title: string;
  } | null;
}
