# Action Dimensions: Roadmap, Architecture Beyond Depot, Leadership

## Target architecture beyond account opening

Once the agent commerce edge exists for depot opening, the same spine supports:

- Agent-discoverable fund research (read-only, branded facts)
- Status & servicing (“where is my depot?”, documents)
- Controlled portfolio actions with stricter policy packs
- Partner-bank white-label agent endpoints
- Continuous KYC / trigger events

Shared platform capabilities: discovery/trust, delegation, policy packs, orchestration, HITL, audit, observability.

## Tech commitments (binding for the case)

| Layer | Choice |
|-------|--------|
| Edge services | TypeScript (Node) · OpenAPI |
| Policy | Versioned deterministic rules (+ later DSAR-friendly explanation API) |
| Workflows | Event-sourced onboarding state machine |
| Identity | OIDC + delegation tokens; eID/KYC via vendors |
| Data | Claims + audit append-only; minimize PII in agent logs |
| Cloud | Existing bank-grade cloud account; private networking to core |
| ML/LLM | Optional assistive UX only — **never** the authority for allow/deny |

## Roadmap

### 2026 — No-regret foundation
- Publish signed agent-commerce manifest + capability catalog
- Agent Commerce Gateway MVP (onboarding cases, schema validation)
- Policy v1: KYC, advice flag, knowledge threshold, channel attribution, injection heuristics
- HITL workbench for Compliance/Ops
- Pilot: internal agent + one partner bank policy pack
- KPI: % onboarding cases with complete audit; zero silent autonomous closes on gated paths

### 2027–2028 — Production agent channel
- Production eID/QES adapters; wallet/delegation hardening
- Channel economics engine with partner reporting
- Multi-product capability expansion
- Red-team program for agent manipulation
- KPI: conversion uplift vs web; compliance exception rate within SLO

### 2029–2030 — Interoperable agent commerce
- Multi-protocol adapters; continuous policy governance
- Measured autonomous completion with hard regulatory stops
- Brand presence fully viable without website visit
- KPI: share of new depots originating from agents; partner NPS

## Roles, skills, staffing

| Role | Skills | 2026 | 2028 |
|------|--------|------|------|
| Eng Manager / Staff Eng | Distributed systems, regulated delivery | 1 | 1 |
| Platform engineers | APIs, identity, policy | 3 | 5 |
| Domain engineers | Onboarding, integrations | 2 | 4 |
| Security engineer | Threat modeling, abuse | 1 | 2 |
| Product manager | Agent UX + distribution | 1 | 1 |
| Compliance lead (part-time → dedicated) | GwG/WpHG product controls | 0.5 | 1 |
| Ops / HITL specialists | Exception handling | 1 | 2–3 |
| Partner manager | Bank channel politics | 0.5 | 1 |

**Delivery setup:** dual-track squads (Platform + Onboarding) with a bi-weekly Compliance Design Authority. Stakeholders: CPO, CCO, CIO, partner-bank steering, Data Protection Officer, Fraud.

**Governance:** architecture decision records (this log); stage-gate to scale autonomy; kill/adapt criteria on protocol deprecation or supervisory findings.
