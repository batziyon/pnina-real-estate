"use client";

import { useRouter } from "next/navigation";
import type { InquiryData } from "@/domain/inquiry/inquiry.types";
import { InquiryRowWithEdit } from "./InquiryRowWithEdit";

interface InquiriesTableProps {
  inquiries: InquiryData[];
}

export function InquiriesTable({ inquiries }: InquiriesTableProps) {
  const router = useRouter();

  const handleUpdate = () => {
    router.refresh();
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {inquiries.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-500 text-lg">לא נמצאו פניות</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                שם
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                טלפון
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                סוג פנייה
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                סטטוס
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                תאריך
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                פרטים
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inquiries.map((inquiry) => (
              <InquiryRowWithEdit
                key={inquiry.id}
                inquiry={inquiry}
                onUpdate={handleUpdate}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
