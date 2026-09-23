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

import { prisma } from "@/lib/prisma";

import { PrismaNeighborhoodRepository } from "@/infrastructure/neighborhood/prisma-neighborhood.repository";
import { PrismaUserRepository } from "@/infrastructure/user/prisma-user.repository";
import { PrismaProjectRepository } from "@/infrastructure/project/prisma-project.repository";
import { PrismaPropertyRepository } from "@/infrastructure/property/prisma-property.repository";
import { PrismaInquiryRepository } from "@/infrastructure/inquiry/prisma-inquiry.repository";
import { PrismaValuationRequestRepository } from "@/infrastructure/valuation/prisma-valuation-request.repository";
import { PrismaTestimonialRepository } from "@/infrastructure/testimonial/prisma-testimonial.repository";
import { PrismaContactRepository } from "@/infrastructure/contact/prisma-contact.repository";
import { PrismaContactNoteRepository } from "@/infrastructure/contact-note/prisma-contact-note.repository";
import { PrismaBuyerRequirementRepository } from "@/infrastructure/buyer-requirement/prisma-buyer-requirement.repository";
import { PrismaPropertyStatusHistoryRepository } from "@/infrastructure/repositories/property-status-history.repository";
import { PrismaPropertyInterestRepository } from "@/infrastructure/property-interest/prisma-property-interest.repository";
import { PrismaActivityRepository } from "@/infrastructure/activity/prisma-activity.repository";
import { PrismaTaskRepository } from "@/infrastructure/task/prisma-task.repository";

import type { NeighborhoodRepository } from "@/domain/neighborhood/neighborhood.repository";
import type { UserRepository } from "@/domain/user/user.repository";
import type { ProjectRepository } from "@/domain/project/project.repository";
import type { PropertyRepository } from "@/domain/property/property.repository";
import type { InquiryRepository } from "@/domain/inquiry/inquiry.repository";
import type { ValuationRequestRepository } from "@/domain/valuation/valuation.repository";
import type { TestimonialRepository } from "@/domain/testimonial/testimonial.repository";
import type { ContactRepository } from "@/domain/contact/contact.repository";
import type { ContactNoteRepository } from "@/domain/contact-note/contact-note.repository";
import type { BuyerRequirementRepository } from "@/domain/buyer-requirement/buyer-requirement.repository";
import type { PropertyStatusHistoryRepository } from "@/domain/property-status-history/property-status-history.repository";
import type { PropertyInterestRepository } from "@/domain/property-interest/property-interest.repository";
import type { ActivityRepository } from "@/domain/activity/activity.repository";
import type { TaskRepository } from "@/domain/task/task.repository";
import type { ObjectStoragePort } from "@/application/ports/storage/object-storage.port";

import { createObjectStorage } from "@/infrastructure/storage/storage.factory";

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

const contactRepository: ContactRepository = new PrismaContactRepository();

const contactNoteRepository: ContactNoteRepository = new PrismaContactNoteRepository();

const buyerRequirementRepository: BuyerRequirementRepository =
  new PrismaBuyerRequirementRepository();

const propertyStatusHistoryRepository: PropertyStatusHistoryRepository =
  new PrismaPropertyStatusHistoryRepository();

const propertyInterestRepository: PropertyInterestRepository =
  new PrismaPropertyInterestRepository();

const activityRepository: ActivityRepository = new PrismaActivityRepository();

const taskRepository: TaskRepository = new PrismaTaskRepository();

// ---------------------------------------------------------------------------
// Service instances — stateless services (storage, etc.)
// ---------------------------------------------------------------------------

const objectStorage: ObjectStoragePort = createObjectStorage();

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
    contact: contactRepository,
    contactNote: contactNoteRepository,
    buyerRequirement: buyerRequirementRepository,
    propertyStatusHistory: propertyStatusHistoryRepository,
    propertyInterest: propertyInterestRepository,
    activity: activityRepository,
    task: taskRepository,
  },
  services: {
    objectStorage,
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
  contactRepository,
  contactNoteRepository,
  buyerRequirementRepository,
  propertyStatusHistoryRepository,
  propertyInterestRepository,
  activityRepository,
  taskRepository,
  objectStorage,
};

// Export repositories object for direct access
export const repositories = container.repositories;

// ---------------------------------------------------------------------------
// Use case factories — instantiate application use cases with injected dependencies.
// ---------------------------------------------------------------------------

