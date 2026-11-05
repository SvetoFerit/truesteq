import { NextResponse } from "next/server";
import { submitOnboardingPackage } from "@/lib/store";
import type { OnboardingPayload } from "@/lib/types";

/**
 * POST /api/cases/:id/submit — agent onboarding package in;
 * store records claims, runs policy, may open HITL or book a demo depot.
 */
export const POST = async (
  request: Request,
  context: { params: Promise<{ id: string }> },
) => {
  const { id } = await context.params;

  try {
    const payload = (await request.json()) as OnboardingPayload;
    const onboardingCase = submitOnboardingPackage(id, payload);

    return NextResponse.json({ data: onboardingCase });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Submit failed" },
      { status: 400 },
    );
  }
};
