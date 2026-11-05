import { NextResponse } from "next/server";
import { clearDemoStore } from "@/lib/store";

/** Wipe in-memory onboarding cases / HITL / audit so the demo can restart. */
export const POST = async () => {
  clearDemoStore();

  return NextResponse.json({ ok: true });
};
