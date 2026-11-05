import type {
  DelegationToken,
  OnboardingPayload,
  PolicyDecision,
  PolicyOutcome,
} from "./types";

/** Demo-only phrases in agentNotes that force HITL (SEC-001). Free text never grants powers. */
const MANIPULATION_PHRASES = [
  "ignore previous",
  "bypass policy",
  "act as admin",
] as const;

/** One outcome + one reason + one stable ruleId — avoids repeating array boilerplate. */
const rule = (
  outcome: PolicyOutcome,
  reason: string,
  ruleId: string,
): PolicyDecision => {
  return { outcome, reasons: [reason], ruleIds: [ruleId] };
};

/**
 * Deterministic policy engine — the product of the case study.
 * Fail closed: unclear / high-risk → step-up or human, never silent auto-close.
 *
 * ruleIds (DEL-001, KYC-002, …) are stable machine codes for audit/metrics/Support:
 * reasons are human prose and may be reworded; ruleIds stay comparable across releases.
 */
export const evaluateOnboardingPolicy = (
  delegation: DelegationToken,
  payload: OnboardingPayload,
): PolicyDecision => {
  // Authority first: without a signed, unexpired, in-scope mandate, stop hard.
  if (!delegation.signed) {
    return rule(
      "reject",
      "Delegation token is not signed — cannot prove customer authority.",
      "DEL-001",
    );
  }

  if (new Date(delegation.expiresAt).getTime() < Date.now()) {
    return rule(
      "reject",
      "Delegation expired — agent may not act for the customer.",
      "DEL-002",
    );
  }

  // depot.open = permission name on the token, not a folder / product SKU.
  if (!delegation.scope.includes("depot.open")) {
    return rule("reject", "Delegation scope excludes depot.open.", "DEL-003");
  }

  // Channel conflict: partner-bank-attributed traffic must keep partner attribution.
  if (delegation.channel === "partner_bank" && !delegation.partnerBankId) {
    return rule(
      "require_human",
      "Partner-bank channel without partnerBankId — channel conflict risk.",
      "CH-001",
    );
  }

  // KYC / consent: agent may prefill; natural person (or vendor) must prove identity + accept.
  if (payload.kycStatus === "failed") {
    return rule("reject", "KYC failed — cannot open depot.", "KYC-001");
  }

  if (payload.kycStatus !== "verified") {
    return rule(
      "require_step_up",
      "KYC not verified — natural-person step-up required (eID / VideoIdent).",
      "KYC-002",
    );
  }

  if (payload.kycMethod === "deferred") {
    return rule(
      "require_step_up",
      "Deferred KYC is not allowed for autonomous close.",
      "KYC-003",
    );
  }

  if (!payload.contractAccepted) {
    return rule(
      "require_step_up",
      "Contract not accepted by attributable customer consent.",
      "CON-001",
    );
  }

  // Incomplete tax → human (not silent invent); advice / low knowledge → HITL (WpHG idea).
  if (!payload.taxId || payload.taxId.length < 5) {
    return rule("require_human", "Tax identification incomplete.", "TAX-001");
  }

  if (payload.wantsAdvice) {
    return rule(
      "require_human",
      "Customer requests advice — automated execution-only close is not permitted.",
      "ADV-001",
    );
  }

  if (payload.knowledgeScore < 40) {
    return rule(
      "require_human",
      "Self-reported knowledge/experience below threshold for unsupervised appropriateness.",
      "SUIT-001",
    );
  }

  const notes = (payload.agentNotes ?? "").toLowerCase();

  if (MANIPULATION_PHRASES.some((phrase) => notes.includes(phrase))) {
    return rule(
      "require_human",
      "Manipulation signal in agent notes — escalate to human + security.",
      "SEC-001",
    );
  }

  if (payload.riskTolerance === "high" && payload.knowledgeScore < 70) {
    return rule(
      "require_human",
      "High risk tolerance with moderate knowledge — human review.",
      "SUIT-002",
    );
  }

  return rule(
    "allow_auto",
    "All hard gates passed for execution-only autonomous close.",
    "OK-001",
  );
};
