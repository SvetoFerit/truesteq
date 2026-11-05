# TRUSTEQ AI Senior Engineer Case — NordFund

Agentic securities-account (depot) opening prototype for a fictional German fund company: discovery, scoped delegation, fail-closed policy, step-up, HITL, claims, and audit.

| Folder | Contents |
|--------|----------|
| [`prototype/`](prototype/) | Runnable Next.js demo |
| [`case/`](case/) | Written analysis and decision docs |

## What the prototype does

Simulates a personal AI agent requesting a **Wertpapierdepot** (securities custody account) from NordFund:

1. **Discover** a mock signed agent-commerce card (provider identity + capabilities)
2. **Open an onboarding case** with a scoped customer delegation (`depot.open`)
3. **Submit** an onboarding package → deterministic **policy** decides:
   - `allow_auto` → fake depot id (`NF-DEP-…`)
   - `require_step_up` → simulate eID / consent, then re-run policy
   - `require_human` → HITL ticket for Compliance/Ops
   - `reject` → hard stop
4. **Provider** view: HITL queue, claim provenance (`agent_asserted` / `system_verified` / `human_confirmed`), audit trail

Demo path: Happy path → HITL · low knowledge → Provider Approve. Optional: Security / injection scenario.

| Route | Purpose |
|-------|---------|
| `/` | Overview / thesis |
| `/agent` | Customer Agent Console (scenarios) |
| `/provider` | Provider Gateway & HITL |

Data is **in-memory** (demo store). Reset via Provider or `POST /api/reset`. Not production software.

## How to run it

```bash
cd prototype
npm install
npm run dev
```

Open the URL from the terminal (usually http://localhost:3000).

Requires Node.js and npm. Use a modern browser; keep `/agent` and `/provider` available for the walkthrough.

## Technologies used

| Layer | Choice |
|-------|--------|
| App | [Next.js](https://nextjs.org/) (App Router) · React · TypeScript |
| UI | Tailwind CSS |
| APIs | Next.js Route Handlers under `prototype/src/app/api/` |
| Domain | In-memory store (`store.ts`), policy engine (`policy.ts`), discovery mock (`discovery.ts`) |
| Tooling | ESLint (Next config) |

No external database or auth provider — intentional for a case prototype.

## Where to find the supporting documentation

Written case materials live in [`case/`](case/):

| Doc | Topic |
|-----|--------|
| [`00-assumptions.md`](case/00-assumptions.md) | Scope and assumptions |
| [`01-as-is-analysis.md`](case/01-as-is-analysis.md) | Today’s depot journey and friction |
| [`02-architecture.md`](case/02-architecture.md) | Agent commerce edge architecture |
| [`03-decision-log.md`](case/03-decision-log.md) | Key trade-offs (autonomy, protocols, build vs buy, …) |
| [`04-roadmap-and-leadership.md`](case/04-roadmap-and-leadership.md) | Roadmap, staffing, governance |
