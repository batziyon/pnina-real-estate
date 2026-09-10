/**
 * API Data Transfer Objects (DTOs).
 *
 * Clean, public-facing data shapes for API responses.
 * Do not expose internal database details, credentials, or sensitive metadata.
 */

import type { PropertyData } from "@/domain/property/property.types";
import type { ProjectData } from "@/domain/project/project.types";
import type { NeighborhoodData } from "@/domain/neighborhood/neighborhood.types";
import type { TestimonialData } from "@/domain/testimonial/testimonial.types";
import type { InquiryData } from "@/domain/inquiry/inquiry.types";
import type { ValuationRequestData } from "@/domain/valuation/valuation.types";

// ---------------------------------------------------------------------------
// Property DTO
// ---------------------------------------------------------------------------

export interface PropertyPublicDTO {
  id: string;
  title: string;
  description: string | null;
  dealType: string;
  propertyType: string;
  price: string;
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

export function toPropertyPublicDTO(property: PropertyData): PropertyPublicDTO {
  return {
    id: property.id,
    title: property.title,
    description: property.description,
    dealType: property.dealType,
    propertyType: property.propertyType,
    price: property.price,
    neighborhoodId: property.neighborhoodId,
    address: property.address,
    rooms: property.rooms,
    area: property.area,
    floor: property.floor,
    totalFloors: property.totalFloors,
    parking: property.parking,
    elevator: property.elevator,
    balcony: property.balcony,
    safeRoom: property.safeRoom,
    storage: property.storage,
    airConditioning: property.airConditioning,
    accessible: property.accessible,
    furnished: property.furnished,
    createdAt: property.createdAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Project DTO
// ---------------------------------------------------------------------------

export interface ProjectPublicDTO {
  id: string;
  name: string;
  description: string | null;
  neighborhoodId: string;
  address: string | null;
  coverImage: string | null;
}

export function toProjectPublicDTO(project: ProjectData): ProjectPublicDTO {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    neighborhoodId: project.neighborhoodId,
    address: project.address,
    coverImage: project.coverImage,
  };
}

// ---------------------------------------------------------------------------
// Neighborhood DTO
// ---------------------------------------------------------------------------

export interface NeighborhoodPublicDTO {
  id: string;
  name: string;
}

export function toNeighborhoodPublicDTO(
  neighborhood: NeighborhoodData
): NeighborhoodPublicDTO {
  return {
    id: neighborhood.id,
    name: neighborhood.name,
  };
}

// ---------------------------------------------------------------------------
// Testimonial DTO
// ---------------------------------------------------------------------------

export interface TestimonialPublicDTO {
  id: string;
  displayName: string;
  content: string;
  createdAt: string;
}

export function toTestimonialPublicDTO(
  testimonial: TestimonialData
): TestimonialPublicDTO {
  return {
    id: testimonial.id,
    displayName: testimonial.displayName ?? testimonial.name,
    content: testimonial.content,
    createdAt: testimonial.createdAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Inquiry response DTO (for POST /api/inquiries success response)
// ---------------------------------------------------------------------------

export interface InquiryCreatedDTO {
  id: string;
  message: string;
}

export function toInquiryCreatedDTO(inquiry: InquiryData): InquiryCreatedDTO {
  return {
    id: inquiry.id,
    message: "Your inquiry has been received. We will contact you shortly.",
  };
}

// ---------------------------------------------------------------------------
// Valuation Request response DTO
// ---------------------------------------------------------------------------

export interface ValuationRequestCreatedDTO {
  id: string;
  message: string;
}

export function toValuationRequestCreatedDTO(
  valuation: ValuationRequestData
): ValuationRequestCreatedDTO {
  return {
    id: valuation.id,
    message: "Your valuation request has been received. We will contact you shortly.",
  };
}
