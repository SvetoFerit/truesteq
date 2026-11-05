import { NextResponse } from "next/server";
import { listAuditEntries } from "@/lib/store";

/** Newest-first timeline; optional ?caseId= to filter one onboarding case. */
export const GET = async (request: Request) => {
  const caseId = new URL(request.url).searchParams.get("caseId") ?? undefined;

  return NextResponse.json({ data: listAuditEntries(caseId) });
};
