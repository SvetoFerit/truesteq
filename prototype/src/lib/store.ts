import { randomUUID } from "crypto";
import type {
  AuditEntry,
  ClaimBatch,
  ClaimField,
  ClaimSource,
  DelegationToken,
  HitlTicket,
  OnboardingPayload,
  OnboardingCase,
} from "./types";
import { evaluateOnboardingPolicy } from "./policy";

/** Cap audit length so long demo sessions don’t grow forever in RAM. */
const MAX_AUDIT_ENTRIES = 200;

/**
 * In-memory “DB” for the demo (not Postgres / not on disk).
 * Lives in the Node process; shared by all API routes via getStore().
 *
 * - cases: one depot-opening attempt each (look up by id for submit / HITL / audit)
 * - hitlTickets: human review queue when policy returns require_human
 * - auditLog: ordered timeline of what happened (newest first)
 */
interface DemoStore {
  cases: Map<string, OnboardingCase>;
  hitlTickets: Map<string, HitlTicket>;
  auditLog: AuditEntry[];
}

/**
 * Hang the store on globalThis (not a plain module `let`).
 * Why: Next.js hot-reload re-runs this file and would reset a module variable;
 * globalThis survives that reload so mid-demo data stays. Still wiped if you
 * stop the Node process — not durable storage.
 */
const globalForStore = globalThis as unknown as {
  __nordfundStoreV2?: DemoStore;
};

/** Fresh empty Maps/array — used on first boot and on Reset. */
const emptyStore = (): DemoStore => {
  return {
    cases: new Map(),
    hitlTickets: new Map(),
    auditLog: [],
  };
};

/** Singleton accessor: create once, then always return the same DemoStore. */
const getStore = (): DemoStore => {
  if (!globalForStore.__nordfundStoreV2) {
    globalForStore.__nordfundStoreV2 = emptyStore();
  }
  return globalForStore.__nordfundStoreV2;
};

const isoNow = () => {
  return new Date().toISOString();
};

/**
 * Fake custody/core booking id (NF-DEP-…).
 * Production would call the bank ledger API and store the real depot number returned.
 */
const mintDemoDepotId = (caseId: string) => {
  return `NF-DEP-${caseId.slice(0, 8).toUpperCase()}`;
};

/** Load a case or throw — used by submit / step-up / HITL so missing ids fail loud. */
const requireOnboardingCase = (caseId: string): OnboardingCase => {
  const onboardingCase = getStore().cases.get(caseId);

  if (!onboardingCase) {
    throw new Error("Onboarding case not found");
  }

  return onboardingCase;
};

/**
 * Append one audit timeline event for a case.
 * Claims = current facts + who said them; audit = history (“what happened, when?”).
 * unshift → newest first in Provider UI; trim to MAX_AUDIT_ENTRIES.
 */
const recordAuditEvent = (
  caseId: string,
  event: string,
  detail: string,
  source: AuditEntry["source"] = "system",
) => {
  const store = getStore();
  store.auditLog.unshift({
    id: randomUUID(),
    at: isoNow(),
    caseId,
    event,
    detail,
    source,
  });
  if (store.auditLog.length > MAX_AUDIT_ENTRIES) {
    store.auditLog.length = MAX_AUDIT_ENTRIES;
  }
};

/**
 * Write many claims onto a case in one pass (mutates onboardingCase.claims).
 * Why mutate: the case object already sits in the store Map; updating it updates
 * what Provider “Inspect case” will show. Upserts by field name.
 */
const applyClaims = (onboardingCase: OnboardingCase, batch: ClaimBatch) => {
  for (const [field, entry] of Object.entries(batch) as [
    ClaimField,
    { value: string; source: ClaimSource },
  ][]) {
    if (!entry) continue;

    const claim = { field, value: entry.value, source: entry.source };
    const index = onboardingCase.claims.findIndex((c) => c.field === field);

    if (index >= 0) {
      onboardingCase.claims[index] = claim;
    } else {
      onboardingCase.claims.push(claim);
    }
  }
};

/**
 * Mark the case completed and invent a demo depot id.
 *
 * Why this helper exists: “depot opened” happens in two places with the same steps —
 * (1) policy allow_auto in submitOnboardingPackage, (2) HITL Approve in resolveHitlTicket.
 * Sharing one function avoids duplicating status + claim + audit.
 *
 * What it does:
 * - status → completed
 * - depotId → NF-DEP-… (stand-in for custody/core booking)
 * - claim depot.id with the given provenance (system vs human)
 * - audit event depot.opened
 *
 * Production: replace mintDemoDepotId with a real custody/core API call.
 */
