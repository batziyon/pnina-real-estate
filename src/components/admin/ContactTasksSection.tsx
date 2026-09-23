"use client";

/**
 * Contact Tasks Section
 * Displays tasks and allows creating/managing them
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddTaskDialog } from "./AddTaskDialog";

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string;
  status: string;
  completedAt: string | null;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface ContactTasksSectionProps {
  contactId: string;
  initialTasks: Task[];
}

const statusLabels: Record<string, string> = {
  TODO: "לביצוע",
  IN_PROGRESS: "בטיפול",
  COMPLETED: "הושלמה",
  CANCELLED: "בוטלה",
};

const priorityLabels: Record<string, string> = {
  LOW: "נמוכה",
  MEDIUM: "רגילה",
  HIGH: "גבוהה",
  URGENT: "דחופה",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

export function ContactTasksSection({
  contactId,
  initialTasks,
}: ContactTasksSectionProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const handleTaskAdded = (newTask: Task) => {
    setTasks([newTask, ...tasks]);
    setIsDialogOpen(false);
    router.refresh();
  };

  const handleCompleteTask = async (taskId: string) => {
    setCompletingTaskId(taskId);
    try {
      const response = await fetch(
        `/api/admin/contacts/${contactId}/tasks/${taskId}/complete`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("שגיאה בעדכון המשימה");
      }

      // Update local state
      setTasks(
        tasks.map((task) =>
          task.id === taskId
            ? { ...task, status: "COMPLETED", completedAt: new Date().toISOString() }
            : task
        )
      );
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "שגיאה בעדכון המשימה");
    } finally {
      setCompletingTaskId(null);
    }
  };

  const openTasks = tasks.filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED" || t.status === "CANCELLED");

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === "COMPLETED" || task.status === "CANCELLED") {
      return false;
    }
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">משימות</h2>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          + הוספת משימה
        </button>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">אין משימות פתוחות.</p>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            + הוספת משימה
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Open Tasks */}
          {openTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">פתוחות</h3>
              <div className="space-y-3">
                {openTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`border rounded-lg p-4 ${
                      isOverdue(task)
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className={`px-2 py-1 text-xs rounded font-medium ${
                              priorityColors[task.priority]
                            }`}
                          >
                            {priorityLabels[task.priority]}
                          </span>
                          {task.dueDate && (
                            <span
                              className={`text-xs ${
                                isOverdue(task) ? "text-red-600 font-medium" : "text-gray-500"
                              }`}
                            >
                              {isOverdue(task) && "⚠️ "}
                              יעד:{" "}
                              {new Date(task.dueDate).toLocaleDateString("he-IL")}
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-gray-600 text-sm mb-2 whitespace-pre-wrap">
                            {task.description}
                          </p>
                        )}
                        <div className="text-xs text-gray-500">
                          מטפל: {task.assignedTo.name}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={completingTaskId === task.id}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {completingTaskId === task.id
                          ? "מעדכן..."
                          : "✓ סמן כהושלמה"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">הושלמו</h3>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-75"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-700 mb-1 line-through">
                          {task.title}
                        </h4>
                        {task.completedAt && (
                          <div className="text-xs text-gray-500">
                            הושלמה ב-
                            {new Date(task.completedAt).toLocaleDateString("he-IL")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Task Dialog */}
      <AddTaskDialog
        contactId={contactId}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onTaskAdded={handleTaskAdded}
      />
    </div>
  );
}
