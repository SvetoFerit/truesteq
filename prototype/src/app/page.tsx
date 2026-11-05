/**
 * Case overview: depot definition, Discover → Delegate → Decide → Escalate thesis,
 * and entry points into Agent Console + Provider HITL.
 */
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { SimplificationNote } from "@/components/SimplificationNote";

const cards = [
  {
    href: "/agent",
    title: "1 · Agent Console",
    body: "Simulate a personal AI agent discovering NordFund, opening an onboarding case with delegation, and submitting a package.",
  },
  {
    href: "/provider",
    title: "2 · Provider & HITL",
    body: "See policy outcomes, step-up requirements, human review queue, claim provenance, and the audit trail.",
  },
];

const HomePage = () => {
  return (
    <AppShell
      title="Agentic depot opening for 2030"
      subtitle="TRUSTEQ AI Senior Engineer case — NordFund demonstrates discoverability, verifiable trust, policy-gated autonomy, and human escalation on top of existing regulated onboarding."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="panel p-5 hover:border-[var(--accent)] transition-colors group"
          >
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)] group-hover:text-[var(--accent-deep)]">
              {c.title}
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
              {c.body}
            </p>
          </Link>
        ))}
      </div>

      <section className="mt-10 panel p-6 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          What is a “depot”?
        </h2>
        <p className="text-[var(--ink)]/90 leading-relaxed max-w-3xl">
          In German retail investing, a <strong>depot</strong> (Wertpapierdepot)
          is a <strong>securities custody account</strong> — where
          funds/ETFs/shares are held. It is not a normal bank checking account.
          “Opening a depot” means creating that custody relationship after
          identity, tax, suitability, and contract steps.
        </p>
        <p className="text-[var(--ink)]/90 leading-relaxed max-w-3xl">
          <span className="mono text-sm">depot.open</span> is a{" "}
          <strong>permission / capability name</strong> (like an API scope):
          “this agent is allowed to start a depot-opening journey.” The provider
          advertises{" "}
          <span className="mono text-sm">depot.open.execution_only</span>; the
          customer’s delegation token must include scope{" "}
          <span className="mono text-sm">depot.open</span> or policy rejects the
          case.
        </p>
        <SimplificationNote title="App vs custody/core (the bank’s real books)">
          <p>
            Here, success only invents <span className="mono">NF-DEP-…</span> in
            memory.
          </p>
          <p>
            <strong>Custody/core</strong> is the back-office system that legally
            “has” the account — like the bank’s ledger for securities. In
            production, after policy (or a human) allows opening, NordFund’s
            orchestrator calls that system to: create the depot record, attach
            the customer, <strong>link an IBAN</strong> (cash account used to
            pay for trades), store signed contracts/documents, and{" "}
            <strong>notify a partner bank</strong> if the customer came through
            a branch channel so attribution/economics stay correct.
          </p>
          <p>
            The agent layer should not invent its own ledger; it should request
            a booking and store the real depot number the core returns.
          </p>
        </SimplificationNote>
      </section>

      <section className="mt-10 panel p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Thesis
        </h2>
        <p className="mt-3 text-[var(--ink)]/90 leading-relaxed max-w-3xl">
          Agent-based depot opening is not “an LLM fills a web form.” It is a{" "}
          <strong>verifiable agent commerce layer</strong> — discovery, provider
          identity, scoped customer delegation, deterministic policy, and human
          escalation — sitting on existing KYC and custody systems without
          worsening channel conflict or ignoring regulation.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          {[
            ["Discover", "Signed agent-commerce manifest"],
            ["Delegate", "Scoped act-as token with expiry"],
            ["Decide", "Fail-closed policy engine"],
            ["Escalate", "Step-up auth or HITL queue"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-[var(--wash)] px-3 py-3">
              <div className="text-[var(--accent-deep)] font-medium">{k}</div>
              <div className="text-[var(--muted)] mt-1">{v}</div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
};

export default HomePage;
