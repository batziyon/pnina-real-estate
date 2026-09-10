import type { InquiryRepository } from "@/domain/inquiry/inquiry.repository";
import type { PropertyRepository } from "@/domain/property/property.repository";
import type { InquiryData } from "@/domain/inquiry/inquiry.types";
import { CreateInquirySchema } from "@/validations/inquiry.schema";
import { EntityNotFoundError, ValidationError } from "@/application/errors";

export class CreateInquiryUseCase {
  constructor(
    private readonly inquiryRepository: InquiryRepository,
    private readonly propertyRepository: PropertyRepository
  ) {}

  async execute(rawInput: unknown): Promise<InquiryData> {
    const parsed = CreateInquirySchema.safeParse(rawInput);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid"])
      );
      throw new ValidationError("Invalid inquiry input.", fields);
    }

    const input = parsed.data;
    const inquiryType = input.type ?? "GENERAL_CONTACT";

    // Business rule: PROPERTY_INTEREST requires a valid propertyId
    if (inquiryType === "PROPERTY_INTEREST") {
      if (!input.propertyId) {
        throw new ValidationError("Property interest inquiries require a property ID.", {
          propertyId: "Property ID is required for PROPERTY_INTEREST inquiries.",
        });
      }
      const property = await this.propertyRepository.findById(input.propertyId);
      if (!property) throw new EntityNotFoundError("Property", input.propertyId);
    }

    // GENERAL_CONTACT, COOPERATION, VALUATION_REQUEST are allowed without propertyId
    return this.inquiryRepository.create({
      propertyId: input.propertyId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      message: input.message,
      type: input.type,
    });
  }
}
