/**
 * Guided transcript for the Agent Console “log” panel.
 * Same story as the interview: discovery → crypto → delegation → submit → policy → ending.
 */
import type { OnboardingCase, ProviderManifest } from "./types";

/**
 * Guided transcript lines after Agent “Run agent flow”.
 * Walks discovery → crypto → delegation → submit → policy → ending (app vs production).
 */
export const buildRunTranscript = (args: {
  provider: ProviderManifest;
  caseAfterCreate: OnboardingCase;
  caseAfterSubmit: OnboardingCase;
}): string[] => {
  const { provider, caseAfterCreate, caseAfterSubmit } = args;
  const policy = caseAfterSubmit.policy;

  const lines: string[] = [
    "STEP 0 · Goal",
    "  Anna’s AI looks for a firm that can open a Wertpapierdepot (securities custody account).",
    "  AI REQUESTS opening; NordFund DECIDES; real account exists only after booking/HITL allow.",
    "",
    "STEP 1 · Discovery",
    "  App: GET /api/discover → hardcoded capability list.",
    "  Production: versioned capability catalog (e.g. depot.open.execution_only@2026.3).",
    `  Found: ${provider.brand} · ${provider.capabilities.join(", ")}`,
    "",
    "STEP 2 · Cryptographic verification",
    "  Why: stop impostor sites that look like NordFund.",
    "  What: private key seals the catalog; public key checks the seal (unchanged + authentic).",
    "  How: publish public keys as JWKS on NordFund’s domain; agent fetches JWKS → verifies.",
    `  App: fake fingerprint only (${provider.identity.fingerprint}) — no real crypto check.`,
    "",
    "STEP 3 · Delegation + open onboarding case",
    "  depot.open = Anna’s permission for the AI to request depot opening (scope, not a folder).",
    "  App: signed:true in the request body. Production: verifiable customer credential + expiry.",
    `  Case ${caseAfterCreate.id.slice(0, 8)}… status=${caseAfterCreate.status}`,
    "",
    "STEP 4 · Submit onboarding package",
    "  App: form fields (KYC dropdown is a mock). Production: vendor KYC callback + full questionnaire.",
    "",
    "STEP 5 · Policy (deterministic code — not the customer’s LLM)",
    `  Outcome: ${policy?.outcome} · status=${caseAfterSubmit.status}` +
      (policy?.ruleIds?.length ? ` · rules: ${policy.ruleIds.join(", ")}` : ""),
  ];

  for (const reason of policy?.reasons ?? []) {
    lines.push(`  · ${reason}`);
  }

  lines.push(
    "  Endings: allow_auto | require_step_up | require_human | reject",
    "",
  );

  if (caseAfterSubmit.depotId) {
    lines.push(
      "STEP 6 · Custody booking",
      `  App: fake id ${caseAfterSubmit.depotId} in memory.`,
      "  Production: custody/core API books real depot + IBAN link + documents (+ partner notify).",
    );
  } else if (caseAfterSubmit.status === "awaiting_step_up") {
    lines.push(
      "STEP 6 · Step-up",
      "  Click “Complete customer step-up” (simulates eID/consent). Then policy re-runs.",
    );
  } else if (caseAfterSubmit.status === "awaiting_human") {
    lines.push(
      "STEP 6 · HITL",
      "  Open Provider & HITL → Refresh → Approve or Reject.",
    );
  } else if (caseAfterSubmit.status === "rejected") {
    lines.push("STEP 6 · Rejected — no depot created.");
  }

  return lines;
};

/** Extra lines after “Complete customer step-up” (fake vendor success). */
export const buildStepUpTranscript = (
  onboardingCase: OnboardingCase,
): string[] => {
  const lines = [
    "",
    "STEP-UP · Natural person finishes identity + consent",
    "  App: button fakes vendor success. Production: eID/VideoIdent callback, then continue.",
    `  After step-up: ${onboardingCase.policy?.outcome} · ${onboardingCase.status}` +
      (onboardingCase.policy?.ruleIds?.length
        ? ` · rules: ${onboardingCase.policy.ruleIds.join(", ")}`
        : ""),
  ];

  if (onboardingCase.depotId) {
    lines.push(
      `  App depot id: ${onboardingCase.depotId} (stand-in for custody/core booking response).`,
    );
  }

  return lines;
};
