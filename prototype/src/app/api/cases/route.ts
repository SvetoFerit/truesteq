import { NextResponse } from "next/server";
import { openOnboardingCase } from "@/lib/store";
import type { DelegationToken } from "@/lib/types";

/**
 * POST /api/cases — open an onboarding case with the customer’s scoped delegation.
 * Called by Agent “Run agent flow” after discovery.
 */
export const POST = async (request: Request) => {
  const body = (await request.json()) as { delegation: DelegationToken };

  if (!body?.delegation?.subjectName) {
    return NextResponse.json(
      { error: "delegation.subjectName required" },
      { status: 422 },
    );
  }

  const onboardingCase = openOnboardingCase(body.delegation);

  return NextResponse.json({ data: onboardingCase }, { status: 201 });
};
