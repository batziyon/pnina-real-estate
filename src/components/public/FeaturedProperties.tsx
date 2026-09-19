"use client";

import Link from "next/link";
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

type FilterType = "all" | "SALE" | "RENT";

export function FeaturedProperties() {
  const [properties, setProperties] = useState<PropertyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: "6",
          page: "1",
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
      } catch (error) {
        console.error("Error fetching properties:", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [activeFilter]);

  return (
    <section className="bg-[#F7F4EE] py-20 lg:py-28" dir="rtl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12 lg:mb-16">
          <div className="flex items-start justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#18384C] leading-tight mb-4">
                נכסים נבחרים בירושלים
              </h2>
              <p className="text-lg text-[#18384C]/70 leading-relaxed">
                דירות ובתים מובילים, ממוקמים במיקומים מבוקשים ומוגדרים לקהל שמחפש איכות ומקצועיות.
              </p>
            </div>

            <Link
              href="/properties"
              className="hidden lg:inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#135C87] border-2 border-[#135C87] hover:bg-[#135C87] hover:text-white transition-all"
            >
              <span>כל הנכסים</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-10">
          <div className="flex flex-wrap gap-3">
            {[
              { id: "all", label: "הכל" },
              { id: "SALE", label: "למכירה" },
              { id: "RENT", label: "להשכרה" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as FilterType)}
                className={`px-5 py-2.5 text-sm font-semibold transition-all ${
                  activeFilter === tab.id
                    ? "bg-[#135C87] text-white"
                    : "bg-white text-[#18384C] hover:bg-[#135C87]/5 border border-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block h-10 w-10 animate-spin border-4 border-[#135C87] border-t-transparent" />
            <p className="mt-4 text-[#18384C]/70">טוען נכסים...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <div className="bg-white border-2 border-gray-200 py-20 text-center">
            <p className="text-lg text-[#18384C]/70">אין נכסים זמינים כרגע</p>
          </div>
        )}

        {/* Properties Grid */}
        {!loading && properties.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="mt-12 text-center lg:hidden">
              <Link
                href="/properties"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-[#135C87] hover:bg-[#123F5A] transition-colors"
              >
                לכל הנכסים
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
