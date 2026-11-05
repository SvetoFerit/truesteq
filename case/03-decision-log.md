# Decision Log

Each entry follows the required TRUSTEQ format.

---

## D1 — Autonomy boundary for depot opening

**Decision:** What may a customer agent complete without a human or natural-person step-up?

**Options considered:**
1. Full autonomous close whenever forms validate
2. Fail-closed policy: auto only for narrow execution-only + verified KYC + adequate appropriateness evidence; else step-up / HITL
3. Always human approval (agent only prefills)

**Criteria:** Regulation (GwG, WpHG/MiFID), customer trust, auditability, conversion, operational cost, manipulation resistance.

**Chosen:** Option 2.

**Why:** Balances 2030 target (true agent commerce) with German regulatory reality. Makes “when agent must stop” a first-class product feature.

**Discarded:** (1) too fragile legally and reputationally; (3) abandons the 2030 business goal and under-uses agents.

**What could overturn:** Clear BaFin guidance allowing broader automated appropriateness; or product limited to ultra-simple non-MiFID instruments with different rules.

---

## D2 — Protocol strategy (deprecation resilience)

**Decision:** Bet on which agent-commerce standard?

**Options:**
1. Wait for a single emerging global standard
2. Proprietary APIs only
3. Signed well-known + OpenAPI capability catalog now, with protocol adapters later

**Criteria:** Time-to-pilot (2026), lock-in/deprecation risk, partner-bank integrability, engineering cost.

**Chosen:** Option 3.

**Why:** Delivers discoverability and trust in 2026 without marrying one unfinished spec. Adapters isolate orchestration from wire format churn.

**Discarded:** (1) delays learning; (2) invisible to third-party agents / poor ecosystem fit.

**What could overturn:** Rapid industry consolidation on one mandatory standard (then prioritize that adapter).

---

## D3 — Build vs buy / core systems

**Decision:** Rebuild onboarding & custody for agents, or edge layer?

**Options:**
1. Greenfield agent-native core banking/custody
2. Agent commerce edge + reuse existing depot core + buy KYC/QES
3. Fully outsource agent channel to a fintech middleware

**Criteria:** Cost, operational risk, channel contracts with banks, control of policy/audit, speed.

**Chosen:** Option 2.

**Why:** Policy, audit, and brand trust are differentiating; KYC rails and custody are not. Keeps liability and channel rules in-house where they matter.

**Discarded:** (1) multi-year risk; (3) weak control over compliance narrative and partner-bank politics.

**What could overturn:** Strategic M&A providing a superior regulated platform with acceptable control rights.

---

## D4 — Identity & consent model

**Decision:** How does an agent prove it may act for the customer?

**Options:**
1. Trust agent assertions (“user said so”)
2. Shared passwords / scraped session cookies
3. Scoped, signed, expiring delegation (OAuth-like / VC act-as) + step-up for binding acts

**Criteria:** Security, GDPR minimization, audit, UX, regulator explainability.

**Chosen:** Option 3.

**Why:** Separates “agent asserted” from “system verified” and “human confirmed.” Binding KYC/contract still need natural-person strength when policy requires.

**Discarded:** (1) trivial to spoof; (2) abusive and brittle.

**What could overturn:** New eIDAS/wallet credentials becoming the default act-as mechanism (compatible evolution of option 3).

---

## D5 — Channel conflict handling

**Decision:** How do agents interact with partner branch banks?

**Options:**
1. Ignore attribution; optimize direct conversion
2. Block all partner-originated agent traffic
3. Channel policy pack: require partnerBankId, preserve economics/attribution, HITL on ambiguity

**Criteria:** Partner contracts, revenue share, strategic distribution, fairness.

**Chosen:** Option 3.

**Why:** Agent channel must not silently cannibalize banks; ambiguity escalates.

**Discarded:** (1) destroys partnerships; (2) leaves money on the table and pushes agents to competitors.

**What could overturn:** Renegotiated omnibus agent clause with banking partners.

---

## D6 — Security against agent manipulation

**Decision:** How to treat prompt injection / tool abuse?

**Options:**
1. Rely on model provider safety only
2. Allowlist tools + schema validation + deterministic policy outside the LLM + audit
3. Human approval for every action

**Criteria:** Residual risk, throughput, operational load.

**Chosen:** Option 2 (with HITL on SEC signals).

**Why:** Policy lives outside the probabilistic model; injection in free-text notes cannot grant new capabilities.

**Discarded:** (1) insufficient for finance; (3) does not scale.

**What could overturn:** Formal verified agent runtimes becoming commercially viable (would strengthen, not replace, option 2).
