/**
 * Composition root — server-side dependency injection container.
 *
 * This is the ONLY place where concrete infrastructure implementations are
 * instantiated and wired to the domain repository interfaces. Application
 * use cases receive repository interfaces, not Prisma implementations.
 *
 * IMPORT RULES:
 *   ✅ Server components / route handlers / server actions may import this file.
 *   ❌ Client components must NEVER import this file.
 *   ❌ Domain and Application layers must NOT import from here.
 *
 * The "server-only" guard enforces the server boundary at build time.
 */

import "server-only";

import { PrismaNeighborhoodRepository } from "@/infrastructure/neighborhood/prisma-neighborhood.repository";
import { PrismaUserRepository } from "@/infrastructure/user/prisma-user.repository";
import { PrismaProjectRepository } from "@/infrastructure/project/prisma-project.repository";
import { PrismaPropertyRepository } from "@/infrastructure/property/prisma-property.repository";
import { PrismaInquiryRepository } from "@/infrastructure/inquiry/prisma-inquiry.repository";
import { PrismaValuationRequestRepository } from "@/infrastructure/valuation/prisma-valuation-request.repository";
import { PrismaTestimonialRepository } from "@/infrastructure/testimonial/prisma-testimonial.repository";

import type { NeighborhoodRepository } from "@/domain/neighborhood/neighborhood.repository";
import type { UserRepository } from "@/domain/user/user.repository";
import type { ProjectRepository } from "@/domain/project/project.repository";
import type { PropertyRepository } from "@/domain/property/property.repository";
import type { InquiryRepository } from "@/domain/inquiry/inquiry.repository";
import type { ValuationRequestRepository } from "@/domain/valuation/valuation.repository";
import type { TestimonialRepository } from "@/domain/testimonial/testimonial.repository";

// ---------------------------------------------------------------------------
// Repository instances — one instance per process (repositories are stateless).
// ---------------------------------------------------------------------------

const neighborhoodRepository: NeighborhoodRepository =
  new PrismaNeighborhoodRepository();

const userRepository: UserRepository = new PrismaUserRepository();

const projectRepository: ProjectRepository = new PrismaProjectRepository();

const propertyRepository: PropertyRepository = new PrismaPropertyRepository();

const inquiryRepository: InquiryRepository = new PrismaInquiryRepository();

const valuationRequestRepository: ValuationRequestRepository =
  new PrismaValuationRequestRepository();

const testimonialRepository: TestimonialRepository =
  new PrismaTestimonialRepository();

// ---------------------------------------------------------------------------
// Container — exported as typed repository interfaces, never as concrete classes.
// Callers depend on the interface, not the implementation.
// ---------------------------------------------------------------------------

export const container = {
  repositories: {
    neighborhood: neighborhoodRepository,
    user: userRepository,
    project: projectRepository,
    property: propertyRepository,
    inquiry: inquiryRepository,
    valuationRequest: valuationRequestRepository,
    testimonial: testimonialRepository,
  },
} as const;

// ---------------------------------------------------------------------------
// Named convenience re-exports so use cases can destructure cleanly:
//
//   import { neighborhoodRepository } from "@/lib/container";
// ---------------------------------------------------------------------------

export {
  neighborhoodRepository,
  userRepository,
  projectRepository,
  propertyRepository,
  inquiryRepository,
  valuationRequestRepository,
  testimonialRepository,
};
