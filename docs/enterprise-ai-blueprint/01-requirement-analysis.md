# 01 — Requirement Analysis

## 1.1 Objectives recap

Deliver Generative AI for internal business processes while guaranteeing **complete data privacy**, **no external data sharing**, **low operating cost**, **high accuracy on company‑specific knowledge**, and **full control** over training, deployment, and governance.

## 1.2 Candidate business use cases

| # | Use case | What it does | Primary data sources |
|---|----------|--------------|----------------------|
| U1 | Internal Q&A chatbot | Answers employee questions from policies, wikis, docs | Confluence/SharePoint, wikis, PDFs |
| U2 | SOP assistant | Guides staff through standard operating procedures step‑by‑step | SOP repository, process docs |
| U3 | Procurement assistant | Vendor lookup, contract clause Q&A, PO drafting | ERP, contracts, vendor master |
| U4 | Finance assistant | Policy Q&A, expense rules, report summarization, variance explanation | ERP/GL, finance policies, reports |
| U5 | HR assistant | Leave/benefits/policy questions, onboarding guidance | HRIS, HR policies, handbooks |
| U6 | Knowledge management | Enterprise search + synthesis across all repositories | All document stores |
| U7 | Workflow automation | Drafts, classifies, extracts, triggers downstream actions | Tickets, emails, forms, ERP |
| U8 | Code / IT helpdesk assistant | Internal tooling docs, runbooks, ticket triage | Runbooks, ITSM, repos |
| U9 | Edge/field assistant | Offline SLM on devices for field staff / secure sites | Synced subset of KB |

## 1.3 Classification: complexity × risk × ROI

Scoring: **L**ow / **M**edium / **H**igh.

| Use case | Complexity | Risk (if wrong) | Expected ROI | Recommended model tier |
|----------|-----------|-----------------|--------------|------------------------|
| U1 Chatbot | L–M | L–M | **H** (broad reach) | SLM + RAG |
| U2 SOP assistant | M | M | **H** | SLM + RAG |
| U3 Procurement | M–H | **H** (financial) | M–H | Open LLM + RAG + HITL |
| U4 Finance | M–H | **H** (financial/regulatory) | M–H | Open LLM + RAG + HITL |
| U5 HR | M | **H** (privacy/legal) | M | SLM/LLM + RAG + strict PII controls |
| U6 Knowledge mgmt | M | L–M | **H** | LLM + RAG (hybrid search) |
| U7 Workflow automation | H | M–H | **H** (scales labor) | LLM + tools/agents + HITL |
| U8 IT helpdesk | L–M | L | M | SLM + RAG |
| U9 Edge/field | M | M | M | Quantized SLM on device |

**Risk handling rule:** Any use case touching **money, legal, regulatory, or personal data** (U3, U4, U5, parts of U7) requires:
citations, confidence display, **human‑in‑the‑loop (HITL)** approval for actions, and stricter audit/PII controls.

## 1.4 SLM vs. Open LLM vs. Hybrid — decision

### Definitions
- **SLM (≈1B–15B params):** fast, cheap, runs on modest GPU or even CPU/edge; excellent for focused, RAG‑grounded tasks.
- **Open LLM (≈30B–70B+):** stronger reasoning, multi‑step synthesis, complex tool use; needs serious GPU.
- **Hybrid:** route each request to the smallest sufficient model; keep big models for hard problems.

### Decision matrix

| Need | Choose |
|------|--------|
| Low latency, high volume, narrow task, edge/offline | **SLM** |
| Complex reasoning, long context synthesis, agentic workflows | **Open LLM** |
| Mixed workload (the real enterprise case) | **Hybrid (recommended)** |

### Recommendation: **Hybrid, SLM‑first**

- Default every use case to an **SLM + RAG** and measure quality.
- **Escalate to an open LLM** only where evaluation shows the SLM misses the accuracy bar (typically U3, U4, U6, U7).
- A **model router** (see [Doc 03](./03-architecture-design.md)) makes this automatic and cost‑optimal.
- **Edge SLMs** (U9) for offline/secure‑site/low‑latency needs, synchronized and governed centrally.

**Justification:** SLM‑first minimizes GPU cost and latency for the bulk of traffic (U1, U2, U5, U8), while the hybrid escalation path preserves quality for the high‑value, high‑risk minority. RAG means most "accuracy" comes from retrieval quality, not model size — so smaller models perform far better than their benchmark scores suggest on grounded enterprise tasks.

## 1.5 Non‑functional requirements

| Category | Requirement |
|----------|-------------|
| Privacy | No proprietary data leaves trust boundary; no external inference APIs |
| Latency | Interactive chat p95 < 3 s first token; edge < 1 s |
| Availability | Production 99.5%+ (HA cluster, N+1) |
| Throughput | Sized to peak concurrent users (see Doc 04) |
| Accuracy | Per‑use‑case eval bar (see Doc 06), e.g. ≥ 90% groundedness for U1/U2 |
| Security | Zero‑trust, mTLS, RBAC/ABAC, full audit (see Doc 07) |
| Compliance | ISO 27001 / SOC 2 / GDPR + sector rules (see Doc 05/07) |
| Cost | Lower TCO than commercial API at target volume (see Doc 04) |

## 1.6 Success criteria for the program

- ≥ 70% of pilot users report time saved; measurable deflection of repetitive queries.
- Groundedness/accuracy meets per‑use‑case bar in offline eval and live spot‑checks.
- Zero data‑leakage incidents; all access auditable.
- Unit cost per answer below commercial‑API equivalent at production volume.
