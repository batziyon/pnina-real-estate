"use client";

/**
 * Properties List Client Component
 * 
 * Handles property filtering and display
 */

import { useState, useEffect } from "react";
import { PropertyCard } from "./PropertyCard";

interface PropertyDTO {
  id: string;
  title: string;
  price: string | null;
  dealType: string;
  rooms: string | null;
  area: string | null;
  floor: number | null;
  neighborhoodId: string;
}

interface APIResponse {
  data: PropertyDTO[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

type DealTypeFilter = "all" | "SALE" | "RENT";

export function PropertiesListClient() {
  const [properties, setProperties] = useState<PropertyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<DealTypeFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: "12",
          page: page.toString(),
        });

        if (activeFilter !== "all") {
          params.set("dealType", activeFilter);
        }

        const response = await fetch(`/api/properties?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }

        const data: APIResponse = await response.json();
        setProperties(data.data);
        setTotalPages(data.meta.totalPages);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [activeFilter, page]);

  return (
    <div>
      {/* Filter Tabs */}
      <div className="mb-8 flex gap-6 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveFilter("all");
            setPage(1);
          }}
          className={`pb-3 text-[1rem] font-medium transition-all border-b-2 -mb-px ${
            activeFilter === "all"
              ? "border-[#135C87] text-[#135C87]"
              : "border-transparent text-gray-600 hover:text-[#135C87] hover:border-gray-300"
          }`}
        >
          הכל
        </button>
        <button
          onClick={() => {
            setActiveFilter("SALE");
            setPage(1);
          }}
          className={`pb-3 text-[1rem] font-medium transition-all border-b-2 -mb-px ${
            activeFilter === "SALE"
              ? "border-[#135C87] text-[#135C87]"
              : "border-transparent text-gray-600 hover:text-[#135C87] hover:border-gray-300"
          }`}
        >
          למכירה
        </button>
        <button
          onClick={() => {
            setActiveFilter("RENT");
            setPage(1);
          }}
          className={`pb-3 text-[1rem] font-medium transition-all border-b-2 -mb-px ${
            activeFilter === "RENT"
              ? "border-[#135C87] text-[#135C87]"
              : "border-transparent text-gray-600 hover:text-[#135C87] hover:border-gray-300"
          }`}
        >
          להשכרה
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-[#135C87] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-[1rem] text-gray-600">טוען נכסים...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && properties.length === 0 && (
        <div className="text-center py-12 bg-white border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <p className="mt-4 text-[1.2rem] text-gray-600">אין נכסים זמינים כרגע</p>
          <p className="mt-2 text-[1rem] text-gray-500">נכסים חדשים יתווספו בקרוב</p>
        </div>
      )}

      {/* Properties Grid */}
      {!loading && properties.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-[#135C87] bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                הקודם
              </button>
              <span className="px-4 py-2 text-[1rem] text-gray-600">
                עמוד {page} מתוך {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-[#135C87] bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                הבא
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
