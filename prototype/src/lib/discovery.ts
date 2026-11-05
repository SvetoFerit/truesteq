import type { ProviderManifest } from "./types";

/**
 * Agent discovery: “which regulated provider can open a depot, and can I trust this card?”
 * App: hardcoded mock. Production: fetch signed well-known + verify against JWKS on the firm’s domain.
 */
export const NORDFUND_MANIFEST: ProviderManifest = {
  providerId: "nordfund-de",
  legalName: "NordFund Kapitalverwaltungsgesellschaft mbH",
  brand: "NordFund",
  jurisdiction: "DE",
  baFinRegisterHint: "KVG · fictional register ID NF-2026-001",

  // Agent-discoverable offers. Production: versioned + signed catalog entries.
  // Distinct from customer delegation scope (depot.open) — this is what NordFund advertises.
  capabilities: [
    "depot.open.execution_only",
    "depot.status",
    "identity.verify.eid",
    "consent.record",
    "hitl.escalate",
  ],

  identity: {
    method: "signed_well_known",
    keyId: "did:web:agents.nordfund.example#keys-1",
    fingerprint: "NF:9F2A:C1E4:77B0:DEPO",
    verifiedAt: new Date().toISOString(),
  },

  channels: ["direct", "partner_bank"],

  // Documented escalation triggers — policy.ts is the actual enforcer.
  humanEscalation: {
    requiredWhen: [
      "suitability_incomplete",
      "advice_requested",
      "kyc_not_verified",
      "channel_conflict",
      "delegation_expired_or_unsigned",
      "manipulation_signals",
    ],
  },
};

/**
 * Body for GET /api/discover — mock signed well-known card.
 * Agents use this to learn who NordFund is and which HTTP paths to call next.
 */
export const getAgentCommerceCard = () => {
  return {
    version: "2026.1",
    discovery: "https://agents.nordfund.example/.well-known/agent-commerce",
    provider: NORDFUND_MANIFEST,
    endpoints: {
      openOnboardingCase: "/api/cases",
      submitOnboardingPackage: "/api/cases/:id/submit",
      getOnboardingCase: "/api/cases/:id",
    },
    trust: {
      note: "Prototype simulates domain-bound key verification. Production would verify signatures against published JWKS.",
    },
  };
};
