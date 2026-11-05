import { NextResponse } from "next/server";
import { listHitlTickets } from "@/lib/store";

/** Compliance/Ops queue of HITL tickets where policy returned require_human. */
export const GET = async () => {
  return NextResponse.json({ data: listHitlTickets() });
};
