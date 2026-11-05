/**
 * Browser → Next API helpers for Agent Console and Provider pages.
 * Keeps UI free of store imports; all mutation/read goes through HTTP like a real agent would.
 */
import type {
  AuditEntry,
  DelegationToken,
  HitlTicket,
  OnboardingPayload,
  OnboardingCase,
  ProviderManifest,
} from "./types";

const JSON_HEADERS = { "Content-Type": "application/json" };

/** Parse JSON and throw with the API error message when status is not OK. */
const parseJson = async <T>(response: Response): Promise<T> => {
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || response.statusText);
  }

  return body as T;
};

/** Step 1 of the agent flow: fetch NordFund’s discoverable card. */
export const discoverProvider = async () => {
  return parseJson<{
    provider: ProviderManifest;
    discovery: string;
    endpoints: Record<string, string>;
  }>(await fetch("/api/discover"));
};

/** Open an onboarding case with the customer’s scoped delegation. */
export const openOnboardingCase = async (delegation: DelegationToken) => {
  return parseJson<{ data: OnboardingCase }>(
    await fetch("/api/cases", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ delegation }),
    }),
  );
};

/** Submit onboarding package → server runs policy → status / HITL / depot. */
export const submitOnboardingPackage = async (
  caseId: string,
  payload: OnboardingPayload,
) => {
  return parseJson<{ data: OnboardingCase }>(
    await fetch(`/api/cases/${caseId}/submit`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    }),
  );
};

/** Simulate eID + consent vendor success, then re-run policy. */
export const completeCustomerStepUp = async (caseId: string) => {
  return parseJson<{ data: OnboardingCase }>(
    await fetch(`/api/cases/${caseId}/step-up`, { method: "POST" }),
  );
};

/** Onboarding case + per-case audit for Provider “Inspect case”. */
export const getOnboardingCase = async (caseId: string) => {
  return parseJson<{ data: OnboardingCase; audit: AuditEntry[] }>(
    await fetch(`/api/cases/${caseId}`),
  );
};

/** HITL queue for Compliance/Ops. */
export const listHitlTickets = async () => {
  return parseJson<{ data: HitlTicket[] }>(await fetch("/api/hitl"));
};

/** Human approve/reject closes the fail-closed loop. */
export const resolveHitlTicket = async (
  ticketId: string,
  decision: "approved" | "rejected",
  note: string,
) => {
  return parseJson<{
    data: { ticket: HitlTicket; onboardingCase: OnboardingCase };
  }>(
    await fetch(`/api/hitl/${ticketId}/resolve`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ decision, note }),
    }),
  );
};

/** Newest-first timeline across cases (or filter via ?caseId= on the route). */
export const listAuditEntries = async () => {
  return parseJson<{ data: AuditEntry[] }>(await fetch("/api/audit"));
};

/** Wipe in-memory store so demos can restart cleanly. */
export const resetDemoData = async () => {
  return parseJson<{ ok: boolean }>(
    await fetch("/api/reset", { method: "POST" }),
  );
};
