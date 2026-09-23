/**
 * Create Contact Note Use Case
 *
 * Application layer — create a new note for a contact.
 */

import type { ContactNoteRepository } from "@/domain/contact-note/contact-note.repository";
import type { ContactRepository } from "@/domain/contact/contact.repository";
import type { ContactNoteData, CreateContactNoteInput } from "@/domain/contact-note/contact-note.types";
import type { UserRole } from "@/domain/user/user.types";
import { EntityNotFoundError, UnauthorizedError } from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class CreateContactNoteUseCase {
  constructor(
    private readonly contactNoteRepository: ContactNoteRepository,
    private readonly contactRepository: ContactRepository
  ) {}

  async execute(input: CreateContactNoteInput, actor: Actor): Promise<ContactNoteData> {
    // Authorization: ADMIN and AGENT can create notes
    if (actor.role !== "ADMIN" && actor.role !== "AGENT") {
      throw new UnauthorizedError("רק מנהלים וסוכנים מורשים ליצור הערות");
    }

    // Verify contact exists
    const contact = await this.contactRepository.findById(input.contactId);
    if (!contact) {
      throw new EntityNotFoundError("Contact", input.contactId);
    }

    // AGENT: can only create notes for contacts they are assigned to
    if (actor.role === "AGENT" && contact.assignedAgentId !== actor.id) {
      throw new UnauthorizedError("אין לך הרשאה ליצור הערות עבור איש קשר זה");
    }

    // Create note
    const note = await this.contactNoteRepository.create({
      ...input,
      authorId: actor.id,
    });

    return note;
  }
}
