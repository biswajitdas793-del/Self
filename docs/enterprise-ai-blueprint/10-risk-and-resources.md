# 10 — Risk Assessment, Resources & Deliverables Index

## 10.1 Risk register

Likelihood (L) / Impact (I): **L**ow / **M**edium / **H**igh.

| # | Risk | L | I | Mitigation | Owner |
|---|------|---|---|------------|-------|
| R1 | **Hallucination / wrong answers** | M | H | RAG grounding, citations, groundedness checks, eval gates, HITL for high‑risk, confidence display | AI Lead |
| R2 | **Data leakage / privacy breach** | L | H | Strict trust boundary, PII masking, DLP, ACL‑aware retrieval, no external APIs, audit | Security |
| R3 | **GPU cost overrun / scarcity** | M | H | Quantization, routing, caching, autoscaling, reserved capacity, hybrid burst | Platform/Finance |
| R4 | **Poor retrieval / data quality** | M | H | Data cleaning, validation gates, hybrid search + rerank, source curation | Data Eng |
| R5 | **Compromised edge device** | M | H | TPM identity, short‑lived certs, revocation, kill‑switch, attestation, local‑only fail‑secure | Security |
| R6 | **Prompt injection / jailbreak** | M | M | Guardrails, instruction hierarchy, source isolation, tool allow‑list, red‑team | Security/AI |
| R7 | **Licensing/legal non‑compliance** | L | H | Model approval register, Legal sign‑off, license tracking per version | Legal |
| R8 | **Regulatory non‑compliance** | L | H | DPIA, control mappings, audits, AI governance docs | Compliance |
| R9 | **Low adoption / change resistance** | M | M | Start low‑risk/high‑reach, training, feedback loops, exec sponsorship | Product |
| R10 | **Talent / skills gap** | M | M | Partner + upskill, managed MLOps tooling, documentation | CIO/AI Lead |
| R11 | **Model/data poisoning, supply chain** | L | H | Source vetting, signed artifacts, hash/SBOM verification, ingestion gates | Security |
| R12 | **Availability / DR failure** | L | H | HA (N+1), backups, tested DR runbook, SLO monitoring | SRE |
| R13 | **Vendor/model deprecation** | M | L | Open weights + portable stack; multi‑model support; registry | AI Lead |
| R14 | **Scope creep / over‑engineering** | M | M | Phased gates, SLM‑first, measure before scaling | PMO |

## 10.2 Resource requirements

### People (build phase, ~6–10 FTE core)
| Role | Count | Responsibility |
|------|-------|----------------|
| AI/ML Engineer | 2 | RAG, fine‑tuning, eval, model serving |
| MLOps / Platform Engineer | 1–2 | Inference infra, CI/CD, registry, K8s/GPU |
| Data Engineer | 1–2 | Ingestion, cleaning, governance pipelines |
| Security Engineer | 1 | PKI, mTLS/VPN, guardrails, audit, pen‑test |
| SRE / DevOps | 1 | HA, observability, on‑call |
| Product Owner / BA | 1 | Use cases, adoption, requirements |
| SMEs (part‑time) | per use case | Domain knowledge, eval labeling |
| **Sponsors/governance** | — | CIO sponsor, data governance council, Legal/Compliance |

**Steady‑state:** ~4–6 FTE (ML, MLOps, data, security/SRE shared).

### Technology (see Doc 03 §3.5)
vLLM, Qdrant/Milvus, TEI, LangChain/LlamaIndex, MLflow+DVC, Dagster/Airflow, Kong/APISIX, Keycloak, HashiCorp Vault (+PKI), WireGuard, Prometheus/Grafana/OpenTelemetry/Langfuse, Kubernetes + GPU operator.

### Infrastructure (see Doc 04)
PoC → Pilot → Production GPU tiers; storage (NVMe hot + object cold); segmented network + VPN; backups/DR.

## 10.3 Deliverables index (Task 10 mapping)

| Deliverable | Where |
|-------------|-------|
| **Executive summary** | [00‑executive‑summary.md](./00-executive-summary.md) |
| **Technical architecture** | [03‑architecture‑design.md](./03-architecture-design.md) |
| **Infrastructure design** | [04‑infrastructure‑and‑cost.md](./04-infrastructure-and-cost.md) |
| **Cost estimates** | [04‑infrastructure‑and‑cost.md](./04-infrastructure-and-cost.md) |
| **Security framework** | [07‑security‑and‑connectivity.md](./07-security-and-connectivity.md) |
| **Secure connectivity design** | [07‑security‑and‑connectivity.md §7.2](./07-security-and-connectivity.md) + [03 §3.3](./03-architecture-design.md) |
| **Data strategy & governance** | [05‑data‑strategy.md](./05-data-strategy.md) |
| **Model selection** | [02‑model‑selection.md](./02-model-selection.md) |
| **Training & fine‑tuning** | [06‑training‑and‑finetuning.md](./06-training-and-finetuning.md) |
| **Business applications** | [08‑business‑applications.md](./08-business-applications.md) |
| **Implementation roadmap** | [09‑deployment‑roadmap.md](./09-deployment-roadmap.md) |
| **Risk assessment** | this document §10.1 |
| **Resource requirements** | this document §10.2 |
| **Requirement analysis** | [01‑requirement‑analysis.md](./01-requirement-analysis.md) |

## 10.4 Key recommendations (one page)

1. **Hybrid, SLM‑first** architecture with a model router; escalate to open LLMs only when evals demand it.
2. **Standardize on Apache‑licensed families where possible** (Qwen2.5 workhorse; Phi‑4/Gemma at edge; Mixtral mid‑tier; Llama 3.x with Legal sign‑off).
3. **RAG first, fine‑tune second** — keep facts in the governed vector store; use LoRA/QLoRA only for behavior/format/skill.
4. **Zero‑trust connectivity** for edge: TPM identity, internal PKI with short‑lived certs, WireGuard VPN + mTLS, API gateway, signed updates, kill‑switch, full audit.
5. **Govern everything** — model approval register, data governance council, immutable audit, eval‑gated promotion.
6. **Phase and gate** — PoC → Pilot → Production → Optimize, with go/no‑go on quality, security, cost, adoption.
7. **Optimize cost relentlessly** — quantization, routing, caching, batching, edge offload; track break‑even vs. commercial APIs.
