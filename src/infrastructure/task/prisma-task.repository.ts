/**
 * Prisma Task Repository
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { TaskRepository } from "@/domain/task/task.repository";
import type {
  Task,
  TaskWithRelations,
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
} from "@/domain/task/task.types";

export class PrismaTaskRepository implements TaskRepository {
  async create(data: CreateTaskData): Promise<Task> {
    return prisma.task.create({
      data: {
        contactId: data.contactId ?? null,
        propertyId: data.propertyId ?? null,
        title: data.title,
        description: data.description ?? null,
        dueDate: data.dueDate ?? null,
        priority: data.priority ?? "MEDIUM",
        assignedToId: data.assignedToId,
        createdById: data.createdById,
      },
    });
  }

  async findById(id: string): Promise<TaskWithRelations | null> {
    return prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findByContact(contactId: string): Promise<TaskWithRelations[]> {
    return prisma.task.findMany({
      where: { contactId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    });
  }

  async findByAssignee(assignedToId: string): Promise<TaskWithRelations[]> {
    return prisma.task.findMany({
      where: { assignedToId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    });
  }

  async list(filters: TaskFilters): Promise<TaskWithRelations[]> {
    const where: Record<string, unknown> = {};

    if (filters.contactId) {
      where.contactId = filters.contactId;
    }

    if (filters.propertyId) {
      where.propertyId = filters.propertyId;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.overdue) {
      where.dueDate = {
        lt: new Date(),
      };
      where.status = {
        in: ["TODO", "IN_PROGRESS"],
      };
    }

    return prisma.task.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    });
  }

  async update(id: string, data: UpdateTaskData): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,
        status: data.status,
        assignedToId: data.assignedToId,
      },
    });
  }

  async complete(id: string): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.task.delete({
      where: { id },
    });
  }
}
