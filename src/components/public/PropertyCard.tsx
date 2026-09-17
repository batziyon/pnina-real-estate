/**
 * Property Card Component
 * 
 * Editorial property card for public listings
 * Image-dominant design with premium real-estate presentation
 */

import Link from "next/link";

export interface PropertyCardData {
  id: string;
  title: string;
  price: string | null;
  dealType: string;
  rooms: string | null;
  area: string | null;
  floor: number | null;
  neighborhoodId: string;
}

interface PropertyCardProps {
  property: PropertyCardData;
  neighborhoodName?: string;
}

export function PropertyCard({ property, neighborhoodName }: PropertyCardProps) {
  // Format price
  const priceDisplay = property.price 
    ? `₪ ${Number(property.price).toLocaleString('he-IL')}`
    : "מחיר טרם נקבע";

  // Build metadata line
  const metadata: string[] = [];
  if (property.rooms) {
    metadata.push(`${property.rooms} חדרים`);
  }
  if (property.area) {
    metadata.push(`${property.area} מ״ר`);
  }
  if (property.floor !== null) {
    metadata.push(`קומה ${property.floor}`);
  }

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block bg-white overflow-hidden transition-all hover:shadow-lg"
    >
      {/* Image - Large and dominant */}
      <div className="relative aspect-[3/2] bg-gray-100 overflow-hidden">
        {/* Clean neutral background - no fake image placeholders */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
        
        {/* Deal type badge - clean and minimal */}
        <div className="absolute top-4 right-4 px-3 py-1.5 text-xs font-medium bg-white text-[#135C87] shadow-sm">
          {property.dealType === "SALE" ? "למכירה" : "להשכרה"}
        </div>
      </div>

      {/* Content - Refined hierarchy */}
      <div className="p-6 border border-t-0 border-gray-100 group-hover:border-gray-200 transition-colors">
        {/* Title - Strong hierarchy */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#135C87] transition-colors leading-snug line-clamp-2 min-h-[3.5rem]">
          {property.title}
        </h3>

        {/* Price - Prominent display */}
        <p className={`text-2xl font-bold mb-4 ${property.price ? 'text-[#135C87]' : 'text-gray-500 text-lg'}`}>
          {priceDisplay}
        </p>

        {/* Metadata - Clean and readable */}
        {metadata.length > 0 && (
          <p className="text-sm text-gray-600 mb-3 pb-3 border-b border-gray-100">
            {metadata.join(" · ")}
          </p>
        )}

        {/* Neighborhood - Subtle but present */}
        {neighborhoodName && (
          <p className="text-sm font-medium text-gray-500">
            {neighborhoodName}
          </p>
        )}
      </div>
    </Link>
  );
}
