# Technical Concept: Agent-Based Depot Opening (2030)

## Guiding principle

Treat personal AI agents as a **new distribution channel with machine identity**, not as a smarter browser. Regulated acts stay attributable to the natural person (or an explicitly scoped, auditable delegation). Autonomy is **earned by evidence**, not assumed.

## Logical architecture

```
┌──────────────────┐     signed discovery      ┌─────────────────────────┐
│ Customer AI Agent│ ─────────────────────────▶│ Discovery & Trust Layer │
└────────┬─────────┘                           │ (well-known, JWKS, VC)  │
         │                                     └───────────┬─────────────┘
         │ create onboarding case + delegation             │
         ▼                                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Agent Commerce Gateway                              │
│  authn/z · schema validation · rate limits · brand responses            │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Policy & Guardrails Engine                          │
│  channel rules · KYC state · suitability · advice · security heuristics │
│  outcomes: allow_auto | require_step_up | require_human | reject        │
└───────────────┬───────────────────────┬────────────────────────────────┘
                │                       │
                ▼                       ▼
     ┌──────────────────┐     ┌──────────────────┐
     │ Onboarding Orch. │     │ HITL Workbench   │
     │ (workflows/events)│     │ Compliance / Ops │
     └────────┬─────────┘     └────────┬─────────┘
              │                        │
              ▼                        ▼
     ┌──────────────────┐     step-up / approve
     │ Adapters         │
     │ KYC · QES · Core │
     └──────────────────┘
```

## Key runtime objects

| Object | Purpose |
|--------|---------|
| Provider manifest | Discoverability + verifiable org identity |
| Delegation token | Scoped customer “act-as” (purpose, product class, expiry, channel) |
| Onboarding case | Correlation id across agent ↔ provider (one depot-opening attempt) |
| Claims ledger | Field-level provenance: agent_asserted / system_verified / human_confirmed |
| Policy decision | Deterministic, versioned rule evaluation |
| Audit events | Tamper-evident trail for BaFin/audit readiness |

## Scaling & evolution

- **Horizontal:** Gateway and policy are stateless; onboarding-case state in durable store; HITL is a queue.
- **New products:** Capability catalog entries + policy packs (not forked flows).
- **New protocols:** Adapter pattern at discovery/auth edge; core orchestration unchanged.
- **New channels:** Channel policy pack (direct vs partner bank attribution, inducement rules).

## Non-goals (prototype)

- Real VideoIdent / eIDAS QES
- Real BaFin registration lookup
- Production crypto for signatures (fingerprints are simulated)
- Full MiFID advice engine

## Prototype mapping

| Concept | Code |
|---------|------|
| Discovery | `GET /api/discover`, `src/lib/discovery.ts` |
| Policy | `src/lib/policy.ts` |
| Onboarding cases / HITL / audit | `src/lib/store.ts` |
| Agent UX | `/agent` |
| Ops UX | `/provider` |
