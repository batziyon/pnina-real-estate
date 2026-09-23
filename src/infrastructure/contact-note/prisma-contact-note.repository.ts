import { prisma } from '@/lib/prisma';
import {
  ContactNoteRepository,
} from '@/domain/contact-note/contact-note.repository';
import type {
  ContactNoteData,
  CreateContactNoteRepositoryInput,
  UpdateContactNoteInput,
  ContactNoteFilters,
} from '@/domain/contact-note/contact-note.types';

export class PrismaContactNoteRepository implements ContactNoteRepository {
  private toContactNoteData(note: any): ContactNoteData {
    return {
      id: note.id,
      contactId: note.contactId,
      propertyId: note.propertyId,
      content: note.content,
      authorId: note.authorId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  async create(input: CreateContactNoteRepositoryInput): Promise<ContactNoteData> {
    const note = await prisma.contactNote.create({
      data: {
        contactId: input.contactId,
        propertyId: input.propertyId,
        content: input.content,
        authorId: input.authorId,
      },
    });

    return this.toContactNoteData(note);
  }

  async findById(id: string): Promise<ContactNoteData | null> {
    const note = await prisma.contactNote.findUnique({
      where: { id },
    });

    return note ? this.toContactNoteData(note) : null;
  }

  async findMany(filters: ContactNoteFilters): Promise<ContactNoteData[]> {
    const notes = await prisma.contactNote.findMany({
      where: {
        contactId: filters.contactId,
        propertyId: filters.propertyId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return notes.map((note) => this.toContactNoteData(note));
  }

  async findByContactId(contactId: string): Promise<ContactNoteData[]> {
    const notes = await prisma.contactNote.findMany({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
    });

    return notes.map((note) => this.toContactNoteData(note));
  }

  async findByPropertyId(propertyId: string): Promise<ContactNoteData[]> {
    const notes = await prisma.contactNote.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
    });

    return notes.map((note) => this.toContactNoteData(note));
  }

  async update(
    id: string,
    input: UpdateContactNoteInput
  ): Promise<ContactNoteData> {
    const note = await prisma.contactNote.update({
      where: { id },
      data: {
        content: input.content,
      },
    });

    return this.toContactNoteData(note);
  }

  async delete(id: string): Promise<void> {
    await prisma.contactNote.delete({
      where: { id },
    });
  }

  async countByContactId(contactId: string): Promise<number> {
    return prisma.contactNote.count({
      where: { contactId },
    });
  }
}
