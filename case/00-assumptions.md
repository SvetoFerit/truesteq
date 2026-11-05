# Assumptions & Design Decisions (summary)

Documented for the case submission. Full trade-off write-ups: `03-decision-log.md`.

## Business assumptions
1. Client is a large German KVG/fund company (fictional brand **NordFund**) with direct digital channels and cooperating branch banks.
2. Primary product in scope: **execution-only securities account (Wertpapierdepot)** opening; advised journeys exist but are HITL-gated.
3. 2030 success means agents can discover, trust, and complete eligible openings — not that every opening is autonomous.

## Regulatory assumptions (non-legal)
1. GwG identity duties and WpHG/MiFID appropriateness/suitability obligations continue to apply to agent channels.
2. Binding KYC attestations and contract consent require attributable natural-person strength when policy demands step-up.
3. Partner-bank distribution agreements constrain silent cannibalization; attribution must be preserved.

## Technical assumptions
1. Existing depot/custody core remains system of record.
2. KYC/eID and QES are procured capabilities behind adapters.
3. Emerging agent-commerce protocols will change; adapters isolate churn.
4. Prototype signatures/KYC are **simulated**; production would use JWKS/eIDAS-grade crypto and licensed vendors.

## Design decisions (short)
| Topic | Decision |
|-------|----------|
| Autonomy | Fail closed; deterministic policy outside LLM |
| Protocol | Signed well-known + OpenAPI now; adapters later |
| Build/buy | Build edge/policy/audit; buy KYC/QES; reuse core |
| Trust | Provider fingerprint + scoped delegation + claim provenance |
| Channels | partnerBankId required for partner channel; else HITL |
| Security | Allowlisted actions; injection heuristics → HITL |
