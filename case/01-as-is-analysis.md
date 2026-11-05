# As-Is Analysis: Securities Account Opening in Germany

**Scope:** Structured inventory of how a typical large German fund company / retail broker opens a Wertpapierdepot today. Not a legal opinion.

**Assumptions:** Customer = large DE fund company; channels = own website/app + cooperating branch banks; products = securities accounts (execution-oriented, with suitability where required).

---

## 1. End-to-end flow (today)

| # | Stage | What happens | Evidence / artifacts | Typical actors |
|---|--------|--------------|----------------------|----------------|
| 1 | Acquisition | Prospect finds product via website, app, bank branch, or affiliate | Marketing consent, tracking IDs, partner bank referral code | Marketing, partner bank RM |
| 2 | Product selection | Depot type, account model, optional funds | Product ID, tariff, channel attribution | Product, sales |
| 3 | Identity (KYC / GwG) | eID, VideoIdent, or PostIdent; sanctions/PEP screening | ID document, biometric check, eID attributes, screening result | Compliance, KYC vendor |
| 4 | Personal & tax data | Address, tax residency, TIN, FATCA/CRS self-cert | Declarations, tax ID | Ops, tax |
| 5 | Suitability / appropriateness (WpHG / MiFID II) | Knowledge, experience, risk tolerance, investment goals; information duties | Questionnaire answers, risk profile, info delivery receipt | Product governance, advice (if advised) |
| 6 | Contract | AGB, depot agreement, privacy notice; consent / QES where needed | Signed contract, consent timestamps | Legal |
| 7 | Account booking | Create depot in core systems; link settlement account | Depot ID, IBAN link | Back office, custody |
| 8 | Funding / activation | First transfer or SEPA mandate | Payment confirmation | Ops, payments |

---

## 2. Regulatory anchors (high level)

| Topic | Relevance to onboarding |
|--------|-------------------------|
| **GwG (AML)** | Identify customer, beneficial owner, risk-based due diligence, ongoing monitoring |
| **WpHG / MiFID II** | Appropriateness/suitability, product information, record-keeping; stricter if advice |
| **GDPR** | Lawful basis, purpose limitation, data minimization, retention, DPIA for agent flows |
| **eIDAS** | Electronic identification & signatures for remote contract close |
| **BaFin / ICT & outsourcing** | Vendor risk for KYC, cloud, AI tooling; auditability |
| **Channel / distribution rules** | Partner bank agreements; who “owns” the customer; inducements |

**Critical constraint for agents:** An AI agent prefilling forms is not the same as a natural person completing regulated acts. Binding KYC attestation, suitability answers, and contract consent must remain attributable to the customer (or an explicitly scoped, recorded delegation that regulators and auditors accept).

---

## 3. Friction heatmap

| Friction | Impact | Why it matters for 2030 agents |
|----------|--------|--------------------------------|
| KYC drop-off (video/post) | High conversion loss | Agent cannot “attend” video call; need eID / deferred step-up |
| Long suitability questionnaires | Abandonment + inconsistent answers | Agent must not invent knowledge/experience |
| Multi-channel conflict | Bank vs direct cannibalization | Agent discovery must respect partner rules |
| Opaque status | Support load | Agents need machine-readable status & reasons |
| Vendor lock-in (KYC) | Cost / change risk | Abstract KYC behind adapter |
| Manual exception handling | Ops cost | Explicit HITL queue is a feature, not a failure |

---

## 4. Roles involved today

- **Customer / prospect**
- **Branch bank relationship manager** (partner channel)
- **Digital onboarding ops**
- **Compliance / AML**
- **Product governance / MiFID**
- **Legal**
- **KYC identity vendor**
- **Custody / core banking IT**
- **Fraud / security**

---

## 5. Implications for the target picture

1. **Reuse the regulated core** — do not rebuild custody/onboarding ledgers for agents.
2. **Add an agent commerce edge** — discovery, verifiable provider identity, delegated authority, policy gates.
3. **Fail closed on autonomy** — when evidence is weak, suitability is incomplete, or channel rules conflict → human or step-up auth.
4. **Make every claim auditable** — separate “agent asserted” vs “system verified”.
