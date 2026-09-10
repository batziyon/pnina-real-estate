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

// ---------------------------------------------------------------------------
// Use case factories — instantiate application use cases with injected dependencies.
// ---------------------------------------------------------------------------

import { CreatePropertyUseCase } from "@/application/properties/create-property.use-case";
import { UpdatePropertyUseCase } from "@/application/properties/update-property.use-case";
import { GetPropertyUseCase } from "@/application/properties/get-property.use-case";
import { ListPropertiesUseCase } from "@/application/properties/list-properties.use-case";
import { PublishPropertyUseCase } from "@/application/properties/publish-property.use-case";
import { ArchivePropertyUseCase } from "@/application/properties/archive-property.use-case";

import { CreateProjectUseCase } from "@/application/projects/create-project.use-case";
import { UpdateProjectUseCase } from "@/application/projects/update-project.use-case";
import { GetProjectUseCase } from "@/application/projects/get-project.use-case";
import { ListProjectsUseCase } from "@/application/projects/list-projects.use-case";

import { ListNeighborhoodsUseCase } from "@/application/neighborhoods/list-neighborhoods.use-case";
import { ManageNeighborhoodUseCase } from "@/application/neighborhoods/manage-neighborhood.use-case";

import { CreateInquiryUseCase } from "@/application/inquiries/create-inquiry.use-case";
import { ListInquiriesUseCase } from "@/application/inquiries/list-inquiries.use-case";
import { UpdateInquiryStatusUseCase } from "@/application/inquiries/update-inquiry-status.use-case";

import { CreateValuationRequestUseCase } from "@/application/valuations/create-valuation-request.use-case";
import { ListValuationRequestsUseCase } from "@/application/valuations/list-valuation-requests.use-case";
import { UpdateValuationStatusUseCase } from "@/application/valuations/update-valuation-status.use-case";

import { CreateTestimonialUseCase } from "@/application/testimonials/create-testimonial.use-case";
import { ListPublicTestimonialsUseCase } from "@/application/testimonials/list-public-testimonials.use-case";
import { ApproveTestimonialUseCase } from "@/application/testimonials/approve-testimonial.use-case";
import { RejectTestimonialUseCase } from "@/application/testimonials/reject-testimonial.use-case";

import { GetUserUseCase } from "@/application/users/get-user.use-case";
import { ListUsersUseCase } from "@/application/users/list-users.use-case";
import { CreateUserUseCase } from "@/application/users/create-user.use-case";
import { UpdateUserUseCase } from "@/application/users/update-user.use-case";

import { LoginUseCase } from "@/application/auth/login.use-case";
import { CreateUserWithPasswordUseCase } from "@/application/auth/create-user-with-password.use-case";

export const useCases = {
  properties: {
    create: new CreatePropertyUseCase(propertyRepository, neighborhoodRepository, userRepository),
    update: new UpdatePropertyUseCase(propertyRepository, neighborhoodRepository),
    get: new GetPropertyUseCase(propertyRepository),
    list: new ListPropertiesUseCase(propertyRepository),
    publish: new PublishPropertyUseCase(propertyRepository),
    archive: new ArchivePropertyUseCase(propertyRepository),
  },
  projects: {
    create: new CreateProjectUseCase(projectRepository, neighborhoodRepository),
    update: new UpdateProjectUseCase(projectRepository, neighborhoodRepository),
    get: new GetProjectUseCase(projectRepository),
    list: new ListProjectsUseCase(projectRepository),
  },
  neighborhoods: {
    list: new ListNeighborhoodsUseCase(neighborhoodRepository),
    manage: new ManageNeighborhoodUseCase(neighborhoodRepository),
  },
  inquiries: {
    create: new CreateInquiryUseCase(inquiryRepository, propertyRepository),
    list: new ListInquiriesUseCase(inquiryRepository),
    updateStatus: new UpdateInquiryStatusUseCase(inquiryRepository),
  },
  valuations: {
    create: new CreateValuationRequestUseCase(valuationRequestRepository, neighborhoodRepository),
    list: new ListValuationRequestsUseCase(valuationRequestRepository),
    updateStatus: new UpdateValuationStatusUseCase(valuationRequestRepository),
  },
  testimonials: {
    create: new CreateTestimonialUseCase(testimonialRepository),
    listPublic: new ListPublicTestimonialsUseCase(testimonialRepository),
    approve: new ApproveTestimonialUseCase(testimonialRepository),
    reject: new RejectTestimonialUseCase(testimonialRepository),
  },
  users: {
    get: new GetUserUseCase(userRepository),
    list: new ListUsersUseCase(userRepository),
    create: new CreateUserUseCase(userRepository),
    update: new UpdateUserUseCase(userRepository),
  },
  auth: {
    login: new LoginUseCase(userRepository),
    createUserWithPassword: new CreateUserWithPasswordUseCase(userRepository),
  },
} as const;
