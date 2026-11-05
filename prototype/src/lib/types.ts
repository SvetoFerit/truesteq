/**
 * Domain model for the NordFund agent-commerce demo.
 * Interview lens: claims (current facts + who said them) ≠ audit (timeline) ≠ HITL (human queue).
 */

/** Who introduced the customer — partner channel must keep partnerBankId (CH-001). */
export type Channel = "direct" | "partner_bank";

/**
 * Lifecycle of one depot-opening attempt (OnboardingCase).
 * collecting → policy_review → allow_auto | awaiting_step_up | awaiting_human | rejected | completed
 */
export type OnboardingStatus =
  | "collecting"
  | "policy_review"
  | "awaiting_human"
  | "awaiting_step_up"
  | "completed"
  | "rejected";

/** Provenance for a field value — never treat agent text as verified truth alone. */
export type ClaimSource =
  "agent_asserted" | "system_verified" | "human_confirmed";

/** Stable claim keys for the case file / Provider table (folder-style labels). */
export type ClaimField =
  | "customer.name"
  | "delegation.scope"
  | "channel"
  | "tax.residency"
  | "tax.id"
  | "suitability.knowledge"
  | "kyc.status"
  | "contract.accepted"
  | "depot.id";

/** One field on an onboarding case, with who asserted it. */
export interface FieldClaim {
  field: ClaimField;
  value: string;
  source: ClaimSource;
}

/** Batch of claims to write in one pass: field → value + provenance. */
export type ClaimBatch = Partial<
  Record<ClaimField, { value: string; source: ClaimSource }>
>;

/**
 * What an agent learns at discovery time (“is this really NordFund, what can it do?”).
 * Production: signed well-known + JWKS; here fingerprint is a display stand-in.
 */
export interface ProviderManifest {
  providerId: string;
  legalName: string;
  brand: string;
  jurisdiction: string;
  baFinRegisterHint: string;
  /** Catalog of offers (e.g. depot.open.execution_only) — not the customer’s permission. */
  capabilities: string[];
  identity: {
    method: "signed_well_known";
    keyId: string;
    fingerprint: string;
    verifiedAt: string;
  };
  channels: Channel[];
  humanEscalation: {
    requiredWhen: string[];
  };
}

/**
 * Customer mandate for their AI (not a browser login).
 * e.g. scope includes "depot.open" = may request opening a securities account.
 * Production: cryptographically verifiable; here signed is a demo boolean.
 */
export interface DelegationToken {
  subjectName: string;
  subjectId: string;
  scope: string[];
  expiresAt: string;
  channel: Channel;
  partnerBankId?: string;
  signed: boolean;
}

/**
 * Package the agent submits after discovery + delegation.
 * Fields map to policy gates (KYC, suitability, advice, tax, consent, injection heuristics).
 */
export interface OnboardingPayload {
  productId: string;
  taxResidency: string;
  taxId: string;
  /** 0–100, agent-reported experience (production: questionnaire). */
  knowledgeScore: number;
  riskTolerance: "low" | "medium" | "high";
  wantsAdvice: boolean;
  kycMethod: "eid" | "video" | "deferred";
  kycStatus: "pending" | "verified" | "failed";
  contractAccepted: boolean;
  /** Free text must never grant powers — SEC-001 scans for manipulation phrases. */
  agentNotes?: string;
}

export type PolicyOutcome =
  "allow_auto" | "require_step_up" | "require_human" | "reject";

export interface PolicyDecision {
  /**
   * Fail-closed outcomes:
   * allow_auto = evidence enough for autonomous close;
   * require_step_up = natural person must finish KYC/consent;
   * require_human = HITL queue;
   * reject = hard stop.
   */
  outcome: PolicyOutcome;
  reasons: string[];
  /** Stable codes (SUIT-001) for audit/metrics; reasons are human-readable prose. */
  ruleIds: string[];
}

/** One timeline event — history of actions on an onboarding case. */
export interface AuditEntry {
  id: string;
  at: string;
  caseId: string;
  event: string;
  detail: string;
  source: ClaimSource | "system";
}

export type HitlStatus = "open" | "approved" | "rejected";

/** Human-in-the-loop ticket when policy refuses autonomous close (points at an OnboardingCase). */
export interface HitlTicket {
  id: string;
  caseId: string;
  createdAt: string;
  reason: string;
  ruleIds: string[];
  status: HitlStatus;
  resolvedAt?: string;
  resolverNote?: string;
}

/**
 * One depot-opening attempt (“onboarding case”) — not a browser login.
 * claims[] = current fields + who asserted them (shown on Provider).
 */
export interface OnboardingCase {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: OnboardingStatus;
  delegation: DelegationToken;
  payload?: OnboardingPayload;
  policy?: PolicyDecision;
  /** Fake custody booking id (NF-DEP-…) — production would return the real core account number. */
  depotId?: string;
  claims: FieldClaim[];
}
