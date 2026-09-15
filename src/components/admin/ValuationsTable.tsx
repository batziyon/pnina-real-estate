"use client";

import { useRouter } from "next/navigation";
import type { ValuationRequestData } from "@/domain/valuation/valuation.types";
import type { NeighborhoodData } from "@/domain/neighborhood/neighborhood.types";
import { ValuationRowWithEdit } from "./ValuationRowWithEdit";

interface ValuationsTableProps {
  valuations: ValuationRequestData[];
  neighborhoods: NeighborhoodData[];
}

export function ValuationsTable({ valuations, neighborhoods }: ValuationsTableProps) {
  const router = useRouter();

  const handleUpdate = () => {
    router.refresh();
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {valuations.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-500 text-lg">לא נמצאו בקשות הערכת שווי</p>
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
                שכונה
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                סוג נכס
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                סטטוס
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                פרטים
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {valuations.map((valuation) => (
              <ValuationRowWithEdit
                key={valuation.id}
                valuation={valuation}
                neighborhoods={neighborhoods}
                onUpdate={handleUpdate}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
