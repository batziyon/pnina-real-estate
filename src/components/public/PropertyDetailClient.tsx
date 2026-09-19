"use client";

/**
 * Property Detail Client Component
 * 
 * Displays property details and contact form
 */

import { useState } from "react";
import { Container } from "./Container";
import { PropertyContactForm } from "./PropertyContactForm";

interface PropertyDTO {
  id: string;
  title: string;
  description: string | null;
  dealType: string;
  propertyType: string;
  price: string | null;
  neighborhoodId: string;
  address: string | null;
  rooms: string | null;
  area: string | null;
  floor: number | null;
  totalFloors: number | null;
  parking: boolean;
  elevator: boolean;
  balcony: boolean;
  safeRoom: boolean;
  storage: boolean;
  airConditioning: boolean;
  accessible: boolean;
  furnished: boolean;
  createdAt: string;
}

interface PropertyDetailClientProps {
  property: PropertyDTO;
}

export function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const [showContact, setShowContact] = useState(false);

  // Format price
  const priceDisplay = property.price 
    ? `₪ ${Number(property.price).toLocaleString('he-IL')}`
    : "מחיר טרם נקבע";

  // Property type labels
  const propertyTypeLabels: Record<string, string> = {
    APARTMENT: "דירה",
    PENTHOUSE: "פנטהאוז",
    HOUSE: "בית",
    VILLA: "וילה",
    DUPLEX: "דופלקס",
    STUDIO: "סטודיו",
    OFFICE: "משרד",
    COMMERCIAL: "מסחרי",
    LAND: "קרקע",
    OTHER: "אחר",
  };

  // Features with labels
  const features = [
    { key: "parking", label: "חניה", value: property.parking },
    { key: "elevator", label: "מעלית", value: property.elevator },
    { key: "balcony", label: "מרפסת", value: property.balcony },
    { key: "safeRoom", label: "ממ״ד", value: property.safeRoom },
    { key: "storage", label: "מחסן", value: property.storage },
    { key: "airConditioning", label: "מיזוג אוויר", value: property.airConditioning },
    { key: "accessible", label: "נגיש", value: property.accessible },
    { key: "furnished", label: "מרוהט", value: property.furnished },
  ].filter(f => f.value);

  return (
    <Container className="py-10 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 border border-[#dfe8ee] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex bg-[#135C87] px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-white">
                {property.dealType === "SALE" ? "למכירה" : "להשכרה"}
              </div>
              <h1 className="text-3xl font-black tracking-[-0.05em] text-[#123b58] sm:text-4xl">
                {property.title}
              </h1>
            </div>
            <div className={`text-2xl font-black ${property.price ? "text-[#135C87]" : "text-[#73859a]"}`}>
              {priceDisplay}
            </div>
          </div>

          {property.address && (
            <p className="mt-3 text-base text-[#536576]">{property.address}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.65fr_0.9fr]">
          <div className="space-y-6">
            <div className="border border-[#dfe8ee] bg-white p-6">
              <h2 className="mb-5 text-2xl font-bold text-[#123b58]">פרטי הנכס</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {property.rooms && (
                  <div className="border border-[#edf2f6] bg-[#f7fafc] p-4 text-center">
                    <div className="text-2xl font-black text-[#135C87]">{property.rooms}</div>
                    <div className="mt-1 text-sm text-[#5f6d7a]">חדרים</div>
                  </div>
                )}
                {property.area && (
                  <div className="border border-[#edf2f6] bg-[#f7fafc] p-4 text-center">
                    <div className="text-2xl font-black text-[#135C87]">{property.area}</div>
                    <div className="mt-1 text-sm text-[#5f6d7a]">מ״ר</div>
                  </div>
                )}
                {property.floor !== null && (
                  <div className="border border-[#edf2f6] bg-[#f7fafc] p-4 text-center">
                    <div className="text-2xl font-black text-[#135C87]">{property.floor}</div>
                    <div className="mt-1 text-sm text-[#5f6d7a]">קומה</div>
                  </div>
                )}
                <div className="border border-[#edf2f6] bg-[#f7fafc] p-4 text-center">
                  <div className="text-sm font-bold text-[#123b58]">{propertyTypeLabels[property.propertyType] || property.propertyType}</div>
                  <div className="mt-1 text-xs text-[#5f6d7a]">סוג נכס</div>
                </div>
              </div>
            </div>

            {property.description && (
              <div className="border border-[#dfe8ee] bg-white p-6">
                <h2 className="mb-4 text-2xl font-bold text-[#123b58]">תיאור</h2>
                <p className="whitespace-pre-wrap text-[1.03rem] leading-8 text-[#475c6d]">
                  {property.description}
                </p>
              </div>
            )}

            {features.length > 0 && (
              <div className="border border-[#dfe8ee] bg-white p-6">
                <h2 className="mb-5 text-2xl font-bold text-[#123b58]">מאפיינים</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {features.map((feature) => (
                    <div key={feature.key} className="flex items-center gap-2 bg-[#f6f9fb] px-3 py-3 text-[#425562]">
                      <svg className="h-5 w-5 text-[#135C87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:pl-2">
            <div className="sticky top-6 border border-[#dfe8ee] bg-white p-6">
              <h3 className="mb-3 text-2xl font-bold text-[#123b58]">מעוניינים בנכס?</h3>
              <p className="mb-6 text-base leading-7 text-[#536576]">
                השאירו פרטים ונחזור אליכם בהקדם עם פרטי המידע, המענה והאפשרויות הנכונות.
              </p>

              {!showContact && (
                <button
                  onClick={() => setShowContact(true)}
                  className="w-full bg-[#D9822B] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[#c8721d]"
                >
                  צור קשר
                </button>
              )}

              {showContact && (
                <PropertyContactForm propertyId={property.id} propertyTitle={property.title} />
              )}
            </div>
          </aside>
        </div>
      </div>
    </Container>
  );
}
