/**
 * Property Detail Page
 * 
 * Public property details with contact CTA
 */

import { notFound } from "next/navigation";
import { PublicHeader, PublicFooter } from "@/components/public";
import { PropertyDetailClient } from "@/components/public/PropertyDetailClient";

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

async function getProperty(id: string): Promise<PropertyDTO | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/properties/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching property:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    return {
      title: "נכס לא נמצא | פנינה נדל״ן",
    };
  }

  return {
    title: `${property.title} | פנינה נדל״ן`,
    description: property.description || `${property.title} - ${property.dealType === "SALE" ? "למכירה" : "להשכרה"} בירושלים`,
  };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#ffffff]">
      <PublicHeader />

      <main className="flex-1">
        <div className="bg-[#123F5A] py-10 text-white lg:py-14">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="mb-4 h-1 w-14 bg-[#D9822B]" />
            <h1 className="max-w-4xl text-4xl font-black leading-[0.96] tracking-[-0.06em] text-white sm:text-5xl">
              {property.title}
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="border border-[#dfeaf1] bg-white">
            <PropertyDetailClient property={property} />
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