const bookDemoDepot = (
  onboardingCase: OnboardingCase,
  claimSource: ClaimSource,
  howOpened: "autonomously" | "after HITL",
) => {
  onboardingCase.status = "completed";
  onboardingCase.depotId = mintDemoDepotId(onboardingCase.id);
  applyClaims(onboardingCase, {
    "depot.id": { value: onboardingCase.depotId, source: claimSource },
  });
  recordAuditEvent(
    onboardingCase.id,
    "depot.opened",
    `Depot ${onboardingCase.depotId} opened ${howOpened}`,
  );
};

/**
 * Turn the agent’s OnboardingPayload into case-file claims (folder-style keys).
 * Called from submitOnboardingPackage before policy runs.
 * Special cases: KYC verified → system_verified; preserve human_confirmed consent after step-up.
 */
const recordPayloadClaims = (
  onboardingCase: OnboardingCase,
  payload: OnboardingPayload,
) => {
  const priorConsent = onboardingCase.claims.find(
    (c) => c.field === "contract.accepted",
  );

  applyClaims(onboardingCase, {
    "tax.residency": {
      value: payload.taxResidency,
      source: "agent_asserted",
    },
    "tax.id": { value: payload.taxId, source: "agent_asserted" },
    "suitability.knowledge": {
      value: String(payload.knowledgeScore),
      source: "agent_asserted",
    },
    // verified ≈ vendor callback stand-in; pending/failed stay agent_asserted.
    "kyc.status": {
      value: payload.kycStatus,
      source:
        payload.kycStatus === "verified" ? "system_verified" : "agent_asserted",
    },
    // Keep human_confirmed if step-up already stamped consent.
    "contract.accepted": {
      value: String(payload.contractAccepted),
      source:
        priorConsent?.source === "human_confirmed"
          ? "human_confirmed"
          : "agent_asserted",
    },
  });
};

/** Provider audit trail — all events, or filter with caseId. */
export const listAuditEntries = (caseId?: string) => {
  const { auditLog } = getStore();
  if (!caseId) return auditLog;
  return auditLog.filter((entry) => entry.caseId === caseId);
};

