"use client";

/**
 * ContactInquiriesSection — Client Component
 *
 * Displays all inquiries related to a contact (matched by name/phone/email)
 */

import { useState, useEffect } from "react";
import Link from "next/link";

interface Inquiry {
  id: string;
  propertyId: string | null;
  type: string;
  status: string;
  message: string | null;
  createdAt: string;
  property?: {
    id: string;
    title: string;
  } | null;
}

interface Props {
  contactId: string;
  contactName: string;
  contactPhone: string | null;
  contactEmail: string | null;
}

const typeLabels: Record<string, string> = {
  PROPERTY_INTEREST: "עניין בנכס",
  VALUATION_REQUEST: "בקשת הערכה",
  COOPERATION: "שיתוף פעולה",
  GENERAL_CONTACT: "פנייה כללית",
};

const statusLabels: Record<string, string> = {
  NEW: "חדש",
  CONTACTED: "נוצר קשר",
  IN_PROGRESS: "בטיפול",
  CLOSED: "סגור",
};

const statusColors: Record<string, string> = {
  NEW: "bg-yellow-100 text-yellow-800",
  CONTACTED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

export function ContactInquiriesSection({
  contactId,
  contactName,
  contactPhone,
  contactEmail,
}: Props) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        // Build query params to match by name, phone, or email
        const params = new URLSearchParams();
        if (contactPhone) params.append("phone", contactPhone);
        if (contactEmail) params.append("email", contactEmail);
        
        const response = await fetch(
          `/api/admin/inquiries?${params.toString()}`
        );
        
        if (response.ok) {
          const data = await response.json();
          // Filter to match name as well (case-insensitive)
          const filtered = data.data.filter((inq: Inquiry & { name: string }) => 
            inq.name?.toLowerCase().includes(contactName.toLowerCase()) ||
            contactName.toLowerCase().includes(inq.name?.toLowerCase())
          );
          setInquiries(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch inquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [contactId, contactName, contactPhone, contactEmail]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">טוען פניות...</p>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">אין פניות רשומות</p>
        <p className="text-sm text-gray-400 mt-2">
          פניות מהאתר הציבורי יופיעו כאן
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {inquiries.map((inquiry) => (
        <div
          key={inquiry.id}
          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-900">
                  {typeLabels[inquiry.type] || inquiry.type}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    statusColors[inquiry.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {statusLabels[inquiry.status] || inquiry.status}
                </span>
              </div>

              {inquiry.property && (
                <Link
                  href={`/admin/properties/${inquiry.property.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline block mb-2"
                >
                  📍 {inquiry.property.title}
                </Link>
              )}

              {inquiry.message && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {inquiry.message}
                </p>
              )}

              <div className="text-xs text-gray-500">
                {new Date(inquiry.createdAt).toLocaleDateString("he-IL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            <Link
              href={`/admin/inquiries?id=${inquiry.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
            >
              צפה ←
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
