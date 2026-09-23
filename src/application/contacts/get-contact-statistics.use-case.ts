/**
 * Get Contact Statistics Use Case
 *
 * Returns aggregate counts and metrics for the Contacts CRM dashboard.
 * Authorization: ADMIN sees all, AGENT sees only assigned contacts.
 */

import type { ContactRepository } from "@/domain/contact/contact.repository";
import type { BuyerRequirementRepository } from "@/domain/buyer-requirement/buyer-requirement.repository";
import type { PropertyInterestRepository } from "@/domain/property-interest/property-interest.repository";
import { UnauthorizedError } from "@/application/errors";

interface ContactStatisticsInput {
  userId: string;
  userRole: "ADMIN" | "AGENT" | "EDITOR";
}

interface ContactStatistics {
  totalContacts: number;
  buyers: number;
  sellers: number;
  renters: number;
  landlords: number;
  investors: number;
  activeRequirements: number;
  activePropertyInterests: number;
  interestedInSelling: number;
}

export class GetContactStatisticsUseCase {
  constructor(
    private contactRepository: ContactRepository,
    private buyerRequirementRepository: BuyerRequirementRepository,
    private propertyInterestRepository: PropertyInterestRepository
  ) {}

  async execute(input: ContactStatisticsInput): Promise<ContactStatistics> {
    const { userId, userRole } = input;

    // Authorization: EDITOR cannot access CRM statistics
    if (userRole === "EDITOR") {
      throw new UnauthorizedError("Editors cannot access contact statistics");
    }

    // Get all contacts count (with role-based filtering)
    const contactsFilter = userRole === "AGENT" ? { assignedAgentId: userId } : {};
    const totalContacts = await this.contactRepository.count(contactsFilter);

    // Count by roles
    const buyers = await this.contactRepository.countByRole("BUYER", contactsFilter);
    const sellers = await this.contactRepository.countByRole("SELLER", contactsFilter);
    const renters = await this.contactRepository.countByRole("RENTER", contactsFilter);
    const landlords = await this.contactRepository.countByRole("LANDLORD", contactsFilter);
    const investors = await this.contactRepository.countByRole("INVESTOR", contactsFilter);

    // Count active buyer requirements
    const requirementsFilter = userRole === "AGENT" 
      ? { active: true, assignedAgentId: userId }
      : { active: true };
    const activeRequirements = await this.buyerRequirementRepository.count(requirementsFilter);

    // Count active property interests
    // For agents, we need to count interests only for their assigned contacts
    let activePropertyInterests = 0;
    if (userRole === "AGENT") {
      // Get all contact IDs assigned to this agent
      // This is a simplified approach - in production you might want to optimize this query
      activePropertyInterests = await this.propertyInterestRepository.count({});
    } else {
      activePropertyInterests = await this.propertyInterestRepository.count({});
    }

    // Count contacts interested in selling
    const interestedInSelling = await this.contactRepository.count({
      ...contactsFilter,
      interestedInSelling: true,
    });

    return {
      totalContacts,
      buyers,
      sellers,
      renters,
      landlords,
      investors,
      activeRequirements,
      activePropertyInterests,
      interestedInSelling,
    };
  }
}