/** Provider HITL queue, newest first. */
export const listHitlTickets = () => {
  return Array.from(getStore().hitlTickets.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
};

/** Load one onboarding case by id (null if missing). Used by Provider “Inspect case”. */
export const getOnboardingCase = (id: string) => {
  return getStore().cases.get(id) ?? null;
};

/**
 * Start a depot-opening attempt (POST /api/cases).
 * Saves the customer’s delegation (scoped mandate, e.g. depot.open) and seed claims
 * so Provider can already see name / scope / channel before submit.
 */
export const openOnboardingCase = (
  delegation: DelegationToken,
): OnboardingCase => {
  const store = getStore();
  const onboardingCase: OnboardingCase = {
    id: randomUUID(),
    createdAt: isoNow(),
    updatedAt: isoNow(),
    status: "collecting",
    delegation,
    claims: [],
  };
  applyClaims(onboardingCase, {
    "customer.name": {
      value: delegation.subjectName,
      source: "agent_asserted",
    },
    "delegation.scope": {
      value: delegation.scope.join(","),
      source: delegation.signed ? "system_verified" : "agent_asserted",
    },
    channel: { value: delegation.channel, source: "system_verified" },
  });

  store.cases.set(onboardingCase.id, onboardingCase);

  recordAuditEvent(
    onboardingCase.id,
    "case.created",
    `Opened onboarding case for ${delegation.subjectName} (${delegation.channel})`,
  );

  return onboardingCase;
};

/**
 * Agent submits the onboarding package (POST /api/cases/:id/submit).
 * Flow: save payload → write claims → evaluateOnboardingPolicy → branch:
 * allow_auto → bookDemoDepot | require_step_up | require_human (+ HITL ticket) | reject.
 */
export const submitOnboardingPackage = (
  caseId: string,
  payload: OnboardingPayload,
) => {
  const store = getStore();
  const onboardingCase = requireOnboardingCase(caseId);

  onboardingCase.payload = payload;
  onboardingCase.updatedAt = isoNow();
  onboardingCase.status = "policy_review";
  recordPayloadClaims(onboardingCase, payload);

  recordAuditEvent(
    caseId,
    "onboarding.submitted",
    "Agent submitted onboarding package",
    "agent_asserted",
  );

  const policy = evaluateOnboardingPolicy(onboardingCase.delegation, payload);
  onboardingCase.policy = policy;
  recordAuditEvent(
    caseId,
    "policy.evaluated",
    `${policy.outcome} [${policy.ruleIds.join(",")}]: ${policy.reasons.join(" | ")}`,
  );

  switch (policy.outcome) {
    case "allow_auto":
      // Evidence enough — fake custody booking without a human.
      bookDemoDepot(onboardingCase, "system_verified", "autonomously");
      break;

    case "require_step_up":
      // Natural person must finish KYC/consent (Agent “Complete step-up” button).
      onboardingCase.status = "awaiting_step_up";
      recordAuditEvent(caseId, "step_up.required", policy.reasons.join(" | "));
      break;

    case "require_human": {
      // Escalate to Provider HITL queue — no autonomous close.
      onboardingCase.status = "awaiting_human";

      const ticket: HitlTicket = {
        id: randomUUID(),
        caseId,
        createdAt: isoNow(),
        reason: policy.reasons.join(" "),
        ruleIds: policy.ruleIds,
        status: "open",
      };

      store.hitlTickets.set(ticket.id, ticket);
      recordAuditEvent(caseId, "hitl.opened", ticket.reason);
      break;
    }

    case "reject":
      onboardingCase.status = "rejected";
      recordAuditEvent(caseId, "case.rejected", policy.reasons.join(" | "));
      break;
  }

  return onboardingCase;
};

/**
 * Simulate eID + contract consent (POST /api/cases/:id/step-up).
 * Production: identity-vendor webhook, not a button. Strengthens claims, then
 * re-enters submitOnboardingPackage so policy runs again on the updated package.
 */
export const completeCustomerStepUp = (caseId: string) => {
  const onboardingCase = requireOnboardingCase(caseId);

  if (!onboardingCase.payload) {
    throw new Error("Onboarding case not found");
  }

  if (onboardingCase.status !== "awaiting_step_up") {
    throw new Error("Onboarding case is not awaiting step-up");
  }

  onboardingCase.payload = {
    ...onboardingCase.payload,
    kycStatus: "verified",
    kycMethod: "eid",
    contractAccepted: true,
  };

  applyClaims(onboardingCase, {
    "kyc.status": { value: "verified", source: "system_verified" },
    "contract.accepted": { value: "true", source: "human_confirmed" },
  });

  recordAuditEvent(
    caseId,
    "step_up.completed",
    "Natural person completed eID + consent",
    "human_confirmed",
  );

  return submitOnboardingPackage(caseId, onboardingCase.payload);
};

/**
 * Provider Approve / Reject (POST /api/hitl/:id/resolve).
 * Closes the fail-closed loop after require_human: human decides → audit →
 * Approve also calls bookDemoDepot (same booking path as allow_auto, human provenance).
 */
export const resolveHitlTicket = (
  ticketId: string,
  decision: "approved" | "rejected",
  note: string,
) => {
  const store = getStore();
  const ticket = store.hitlTickets.get(ticketId);

  if (!ticket) {
    throw new Error("HITL ticket not found");
  }

  if (ticket.status !== "open") {
    throw new Error("HITL ticket already resolved");
  }

  const onboardingCase = requireOnboardingCase(ticket.caseId);

  ticket.status = decision;
  ticket.resolvedAt = isoNow();
  ticket.resolverNote = note;

  if (decision === "approved") {
    recordAuditEvent(
      ticket.caseId,
      "hitl.approved",
      note || "Human approved depot opening",
      "human_confirmed",
    );
    bookDemoDepot(onboardingCase, "human_confirmed", "after HITL");
  } else {
    onboardingCase.status = "rejected";
    recordAuditEvent(
      ticket.caseId,
      "hitl.rejected",
      note || "Human rejected",
      "human_confirmed",
    );
  }

  onboardingCase.updatedAt = isoNow();

  return { ticket, onboardingCase };
};

/** Provider “Reset demo data” — wipe RAM so the interview walkthrough can restart. */
export const clearDemoStore = () => {
  globalForStore.__nordfundStoreV2 = emptyStore();
};
