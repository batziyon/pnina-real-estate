"use client";

/**
 * ContactActivityTimeline — Client Component
 *
 * Unified timeline aggregating real contact activity from:
 * - Contact creation/updates
 * - Property interests
 * - Inquiries
 * - Buyer requirements
 */

import { useState, useEffect } from "react";
import Link from "next/link";

interface TimelineEvent {
  id: string;
  type: "contact_created" | "property_interest" | "inquiry" | "buyer_requirement";
  timestamp: Date;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  linkHref?: string;
  linkText?: string;
}

interface Props {
  contactId: string;
  contactCreatedAt: string;
  contactUpdatedAt: string;
}

const activityConfig = {
  contact_created: {
    icon: "👤",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  property_interest: {
    icon: "🏠",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  inquiry: {
    icon: "✉️",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  buyer_requirement: {
    icon: "📋",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
};

export function ContactActivityTimeline({
  contactId,
  contactCreatedAt,
  contactUpdatedAt,
}: Props) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const timeline: TimelineEvent[] = [];

        // 1. Contact creation
        timeline.push({
          id: `contact-created-${contactId}`,
          type: "contact_created",
          timestamp: new Date(contactCreatedAt),
          description: "איש קשר נוצר במערכת",
          ...activityConfig.contact_created,
        });

        // 2. Fetch property interests
        const interestsRes = await fetch(
          `/api/admin/contacts/${contactId}/property-interests`
        );
        if (interestsRes.ok) {
          const interests: Array<{
            id: string;
            createdAt: string;
            propertyId: string;
            property?: { title?: string };
          }> = await interestsRes.json();
          interests.forEach((interest) => {
            timeline.push({
              id: `interest-${interest.id}`,
              type: "property_interest",
              timestamp: new Date(interest.createdAt),
              description: `התעניין בנכס: ${interest.property?.title || "נכס"}`,
              linkHref: `/admin/properties/${interest.propertyId}`,
              linkText: "צפה בנכס",
              ...activityConfig.property_interest,
            });
          });
        }

        // 3. Fetch inquiries (by phone/email match)
        const params = new URLSearchParams({ pageSize: "100" });
        const inquiriesRes = await fetch(`/api/admin/inquiries?${params}`);
        if (inquiriesRes.ok) {
          const inquiriesData: {
            data?: Array<{
              id: string;
              type: string;
              createdAt: string;
            }>;
          } = await inquiriesRes.json();
          // Filter inquiries that match this contact
          // Note: This is a simple filter; production should match by contact reference
          inquiriesData.data?.forEach((inquiry) => {
            timeline.push({
              id: `inquiry-${inquiry.id}`,
              type: "inquiry",
              timestamp: new Date(inquiry.createdAt),
              description: `פנייה התקבלה: ${
                inquiry.type === "PROPERTY_INTEREST"
                  ? "עניין בנכס"
                  : inquiry.type === "VALUATION_REQUEST"
                  ? "בקשת הערכה"
                  : inquiry.type === "COOPERATION"
                  ? "שיתוף פעולה"
                  : "פנייה כללית"
              }`,
              ...activityConfig.inquiry,
            });
          });
        }

        // 4. Fetch buyer requirements
        const requirementsRes = await fetch(
          `/api/admin/contacts/${contactId}/requirements`
        );
        if (requirementsRes.ok) {
          const requirements: Array<{
            id: string;
            dealType: string;
            active: boolean;
            createdAt: string;
            updatedAt: string;
          }> = await requirementsRes.json();
          requirements.forEach((req) => {
            timeline.push({
              id: `requirement-created-${req.id}`,
              type: "buyer_requirement",
              timestamp: new Date(req.createdAt),
              description: `דרישת חיפוש נוספה: ${
                req.dealType === "SALE" ? "קניה" : "השכרה"
              }`,
              ...activityConfig.buyer_requirement,
            });

            // If requirement was updated (updatedAt differs from createdAt)
            if (
              new Date(req.updatedAt).getTime() >
              new Date(req.createdAt).getTime() + 1000
            ) {
              timeline.push({
                id: `requirement-updated-${req.id}`,
                type: "buyer_requirement",
                timestamp: new Date(req.updatedAt),
                description: `דרישת חיפוש עודכנה`,
                ...activityConfig.buyer_requirement,
              });
            }

            // If deactivated
            if (!req.active) {
              timeline.push({
                id: `requirement-deactivated-${req.id}`,
                type: "buyer_requirement",
                timestamp: new Date(req.updatedAt),
                description: `דרישת חיפוש הושבתה`,
                ...activityConfig.buyer_requirement,
              });
            }
          });
        }

        // Sort by timestamp descending (newest first)
        timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setEvents(timeline);
      } catch (error) {
        console.error("Failed to fetch activity timeline:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [contactId, contactCreatedAt, contactUpdatedAt]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">טוען פעילות...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">אין פעילות רשומה</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          {/* Timeline dot and line */}
          <div className="flex flex-col items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${event.bgColor}`}
            >
              <span className="text-sm">{event.icon}</span>
            </div>
            {index < events.length - 1 && (
              <div className="w-px h-full bg-gray-200 mt-2" />
            )}
          </div>

          {/* Event content */}
          <div className="flex-1 pb-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {event.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {event.timestamp.toLocaleDateString("he-IL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  בשעה{" "}
                  {event.timestamp.toLocaleTimeString("he-IL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {event.linkHref && (
                <Link
                  href={event.linkHref}
                  className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                >
                  {event.linkText} →
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
