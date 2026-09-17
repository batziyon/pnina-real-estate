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
    <Container className="py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="bg-white p-6 mb-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block px-3 py-1 text-xs font-medium bg-[#135C87] text-white mb-3">
                  {property.dealType === "SALE" ? "למכירה" : "להשכרה"}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                {property.address && (
                  <p className="text-gray-600">{property.address}</p>
                )}
              </div>
            </div>

            <div className={`text-3xl font-bold ${property.price ? 'text-[#135C87]' : 'text-gray-500'}`}>
              {priceDisplay}
            </div>
          </div>

          {/* Key Details */}
          <div className="bg-white p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">פרטי הנכס</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.rooms && (
                <div className="text-center p-4 bg-gray-50">
                  <div className="text-2xl font-bold text-[#135C87] mb-1">{property.rooms}</div>
                  <div className="text-sm text-gray-600">חדרים</div>
                </div>
              )}
              {property.area && (
                <div className="text-center p-4 bg-gray-50">
                  <div className="text-2xl font-bold text-[#135C87] mb-1">{property.area}</div>
                  <div className="text-sm text-gray-600">מ״ר</div>
                </div>
              )}
              {property.floor !== null && (
                <div className="text-center p-4 bg-gray-50">
                  <div className="text-2xl font-bold text-[#135C87] mb-1">{property.floor}</div>
                  <div className="text-sm text-gray-600">קומה</div>
                </div>
              )}
              <div className="text-center p-4 bg-gray-50">
                <div className="text-sm font-medium text-gray-900 mb-1">{propertyTypeLabels[property.propertyType] || property.propertyType}</div>
                <div className="text-xs text-gray-600">סוג נכס</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-white p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">תיאור</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {property.description}
              </p>
            </div>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div className="bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">מאפיינים</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {features.map((feature) => (
                  <div key={feature.key} className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-[#135C87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 shadow-sm sticky top-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              מעוניינים בנכס?
            </h3>
            <p className="text-gray-600 mb-6">
              השאירו פרטים ונחזור אליכם בהקדם
            </p>
            
            {!showContact && (
              <button
                onClick={() => setShowContact(true)}
                className="w-full px-6 py-3 text-base font-medium text-white bg-[#D9822B] hover:bg-[#c2721f] transition-colors"
              >
                צור קשר
              </button>
            )}
            
            {showContact && (
              <PropertyContactForm propertyId={property.id} propertyTitle={property.title} />
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
