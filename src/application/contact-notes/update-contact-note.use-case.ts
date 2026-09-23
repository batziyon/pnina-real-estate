/**
 * Update Contact Note Use Case
 *
 * Application layer — update a contact note's content.
 * Only the author or ADMIN can update a note.
 */

import type { ContactNoteRepository } from "@/domain/contact-note/contact-note.repository";
import type { ContactNoteData, UpdateContactNoteInput } from "@/domain/contact-note/contact-note.types";
import type { UserRole } from "@/domain/user/user.types";
import { EntityNotFoundError, UnauthorizedError } from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class UpdateContactNoteUseCase {
  constructor(
    private readonly contactNoteRepository: ContactNoteRepository
  ) {}

  async execute(noteId: string, input: UpdateContactNoteInput, actor: Actor): Promise<ContactNoteData> {
    // Verify note exists
    const note = await this.contactNoteRepository.findById(noteId);
    if (!note) {
      throw new EntityNotFoundError("ContactNote", noteId);
    }

    // Authorization: Only the author or ADMIN can update
    if (actor.role !== "ADMIN" && note.authorId !== actor.id) {
      throw new UnauthorizedError("רק המחבר או מנהל מורשים לערוך הערה זו");
    }

    // Update note
    const updated = await this.contactNoteRepository.update(noteId, input);

    return updated;
  }
}
