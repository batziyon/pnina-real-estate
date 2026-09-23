"use client";

import { useState } from "react";
import { ContactNoteData } from "@/domain/contact-note/contact-note.types";

interface ContactNotesSectionProps {
  contactId: string;
  notes: ContactNoteData[];
  onNoteCreated?: () => void;
}

export function ContactNotesSection({
  contactId,
  notes: initialNotes,
  onNoteCreated,
}: ContactNotesSectionProps) {
  const [notes, setNotes] = useState<ContactNoteData[]>(initialNotes);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to create note");

      const { data } = await response.json();
      setNotes([data, ...notes]);
      setContent("");
      onNoteCreated?.();
    } catch (error) {
      console.error("Error creating note:", error);
      alert("שגיאה ביצירת הערה");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (noteId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(
        `/api/admin/contacts/${contactId}/notes/${noteId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editContent }),
        }
      );

      if (!response.ok) throw new Error("Failed to update note");

      const { data } = await response.json();
      setNotes(notes.map((n) => (n.id === noteId ? data : n)));
      setEditingNoteId(null);
      setEditContent("");
    } catch (error) {
      console.error("Error updating note:", error);
      alert("שגיאה בעדכון הערה");
    }
  };

  const startEdit = (note: ContactNoteData) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditContent("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">הערות</h3>

        {/* Create Note Form */}
        <form onSubmit={handleCreate} className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="הוסף הערה חדשה..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
            rows={3}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "שומר..." : "הוסף הערה"}
          </button>
        </form>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-sm">אין הערות עדיין</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-3 bg-gray-50 rounded-md border">
              {editingNoteId === note.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                    rows={3}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(note.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      שמור
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {new Date(note.createdAt).toLocaleDateString("he-IL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <button
                      onClick={() => startEdit(note)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ערוך
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
