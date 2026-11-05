import { NextResponse } from "next/server";
import { completeCustomerStepUp } from "@/lib/store";

/**
 * POST /api/cases/:id/step-up — fake eID + consent, then re-run policy.
 * Wired to Agent “Complete customer step-up”. Production: vendor webhook, not this button.
 */
export const POST = async (
  _request: Request,
  context: { params: Promise<{ id: string }> },
) => {
  const { id } = await context.params;

  try {
    const onboardingCase = completeCustomerStepUp(id);

    return NextResponse.json({ data: onboardingCase });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Step-up failed" },
      { status: 400 },
    );
  }
};
