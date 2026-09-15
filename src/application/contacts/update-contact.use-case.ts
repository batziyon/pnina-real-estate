import type { ContactRepository } from "@/domain/contact/contact.repository";
import type { UserRepository } from "@/domain/user/user.repository";
import type { ContactData } from "@/domain/contact/contact.types";
import type { UserRole } from "@/domain/user/user.types";
import { UpdateContactSchema } from "@/validations/contact.schema";
import {
  EntityNotFoundError,
  ValidationError,
  UnauthorizedError,
  BusinessRuleError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class UpdateContactUseCase {
  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    id: string,
    rawInput: unknown,
    actor: Actor
  ): Promise<ContactData> {
    // 1. Authorization check
    if (actor.role === "EDITOR") {
      throw new UnauthorizedError(
        "You are not authorized to update contacts."
      );
    }

    // 2. Fetch existing contact
    const existing = await this.contactRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError("Contact", id);
    }

    // 3. Resource-level authorization
    if (actor.role === "AGENT") {
      // Agent can only update contacts assigned to them
      if (existing.assignedAgentId !== actor.id) {
        throw new UnauthorizedError(
          "You can only update contacts assigned to you."
        );
      }
    }
    // ADMIN can update any contact

    // 4. Schema validation
    const parsed = UpdateContactSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
          k,
          v?.[0] ?? "Invalid",
        ])
      );
      throw new ValidationError("Invalid contact input.", fields);
    }

    const input = parsed.data;

    // 5. Handle assignedAgentId updates (server-controlled)
    let finalAssignedAgentId = existing.assignedAgentId;

    if (input.assignedAgentId !== undefined) {
      if (actor.role === "ADMIN") {
        // ADMIN can reassign to any active AGENT or set to null
        if (input.assignedAgentId === null) {
          finalAssignedAgentId = null;
        } else {
          const agent = await this.userRepository.findById(
            input.assignedAgentId
          );

          if (!agent) {
            throw new ValidationError("סוכן לא נמצא.");
          }

          if (!agent.active) {
            throw new BusinessRuleError(
              "לא ניתן להקצות איש קשר לסוכן לא פעיל."
            );
          }

          if (agent.role !== "AGENT") {
            throw new BusinessRuleError(
              "ניתן להקצות איש קשר רק למשתמשים בתפקיד סוכן."
            );
          }

          finalAssignedAgentId = input.assignedAgentId;
        }
      } else if (actor.role === "AGENT") {
        // AGENT cannot transfer contact to another agent
        if (input.assignedAgentId !== actor.id) {
          throw new UnauthorizedError(
            "You cannot transfer contacts to another agent."
          );
        }
        // If trying to set to themselves, that's fine (no-op)
        finalAssignedAgentId = actor.id;
      }
    }

    // 6. Update contact
    return this.contactRepository.update(id, {
      name: input.name,
      phone: input.phone,
      email: input.email,
      notes: input.notes,
      assignedAgentId: finalAssignedAgentId,
    });
  }
}