import { CreatePropertyUseCase } from "@/application/properties/create-property.use-case";
import { UpdatePropertyUseCase } from "@/application/properties/update-property.use-case";
import { GetPropertyUseCase } from "@/application/properties/get-property.use-case";
import { ListPropertiesUseCase } from "@/application/properties/list-properties.use-case";
import { PublishPropertyUseCase } from "@/application/properties/publish-property.use-case";
import { UnpublishPropertyUseCase } from "@/application/properties/unpublish-property.use-case";
import { ArchivePropertyUseCase } from "@/application/properties/archive-property.use-case";
import { MarkPropertyUnderContractUseCase } from "@/application/properties/mark-under-contract.use-case";
import { RepublishPropertyUseCase } from "@/application/properties/republish-property.use-case";
import { MarkPropertySoldUseCase } from "@/application/properties/mark-sold.use-case";
import { MarkPropertyRentedUseCase } from "@/application/properties/mark-rented.use-case";
import { GetPropertyStatusHistoryUseCase } from "@/application/properties/get-property-status-history.use-case";
import { GetPropertyStatisticsUseCase } from "@/application/properties/get-property-statistics.use-case";
import { GenerateImageUploadUseCase } from "@/application/properties/media/generate-image-upload.use-case";
import { ConfirmImageUploadUseCase } from "@/application/properties/media/confirm-image-upload.use-case";
import { DeleteImageUseCase } from "@/application/properties/media/delete-image.use-case";
import { SetMainImageUseCase } from "@/application/properties/media/set-main-image.use-case";
import { ReorderImagesUseCase } from "@/application/properties/media/reorder-images.use-case";
import { GenerateVideoUploadUseCase } from "@/application/properties/media/generate-video-upload.use-case";
import { ConfirmVideoUploadUseCase } from "@/application/properties/media/confirm-video-upload.use-case";
import { DeleteVideoUseCase } from "@/application/properties/media/delete-video.use-case";
import { ReorderVideosUseCase } from "@/application/properties/media/reorder-videos.use-case";

import { CreateProjectUseCase } from "@/application/projects/create-project.use-case";
import { UpdateProjectUseCase } from "@/application/projects/update-project.use-case";
import { GetProjectUseCase } from "@/application/projects/get-project.use-case";
import { ListProjectsUseCase } from "@/application/projects/list-projects.use-case";
import { GetProjectStatisticsUseCase } from "@/application/projects/get-project-statistics.use-case";

import { ListNeighborhoodsUseCase } from "@/application/neighborhoods/list-neighborhoods.use-case";
import { ManageNeighborhoodUseCase } from "@/application/neighborhoods/manage-neighborhood.use-case";

import { CreateInquiryUseCase } from "@/application/inquiries/create-inquiry.use-case";
import { ListInquiriesUseCase } from "@/application/inquiries/list-inquiries.use-case";
import { UpdateInquiryStatusUseCase } from "@/application/inquiries/update-inquiry-status.use-case";

import { CreateValuationRequestUseCase } from "@/application/valuations/create-valuation-request.use-case";
import { ListValuationRequestsUseCase } from "@/application/valuations/list-valuation-requests.use-case";
import { UpdateValuationStatusUseCase } from "@/application/valuations/update-valuation-status.use-case";

import { CreateTestimonialUseCase } from "@/application/testimonials/create-testimonial.use-case";
import { GetTestimonialUseCase } from "@/application/testimonials/get-testimonial.use-case";
import { UpdateTestimonialUseCase } from "@/application/testimonials/update-testimonial.use-case";
import { ListPublicTestimonialsUseCase } from "@/application/testimonials/list-public-testimonials.use-case";
import { ApproveTestimonialUseCase } from "@/application/testimonials/approve-testimonial.use-case";
import { RejectTestimonialUseCase } from "@/application/testimonials/reject-testimonial.use-case";

import { GetUserUseCase } from "@/application/users/get-user.use-case";
import { ListUsersUseCase } from "@/application/users/list-users.use-case";
import { CreateUserUseCase } from "@/application/users/create-user.use-case";
import { UpdateUserUseCase } from "@/application/users/update-user.use-case";

import { LoginUseCase } from "@/application/auth/login.use-case";
import { CreateUserWithPasswordUseCase } from "@/application/auth/create-user-with-password.use-case";

