import { NextResponse } from "next/server";
import { getAgentCommerceCard } from "@/lib/discovery";

/** Agent discovery endpoint — stand-in for signed .well-known agent-commerce card. */
export const GET = async () => {
  return NextResponse.json(getAgentCommerceCard());
};
