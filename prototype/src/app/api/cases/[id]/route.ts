import { NextResponse } from "next/server";
import { getOnboardingCase, listAuditEntries } from "@/lib/store";

/** Inspect one onboarding case + its audit slice (Provider “Inspect case”). */
export const GET = async (
  _request: Request,
  context: { params: Promise<{ id: string }> },
) => {
  const { id } = await context.params;
  const onboardingCase = getOnboardingCase(id);

  if (!onboardingCase) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: onboardingCase,
    audit: listAuditEntries(id),
  });
};
