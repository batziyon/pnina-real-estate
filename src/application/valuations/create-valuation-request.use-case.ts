import type { ValuationRequestRepository } from "@/domain/valuation/valuation.repository";
import type { NeighborhoodRepository } from "@/domain/neighborhood/neighborhood.repository";
import type { ValuationRequestData } from "@/domain/valuation/valuation.types";
import { CreateValuationRequestSchema } from "@/validations/valuation.schema";
import { EntityNotFoundError, ValidationError } from "@/application/errors";

export class CreateValuationRequestUseCase {
  constructor(
    private readonly valuationRepository: ValuationRequestRepository,
    private readonly neighborhoodRepository: NeighborhoodRepository
  ) {}

  async execute(rawInput: unknown): Promise<ValuationRequestData> {
    const parsed = CreateValuationRequestSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid"])
      );
      throw new ValidationError("Invalid valuation request input.", fields);
    }

    const input = parsed.data;

    const neighborhood = await this.neighborhoodRepository.findById(input.neighborhoodId);
    if (!neighborhood) throw new EntityNotFoundError("Neighborhood", input.neighborhoodId);

    return this.valuationRepository.create({
      name: input.name,
      phone: input.phone,
      email: input.email ?? undefined,
      neighborhoodId: input.neighborhoodId,
      address: input.address ?? undefined,
      propertyType: input.propertyType ?? undefined,
      message: input.message ?? undefined,
    });
  }
}