import { CreateContactUseCase } from "@/application/contacts/create-contact.use-case";
import { UpdateContactUseCase } from "@/application/contacts/update-contact.use-case";
import { GetContactUseCase } from "@/application/contacts/get-contact.use-case";
import { ListContactsUseCase } from "@/application/contacts/list-contacts.use-case";
import { GetContactStatisticsUseCase } from "@/application/contacts/get-contact-statistics.use-case";

import { CreateContactNoteUseCase } from "@/application/contact-notes/create-contact-note.use-case";
import { ListContactNotesUseCase } from "@/application/contact-notes/list-contact-notes.use-case";
import { UpdateContactNoteUseCase } from "@/application/contact-notes/update-contact-note.use-case";

import { CreateBuyerRequirementUseCase } from "@/application/buyer-requirements/create-buyer-requirement.use-case";
import { UpdateBuyerRequirementUseCase } from "@/application/buyer-requirements/update-buyer-requirement.use-case";
import { GetBuyerRequirementUseCase } from "@/application/buyer-requirements/get-buyer-requirement.use-case";
import { ListContactBuyerRequirementsUseCase } from "@/application/buyer-requirements/list-contact-buyer-requirements.use-case";
import { DeactivateBuyerRequirementUseCase } from "@/application/buyer-requirements/deactivate-buyer-requirement.use-case";

import { CreatePropertyInterestUseCase } from "@/application/property-interests/create-property-interest.use-case";
import { UpdatePropertyInterestStatusUseCase } from "@/application/property-interests/update-property-interest-status.use-case";
import { GetPropertyInterestUseCase } from "@/application/property-interests/get-property-interest.use-case";
import { ListPropertyInterestsByPropertyUseCase } from "@/application/property-interests/list-property-interests-by-property.use-case";
import { ListPropertyInterestsByContactUseCase } from "@/application/property-interests/list-property-interests-by-contact.use-case";
import { DeletePropertyInterestUseCase } from "@/application/property-interests/delete-property-interest.use-case";

import { CreateActivityUseCase } from "@/application/activities/create-activity.use-case";
import { ListActivitiesUseCase } from "@/application/activities/list-activities.use-case";
import { UpdateActivityUseCase } from "@/application/activities/update-activity.use-case";
import { DeleteActivityUseCase } from "@/application/activities/delete-activity.use-case";

import { CreateTaskUseCase } from "@/application/tasks/create-task.use-case";
import { ListTasksUseCase } from "@/application/tasks/list-tasks.use-case";
import { UpdateTaskUseCase } from "@/application/tasks/update-task.use-case";
import { CompleteTaskUseCase } from "@/application/tasks/complete-task.use-case";
import { DeleteTaskUseCase } from "@/application/tasks/delete-task.use-case";

import { CreatePropertyFromAIUseCase } from "@/ai/application/use-cases/create-property-from-ai.use-case";
import { CreateContactFromAIUseCase } from "@/ai/application/use-cases/create-contact-from-ai.use-case";
import { getAIPropertyExtractor, getAIContactExtractor } from "@/lib/ai-container";

