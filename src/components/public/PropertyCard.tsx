/**
 * Property Card Component
 * Clean, professional property card with minimal styling and subtle color
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
  const priceDisplay = property.price
    ? `₪${Number(property.price).toLocaleString("he-IL")}`
    : "מחיר טרם נקבע";

  const metadata: string[] = [];
  if (property.rooms) metadata.push(`${property.rooms} חדרים`);
  if (property.area) metadata.push(`${property.area} מ"ר`);
  if (property.floor !== null) metadata.push(`קומה ${property.floor}`);

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block bg-white border border-gray-200 overflow-hidden transition-all hover:border-[#D9822B] hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#f5ede3] to-[#e8dcc8]">
        {/* Placeholder gradient background with Jerusalem stone colors */}
        <div className="absolute inset-0 opacity-60" />
        
        {/* Deal Type Badge */}
        <div className="absolute top-4 right-4 z-10 bg-white px-3 py-1.5 text-xs font-bold text-[#135C87] tracking-wide">
          {property.dealType === "SALE" ? "למכירה" : "להשכרה"}
        </div>

        {/* Hover Overlay with warm orange tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D9822B]/0 to-[#D9822B]/0 group-hover:from-[#D9822B]/5 group-hover:to-[#D9822B]/10 transition-all duration-300" />
        
        {/* TODO: Replace with actual property image
        <Image
          src={property.imageUrl}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        */}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location */}
        {neighborhoodName && (
          <div className="text-xs font-semibold text-[#135C87] tracking-wider mb-2 uppercase">
            {neighborhoodName}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-[#18384C] mb-3 leading-tight group-hover:text-[#135C87] transition-colors">
          {property.title}
        </h3>

        {/* Price */}
        <div className={`text-2xl font-bold mb-4 ${property.price ? "text-[#135C87]" : "text-gray-500"}`}>
          {priceDisplay}
        </div>

        {/* Metadata */}
        {metadata.length > 0 && (
          <div className="flex items-center gap-3 text-sm text-[#18384C]/70 pt-4 border-t border-gray-200">
            {metadata.map((item, index) => (
              <span key={item} className="flex items-center gap-1">
                {item}
                {index < metadata.length - 1 && (
                  <span className="w-1 h-1 bg-[#D9822B] rounded-full mr-3" />
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
