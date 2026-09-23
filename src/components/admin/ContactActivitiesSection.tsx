"use client";

/**
 * Contact Activities Section
 * Displays activity timeline and allows adding manual activities
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddActivityDialog } from "./AddActivityDialog";

interface Activity {
  id: string;
  activityType: string;
  title: string;
  description: string | null;
  activityDate: string;
  recordedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface ContactActivitiesSectionProps {
  contactId: string;
  initialActivities: Activity[];
}

const activityTypeLabels: Record<string, string> = {
  PHONE_CALL: "שיחה",
  MEETING: "פגישה",
  EMAIL_SENT: "אימייל נשלח",
  PROPERTY_SENT: "נכס נשלח",
  FOLLOW_UP: "מעקב",
  OTHER: "אחר",
};

export function ContactActivitiesSection({
  contactId,
  initialActivities,
}: ContactActivitiesSectionProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  const handleActivityAdded = (newActivity: Activity) => {
    setActivities([newActivity, ...activities]);
    setIsDialogOpen(false);
    router.refresh();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">פעילות</h2>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          + הוספת פעילות
        </button>
      </div>

      {/* Activities Timeline */}
      {activities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">עדיין לא נרשמה פעילות.</p>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            + הוספת פעילות
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                      {activityTypeLabels[activity.activityType] || activity.activityType}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(activity.activityDate).toLocaleDateString("he-IL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {activity.title}
                  </h3>
                  {activity.description && (
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">
                      {activity.description}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    נרשם על ידי {activity.recordedBy.name}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Activity Dialog */}
      <AddActivityDialog
        contactId={contactId}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onActivityAdded={handleActivityAdded}
      />
    </div>
  );
}
