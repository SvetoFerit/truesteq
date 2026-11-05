"use client";

/**
 * Provider Gateway & HITL — pretend you are NordFund Compliance/Ops.
 * Shows: HITL queue (require_human), claim provenance, audit timeline.
 * Approve invents NF-DEP-… here; production would call custody/core booking.
 */
import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { SimplificationNote } from "@/components/SimplificationNote";
import { StatusBadge } from "@/components/StatusBadge";
import {
  getOnboardingCase,
  listAuditEntries,
  listHitlTickets,
  resetDemoData,
  resolveHitlTicket,
} from "@/lib/client-api";
import type { AuditEntry, HitlTicket, OnboardingCase } from "@/lib/types";

const ProviderPage = () => {
  const [hitlTickets, setHitlTickets] = useState<HitlTicket[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [selectedCase, setSelectedCase] = useState<OnboardingCase | null>(null);
  const [resolverNote, setResolverNote] = useState(
    "Reviewed suitability evidence with customer on call.",
  );
  const [error, setError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  /** Load HITL + audit on user action (Refresh / after resolve) — avoids setState-in-effect. */
  const refreshQueue = async () => {
    setError(null);

    try {
      const [tickets, audit] = await Promise.all([
        listHitlTickets(),
        listAuditEntries(),
      ]);

      setHitlTickets(tickets.data);
      setAuditEntries(audit.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed");
    }
  };

  /** Claims table: agent_asserted vs system_verified vs human_confirmed. */
  const inspectCase = async (caseId: string) => {
    setError(null);

    try {
      const res = await getOnboardingCase(caseId);
      setSelectedCase(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    }
  };

  /** Closes the fail-closed loop after policy escalated. */
  const resolveTicket = async (
    ticketId: string,
    decision: "approved" | "rejected",
  ) => {
    setIsResolving(true);
    setError(null);

    try {
      const res = await resolveHitlTicket(ticketId, decision, resolverNote);
      setSelectedCase(res.data.onboardingCase);
      await refreshQueue();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Resolve failed");
    } finally {
      setIsResolving(false);
    }
  };

  const resetDemo = async () => {
    await resetDemoData();

    setSelectedCase(null);
    setHitlTickets([]);
    setAuditEntries([]);
  };

  return (
    <AppShell
      title="Provider Gateway & HITL"
      subtitle="Operations view: human-in-the-loop queue, claim provenance (agent asserted vs system verified), and immutable-style audit events."
    >
      <div className="mb-6">
        <SimplificationNote title="What this page is">
          <p>
            When the Agent Console ends in <strong>require_human</strong>, a
            HITL ticket appears here. You are pretending to be NordFund
            Compliance/Ops.
          </p>
          <p>
            <strong>Approve</strong> in this app only invents{" "}
            <span className="mono">NF-DEP-…</span>. In production, approve would
            trigger <strong>custody/core booking</strong>: the real bank system
            creates the securities account (depot number, owner, cash link),
            then durable audit + notify Anna’s AI.
          </p>
          <p>
            Claims labeled <span className="mono">agent_asserted</span> mean
            “the AI said so” (untrusted alone).{" "}
            <span className="mono">system_verified</span> /
            <span className="mono">human_confirmed</span> mean stronger
            evidence. That split is the point of this screen.
          </p>
          <p>
            Audit lines include <span className="mono">ruleIds</span> (e.g.
            SUIT-001) so Support/Compliance can filter “which control fired”
            even if reason text is reworded later.
          </p>
          <p>
            Tip: after an HITL scenario on /agent, click{" "}
            <strong>Refresh</strong> here.
          </p>
        </SimplificationNote>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => void refreshQueue()}
          className="rounded-md border border-[var(--line)] bg-white px-3 py-1.5 text-sm"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={resetDemo}
          className="rounded-md border border-[var(--line)] bg-white px-3 py-1.5 text-sm text-rose-800"
        >
          Reset demo data
        </button>
      </div>
      {error ? <p className="mb-4 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl">
            HITL queue
          </h2>
          <ul className="mt-4 space-y-3">
            {hitlTickets.length === 0 ? (
              <li className="text-sm text-[var(--muted)]">
                No tickets. On{" "}
                <Link
                  href="/agent"
                  className="underline text-[var(--accent-deep)]"
                >
                  Agent Console
                </Link>
                , run “HITL · low knowledge” or “Security”, then Refresh here.
              </li>
            ) : (
              hitlTickets.map((ticket) => (
                <li
                  key={ticket.id}
                  className="rounded-lg border border-[var(--line)] bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge value={ticket.status} />
                    <button
                      type="button"
                      className="text-xs text-[var(--accent-deep)] underline"
                      onClick={() => inspectCase(ticket.caseId)}
                    >
                      Inspect case
                    </button>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">
                    {ticket.reason}
                  </p>
                  {ticket.ruleIds.length > 0 ? (
                    <p className="mt-1 mono text-[10px] text-[var(--muted)]">
                      rules: {ticket.ruleIds.join(", ")}
                    </p>
                  ) : null}
                  <p className="mt-1 mono text-[10px] text-[var(--muted)]">
                    {ticket.id}
                  </p>
                  {ticket.status === "open" ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        className="w-full rounded-md border border-[var(--line)] px-2 py-1.5 text-sm"
                        rows={2}
                        value={resolverNote}
                        onChange={(e) => setResolverNote(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isResolving}
                          onClick={() => resolveTicket(ticket.id, "approved")}
                          className="rounded-md bg-[var(--accent-deep)] text-white px-3 py-1.5 text-xs"
                        >
                          Approve open
                        </button>
                        <button
                          type="button"
                          disabled={isResolving}
                          onClick={() => resolveTicket(ticket.id, "rejected")}
                          className="rounded-md border border-rose-300 text-rose-800 px-3 py-1.5 text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {ticket.resolverNote}
                    </p>
                  )}
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="space-y-4">
          <div className="panel p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl">
              Case claims
            </h2>
            {selectedCase ? (
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <StatusBadge value={selectedCase.status} />
                  {selectedCase.depotId ? (
                    <span className="text-sm text-emerald-800">
                      {selectedCase.depotId}
                    </span>
                  ) : null}
                </div>
                {selectedCase.policy ? (
                  <p className="mb-3 text-xs text-[var(--muted)]">
                    Policy <StatusBadge value={selectedCase.policy.outcome} />
                    {selectedCase.policy.ruleIds.length > 0 ? (
                      <>
                        {" "}
                        ·{" "}
                        <span className="mono">
                          {selectedCase.policy.ruleIds.join(", ")}
                        </span>
                      </>
                    ) : null}
                  </p>
                ) : null}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[var(--muted)] border-b border-[var(--line)]">
                      <th className="py-1 font-medium">Field</th>
                      <th className="py-1 font-medium">Value</th>
                      <th className="py-1 font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCase.claims.map((claim) => (
                      <tr
                        key={claim.field}
                        className="border-b border-[var(--line)]/60"
                      >
                        <td className="py-1.5 mono text-xs">{claim.field}</td>
                        <td className="py-1.5">{claim.value}</td>
                        <td className="py-1.5">
                          <StatusBadge value={claim.source} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Select a HITL ticket to inspect claim provenance.
              </p>
            )}
          </div>

          <div className="panel p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl">
              Audit trail
            </h2>
            <ul className="mt-3 max-h-80 overflow-auto space-y-2">
              {auditEntries.length === 0 ? (
                <li className="text-sm text-[var(--muted)]">
                  Empty — run an agent flow first.
                </li>
              ) : (
                auditEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="text-xs border-b border-[var(--line)]/50 pb-2"
                  >
                    <div className="flex justify-between gap-2 text-[var(--muted)]">
                      <span className="font-medium text-[var(--ink)]">
                        {entry.event}
                      </span>
                      <span className="mono">
                        {new Date(entry.at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[var(--ink)]/80">
                      {entry.detail}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default ProviderPage;
