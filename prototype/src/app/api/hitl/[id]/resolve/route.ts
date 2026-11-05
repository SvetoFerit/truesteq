import { NextResponse } from "next/server";
import { resolveHitlTicket } from "@/lib/store";

/**
 * POST /api/hitl/:id/resolve — Provider Approve / Reject.
 * Closes fail-closed loop: policy stopped autonomy → human decides → audit (+ depot if approved).
 */
export const POST = async (
  request: Request,
  context: { params: Promise<{ id: string }> },
) => {
  const { id } = await context.params;

  const body = (await request.json()) as {
    decision: "approved" | "rejected";
    note?: string;
  };

  if (body.decision !== "approved" && body.decision !== "rejected") {
    return NextResponse.json(
      { error: "decision must be approved|rejected" },
      { status: 422 },
    );
  }

  try {
    const result = resolveHitlTicket(id, body.decision, body.note ?? "");

    return NextResponse.json({ data: result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Resolve failed" },
      { status: 400 },
    );
  }
};
