import { NextRequest, NextResponse } from "next/server";
import { useCases } from "@/lib/container";
import { toInquiryCreatedDTO } from "@/controllers/dtos";
import { handleApiError } from "@/controllers/api-error-handler";

/**
 * POST /api/inquiries
 *
 * Creates a new inquiry.
 *
 * Supported types:
 * - PROPERTY_INTEREST (requires propertyId)
 * - GENERAL_CONTACT (propertyId optional)
 * - COOPERATION (propertyId optional)
 * - VALUATION_REQUEST (propertyId optional)
 *
 * Business rules and validation are enforced by CreateInquiryUseCase.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inquiry = await useCases.inquiries.create.execute(body);

    return NextResponse.json(toInquiryCreatedDTO(inquiry), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
