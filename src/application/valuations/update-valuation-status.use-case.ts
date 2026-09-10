import type { ValuationRequestRepository } from "@/domain/valuation/valuation.repository";
import type { ValuationRequestData } from "@/domain/valuation/valuation.types";
import { ValuationRequest } from "@/domain/valuation/valuation.entity";
import { UpdateValuationStatusSchema } from "@/validations/valuation.schema";
import {
  EntityNotFoundError,
  BusinessRuleError,
  ValidationError,
} from "@/application/errors";

export class UpdateValuationStatusUseCase {
  constructor(private readonly valuationRepository: ValuationRequestRepository) {}

  async execute(id: string, rawInput: unknown): Promise<ValuationRequestData> {
    const parsed = UpdateValuationStatusSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid"])
      );
      throw new ValidationError("Invalid status update input.", fields);
    }

    const record = await this.valuationRepository.findById(id);
    if (!record) throw new EntityNotFoundError("ValuationRequest", id);

    const entity = new ValuationRequest(record);
    if (!entity.canTransitionTo(parsed.data.status)) {
      throw new BusinessRuleError(
        `Cannot transition valuation request from "${record.status}" to "${parsed.data.status}".`
      );
    }

    return this.valuationRepository.update(id, {
      status: parsed.data.status,
      notes: parsed.data.notes,
    });
  }
}
