import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";

export async function GET(req: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;

    const result = await useCases.inquiries.list.execute(
      {
        status: status as "NEW" | "CONTACTED" | "IN_PROGRESS" | "CLOSED" | undefined,
        type: type as "PROPERTY_INTEREST" | "VALUATION_REQUEST" | "COOPERATION" | "GENERAL_CONTACT" | undefined,
      },
      { page, pageSize }
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}
