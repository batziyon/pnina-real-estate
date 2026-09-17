import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    const history = await useCases.properties.getStatusHistory.execute(id, {
      id: user.id,
      role: user.role,
    });

    return NextResponse.json(history);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to retrieve status history" }, { status: 500 });
  }
}
