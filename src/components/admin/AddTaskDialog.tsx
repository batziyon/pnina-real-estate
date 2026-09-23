"use client";

/**
 * Add Task Dialog
 * Dialog for creating a new task
 */

import { useState, useEffect } from "react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string;
  status: string;
  completedAt: string | null;
  assignedToId: string | null;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  };
  contactId: string;
  createdAt: string;
  updatedAt: string;
}

interface AddTaskDialogProps {
  contactId: string;
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: (task: Task) => void;
}

type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const priorityOptions: Array<{ value: TaskPriority; label: string }> = [
  { value: "LOW", label: "נמוכה" },
  { value: "MEDIUM", label: "רגילה" },
  { value: "HIGH", label: "גבוהה" },
  { value: "URGENT", label: "דחופה" },
];

interface Agent {
  id: string;
  name: string;
  email: string;
}

export function AddTaskDialog({
  contactId,
  isOpen,
  onClose,
  onTaskAdded,
}: AddTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM" as TaskPriority,
    assignedToId: "",
  });

  const loadAgents = async () => {
    setLoadingAgents(true);
    try {
      const response = await fetch("/api/admin/users?role=AGENT&pageSize=100");
      if (response.ok) {
        const data = await response.json();
        setAgents(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load agents:", err);
    } finally {
      setLoadingAgents(false);
    }
  };

  // Load agents when dialog opens
  useEffect(() => {
    if (isOpen && agents.length === 0) {
      loadAgents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/contacts/${contactId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          priority: formData.priority,
          assignedToId: formData.assignedToId || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "שגיאה בשמירת המשימה");
      }

      const newTask = await response.json();
      onTaskAdded(newTask);

      // Reset form
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: "MEDIUM",
        assignedToId: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשמירת המשימה");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">הוספת משימה</h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              מה צריך לעשות? <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="כותרת המשימה"
              disabled={isSubmitting}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              תיאור
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="פרטים נוספים"
              disabled={isSubmitting}
            />
          </div>

          {/* Due Date */}
          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              תאריך יעד
            </label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              עדיפות
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value as TaskPriority })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned To */}
          <div>
            <label
              htmlFor="assignedToId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              מטפל
            </label>
            {loadingAgents ? (
              <div className="text-sm text-gray-500">טוען...</div>
            ) : (
              <select
                id="assignedToId"
                value={formData.assignedToId}
                onChange={(e) =>
                  setFormData({ ...formData, assignedToId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              >
                <option value="">בחר סוכן</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "שומר..." : "צור משימה"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
