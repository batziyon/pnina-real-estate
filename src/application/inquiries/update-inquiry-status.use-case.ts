import type { InquiryRepository } from "@/domain/inquiry/inquiry.repository";
import type { InquiryData } from "@/domain/inquiry/inquiry.types";
import { Inquiry } from "@/domain/inquiry/inquiry.entity";
import { UpdateInquiryStatusSchema } from "@/validations/inquiry.schema";
import {
  EntityNotFoundError,
  BusinessRuleError,
  ValidationError,
} from "@/application/errors";

export class UpdateInquiryStatusUseCase {
  constructor(private readonly inquiryRepository: InquiryRepository) {}

  async execute(id: string, rawInput: unknown): Promise<InquiryData> {
    const parsed = UpdateInquiryStatusSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid"])
      );
      throw new ValidationError("Invalid status update input.", fields);
    }

    const record = await this.inquiryRepository.findById(id);
    if (!record) throw new EntityNotFoundError("Inquiry", id);

    const entity = new Inquiry(record);
    if (!entity.canTransitionTo(parsed.data.status)) {
      throw new BusinessRuleError(
        `Cannot transition inquiry from "${record.status}" to "${parsed.data.status}".`
      );
    }

    return this.inquiryRepository.update(id, {
      status: parsed.data.status,
      notes: parsed.data.notes ?? undefined,
    });
  }
}
