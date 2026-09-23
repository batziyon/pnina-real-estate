/**
 * List Contact Notes Use Case
 *
 * Application layer — list notes for a contact with authorization.
 */

import type { ContactNoteRepository } from "@/domain/contact-note/contact-note.repository";
import type { ContactRepository } from "@/domain/contact/contact.repository";
import type { ContactNoteData } from "@/domain/contact-note/contact-note.types";
import type { UserRole } from "@/domain/user/user.types";
import { EntityNotFoundError, UnauthorizedError } from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class ListContactNotesUseCase {
  constructor(
    private readonly contactNoteRepository: ContactNoteRepository,
    private readonly contactRepository: ContactRepository
  ) {}

  async execute(contactId: string, actor: Actor): Promise<ContactNoteData[]> {
    // Verify contact exists
    const contact = await this.contactRepository.findById(contactId);
    if (!contact) {
      throw new EntityNotFoundError("Contact", contactId);
    }

    // Authorization: ADMIN and AGENT can view notes
    if (actor.role !== "ADMIN" && actor.role !== "AGENT") {
      throw new UnauthorizedError("אין לך הרשאה לצפות בהערות");
    }

    // AGENT: can only view notes for contacts they are assigned to
    if (actor.role === "AGENT" && contact.assignedAgentId !== actor.id) {
      throw new UnauthorizedError("אין לך הרשאה לצפות בהערות עבור איש קשר זה");
    }

    // Fetch notes
    const notes = await this.contactNoteRepository.findByContactId(contactId);

    return notes;
  }
}
