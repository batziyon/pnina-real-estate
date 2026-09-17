/**
 * Pure property business rules.
 *
 * All functions here are stateless and side-effect-free.
 * They operate only on domain types — no Prisma, no HTTP, no React.
 *
 * Use these from application use cases (not from UI components).
 *
 * Geographic model: Jerusalem-only brokerage.
 * neighborhoodId is the geographic locator; there is no city field.
 */

import type { PropertyData, PropertyStatus, CreatePropertyInput } from "./property.types";

// ---------------------------------------------------------------------------
// Status transition rules
// ---------------------------------------------------------------------------

const ALLOWED_TRANSITIONS: Record<PropertyStatus, PropertyStatus[]> = {
  DRAFT:          ["PUBLISHED", "ARCHIVED"],
  PUBLISHED:      ["UNDER_CONTRACT", "SOLD", "RENTED", "ARCHIVED", "DRAFT"],
  UNDER_CONTRACT: ["PUBLISHED", "SOLD", "RENTED", "ARCHIVED"],
  SOLD:           ["ARCHIVED"],
  RENTED:         ["PUBLISHED", "ARCHIVED"],
  ARCHIVED:       ["DRAFT"],
};

export function isValidStatusTransition(
  from: PropertyStatus,
  to: PropertyStatus
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

// ---------------------------------------------------------------------------
// Publication rules
// ---------------------------------------------------------------------------

export interface PublishingViolation {
  field: string;
  message: string;
}

/**
 * Returns a list of violations that prevent a property from being published.
 * An empty array means the property satisfies all publication requirements.
 * 
 * Note: Price is optional. Properties may be published with price = null,
 * which displays as "מחיר טרם נקבע" (price not yet determined).
 */
export function getPublishingViolations(
  property: PropertyData
): PublishingViolation[] {
  const violations: PublishingViolation[] = [];

  if (!property.title.trim()) {
    violations.push({ field: "title", message: "Title is required." });
  }

  if (!property.agentId) {
    violations.push({
      field: "agentId",
      message: "A property must have an assigned agent before it can be published.",
    });
  }

  if (!property.neighborhoodId) {
    violations.push({
      field: "neighborhoodId",
      message: "A neighborhood must be assigned before publishing.",
    });
  }

  // Price is optional - removed validation requirement
  // Properties can be published with price = null ("מחיר טרם נקבע")

  if (!property.propertyType) {
    violations.push({
      field: "propertyType",
      message: "Property type must be specified.",
    });
  }

  if (!property.dealType) {
    violations.push({
      field: "dealType",
      message: "Deal type (sale or rent) must be specified.",
    });
  }

  return violations;
}

export function canBePublished(property: PropertyData): boolean {
  return getPublishingViolations(property).length === 0;
}

// ---------------------------------------------------------------------------
// Price rules
// ---------------------------------------------------------------------------

export function isValidPrice(price: string | null): boolean {
  if (!price) return false;
  const n = parseFloat(price);
  return !isNaN(n) && n > 0 && isFinite(n);
}

export function hasMeaningfulPrice(
  property: Pick<PropertyData, "price" | "dealType">
): boolean {
  return property.price !== null && isValidPrice(property.price);
}

// ---------------------------------------------------------------------------
// Creation rules
// ---------------------------------------------------------------------------

export interface CreationViolation {
  field: string;
  message: string;
}

export function getCreationViolations(
  input: CreatePropertyInput
): CreationViolation[] {
  const violations: CreationViolation[] = [];

  if (!input.title?.trim()) {
    violations.push({ field: "title", message: "Title is required." });
  }

  if (!input.agentId) {
    violations.push({ field: "agentId", message: "Agent ID is required." });
  }

  if (!input.neighborhoodId) {
    violations.push({
      field: "neighborhoodId",
      message: "Neighborhood is required.",
    });
  }

  if (!input.dealType) {
    violations.push({ field: "dealType", message: "Deal type is required." });
  }

  if (!input.propertyType) {
    violations.push({ field: "propertyType", message: "Property type is required." });
  }

  return violations;
}

// ---------------------------------------------------------------------------
// Authorization helpers (pure, stateless)
// ---------------------------------------------------------------------------

export function canActorEditProperty(
  actorId: string,
  actorRole: "ADMIN" | "AGENT" | "EDITOR",
  property: Pick<PropertyData, "agentId">
): boolean {
  if (actorRole === "ADMIN" || actorRole === "EDITOR") return true;
  return property.agentId === actorId;
}

export function canActorPublish(
  actorId: string,
  actorRole: "ADMIN" | "AGENT" | "EDITOR",
  property: Pick<PropertyData, "agentId">
): boolean {
  if (actorRole === "ADMIN") return true;
  if (actorRole === "AGENT") return property.agentId === actorId;
  return false;
}