export const useCases = {
  properties: {
    create: new CreatePropertyUseCase(propertyRepository, neighborhoodRepository, userRepository),
    update: new UpdatePropertyUseCase(propertyRepository, neighborhoodRepository),
    get: new GetPropertyUseCase(propertyRepository),
    list: new ListPropertiesUseCase(propertyRepository),
    publish: new PublishPropertyUseCase(propertyRepository, propertyStatusHistoryRepository),
    unpublish: new UnpublishPropertyUseCase(propertyRepository, propertyStatusHistoryRepository),
    archive: new ArchivePropertyUseCase(propertyRepository, propertyStatusHistoryRepository),
    markUnderContract: new MarkPropertyUnderContractUseCase(propertyRepository, propertyStatusHistoryRepository),
    republish: new RepublishPropertyUseCase(propertyRepository, propertyStatusHistoryRepository),
    markSold: new MarkPropertySoldUseCase(propertyRepository, propertyStatusHistoryRepository),
    markRented: new MarkPropertyRentedUseCase(propertyRepository, propertyStatusHistoryRepository),
    getStatusHistory: new GetPropertyStatusHistoryUseCase(propertyRepository, propertyStatusHistoryRepository),
    getStatistics: new GetPropertyStatisticsUseCase(propertyRepository),
    generateImageUpload: new GenerateImageUploadUseCase(propertyRepository, objectStorage),
    confirmImageUpload: new ConfirmImageUploadUseCase(propertyRepository, objectStorage),
    deleteImage: new DeleteImageUseCase(propertyRepository, objectStorage),
    setMainImage: new SetMainImageUseCase(propertyRepository),
    reorderImages: new ReorderImagesUseCase(propertyRepository),
    generateVideoUpload: new GenerateVideoUploadUseCase(propertyRepository, objectStorage),
    confirmVideoUpload: new ConfirmVideoUploadUseCase(propertyRepository, objectStorage),
    deleteVideo: new DeleteVideoUseCase(propertyRepository, objectStorage),
    reorderVideos: new ReorderVideosUseCase(propertyRepository),
  },
  projects: {
    create: new CreateProjectUseCase(projectRepository, neighborhoodRepository),
    update: new UpdateProjectUseCase(projectRepository, neighborhoodRepository),
    get: new GetProjectUseCase(projectRepository),
    list: new ListProjectsUseCase(projectRepository),
    getStatistics: new GetProjectStatisticsUseCase(projectRepository),
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
    get: new GetTestimonialUseCase(testimonialRepository),
    update: new UpdateTestimonialUseCase(testimonialRepository),
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
  contacts: {
    create: new CreateContactUseCase(contactRepository, userRepository),
    update: new UpdateContactUseCase(contactRepository, userRepository),
    get: new GetContactUseCase(contactRepository),
    list: new ListContactsUseCase(contactRepository),
    getStatistics: new GetContactStatisticsUseCase(
      contactRepository,
      buyerRequirementRepository,
      propertyInterestRepository
    ),
  },
  contactNotes: {
    create: new CreateContactNoteUseCase(contactNoteRepository, contactRepository),
    list: new ListContactNotesUseCase(contactNoteRepository, contactRepository),
    update: new UpdateContactNoteUseCase(contactNoteRepository),
  },
  buyerRequirements: {
    create: new CreateBuyerRequirementUseCase(
      buyerRequirementRepository,
      contactRepository,
      neighborhoodRepository
    ),
    update: new UpdateBuyerRequirementUseCase(
      buyerRequirementRepository,
      contactRepository,
      neighborhoodRepository
    ),
    get: new GetBuyerRequirementUseCase(
      buyerRequirementRepository,
      contactRepository
    ),
    listByContact: new ListContactBuyerRequirementsUseCase(
      buyerRequirementRepository,
      contactRepository
    ),
    deactivate: new DeactivateBuyerRequirementUseCase(
      buyerRequirementRepository,
      contactRepository
    ),
  },
  propertyInterests: {
    create: new CreatePropertyInterestUseCase(
      propertyInterestRepository,
      contactRepository,
      propertyRepository
    ),
    update: new UpdatePropertyInterestStatusUseCase(
      propertyInterestRepository,
      contactRepository,
      propertyRepository
    ),
    get: new GetPropertyInterestUseCase(
      propertyInterestRepository,
      contactRepository,
      propertyRepository
    ),
    listByProperty: new ListPropertyInterestsByPropertyUseCase(
      propertyInterestRepository,
      propertyRepository
    ),
    listByContact: new ListPropertyInterestsByContactUseCase(
      propertyInterestRepository,
      contactRepository
    ),
    delete: new DeletePropertyInterestUseCase(
      propertyInterestRepository,
      contactRepository,
      propertyRepository
    ),
  },
  activities: {
    create: new CreateActivityUseCase(activityRepository),
    list: new ListActivitiesUseCase(activityRepository),
    update: new UpdateActivityUseCase(activityRepository),
    delete: new DeleteActivityUseCase(activityRepository),
  },
  tasks: {
    create: new CreateTaskUseCase(taskRepository),
    list: new ListTasksUseCase(taskRepository),
    update: new UpdateTaskUseCase(taskRepository),
    complete: new CompleteTaskUseCase(taskRepository),
    delete: new DeleteTaskUseCase(taskRepository),
  },
  // AI use cases with lazy initialization (requires GEMINI_API_KEY at runtime)
  get ai() {
    return {
      get createPropertyFromText() {
        return new CreatePropertyFromAIUseCase(
          getAIPropertyExtractor(),
          propertyRepository,
          neighborhoodRepository
        );
      },
      get createContactFromText() {
        return new CreateContactFromAIUseCase(
          getAIContactExtractor()
        );
      },
    };
  },
} as const;
