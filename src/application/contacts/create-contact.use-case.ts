import type { ContactRepository } from "@/domain/contact/contact.repository";
import type { UserRepository } from "@/domain/user/user.repository";
import type { ContactData } from "@/domain/contact/contact.types";
import type { UserRole } from "@/domain/user/user.types";
import { CreateContactSchema } from "@/validations/contact.schema";
import {
  ValidationError,
  UnauthorizedError,
  BusinessRuleError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class CreateContactUseCase {
  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(rawInput: unknown, actor: Actor): Promise<ContactData> {
    // 1. Authorization check
    if (actor.role === "EDITOR") {
      throw new UnauthorizedError(
        "You are not authorized to create contacts."
      );
    }

    // 2. Schema validation
    const parsed = CreateContactSchema.safeParse(rawInput);
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

    // 3. Determine assignedAgentId based on actor role (server-controlled)
    let assignedAgentId: string | null = null;

    if (actor.role === "ADMIN") {
      // ADMIN can assign to any active AGENT
      if (input.assignedAgentId) {
        const agent = await this.userRepository.findById(input.assignedAgentId);

        if (!agent) {
          throw new ValidationError("סוכן לא נמצא.");
        }

        if (!agent.active) {
          throw new BusinessRuleError("לא ניתן להקצות איש קשר לסוכן לא פעיל.");
        }

        if (agent.role !== "AGENT") {
          throw new BusinessRuleError(
            "ניתן להקצות איש קשר רק למשתמשים בתפקיד סוכן."
          );
        }

        assignedAgentId = input.assignedAgentId;
      }
      // If no assignedAgentId provided, leave as null
    } else if (actor.role === "AGENT") {
      // AGENT creates contacts assigned to themselves (ignore client input)
      assignedAgentId = actor.id;
    }

    // 4. Create contact
    return this.contactRepository.create({
      name: input.name,
      phone: input.phone ?? undefined,
      email: input.email ?? undefined,
      notes: input.notes ?? undefined,
      assignedAgentId: assignedAgentId ?? undefined,
    });
  }
}
