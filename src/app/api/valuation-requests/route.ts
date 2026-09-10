import { NextRequest, NextResponse } from "next/server";
import { useCases } from "@/lib/container";
import { toValuationRequestCreatedDTO } from "@/controllers/dtos";
import { handleApiError } from "@/controllers/api-error-handler";

/**
 * POST /api/valuation-requests
 *
 * Creates a new valuation request.
 * Validation and business rules are enforced by CreateValuationRequestUseCase.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const valuation = await useCases.valuations.create.execute(body);

    return NextResponse.json(toValuationRequestCreatedDTO(valuation), {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
