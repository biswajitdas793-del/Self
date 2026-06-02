# 04 — Infrastructure Planning & Cost

> Costs are **planning‑grade estimates** (USD) to size budgets and compare options. Validate with current vendor quotes — GPU pricing is volatile.

## 4.1 Deployment model decision

| Model | When to choose | Pros | Cons |
|-------|----------------|------|------|
| **On‑premise** | Strict data residency, predictable high volume, existing data center | Max control & privacy, lowest long‑run cost at scale, no egress fees | Capex heavy, procurement lead time, you run HA/ops |
| **Private cloud** (dedicated VPC, single‑tenant GPU) | Speed to start, elastic scaling, no DC | Fast, elastic, managed hardware, opex | Higher long‑run cost, must harden network, GPU availability |
| **Hybrid** ✅ recommended | Real enterprise mix | Train/burst in private cloud, serve sensitive/edge on‑prem; cost + flexibility | More moving parts, two control planes |

**Recommendation:** **Hybrid.** Keep sensitive inference and edge governance **on‑prem**; use **private cloud** for elastic fine‑tuning bursts and overflow inference. Start the PoC in private cloud (fast), move steady‑state inference on‑prem as volume justifies capex.

## 4.2 GPU sizing guidance

| Workload | Suggested GPU | Why |
|----------|---------------|-----|
| Edge SLM (≤9B, 4‑bit) | NVIDIA L4 / RTX 4000‑Ada / Jetson Orin / Apple/NPU | Low power, enough for one device's traffic |
| Mid‑tier serving (7–34B) | L40S (48GB) / A100 40GB | Good $/throughput, fits 4‑bit 32B |
| Central LLM (70B) | 2–4× A100 80GB or H100 80GB (NVLink) | Tensor parallel, long context + batch |
| Fine‑tuning (QLoRA ≤70B) | 1–2× A100/H100 80GB | QLoRA fits 70B on 1–2×80GB |
| Embeddings/rerank | 1× L4/L40S | High throughput, small models |

Rules of thumb: see VRAM table in [Doc 02 §2.3](./02-model-selection.md). Plan **GPU memory = weights + KV‑cache (context×batch) + overhead**; keep ~20% headroom.

## 4.3 Reference cluster designs

### Tier A — PoC (1–2 use cases, dozens of users)
| Item | Spec |
|------|------|
| GPU | 1–2× L40S (48GB) or 1× A100 80GB |
| CPU/RAM | 32 vCPU / 256 GB |
| Storage | 4–8 TB NVMe (models, vectors) + 10 TB bulk |
| Network | 10 GbE |
| **Cost** | **Capex ~US$40k–80k** *or* **private cloud ~US$3k–8k/mo** |

### Tier B — Pilot (several use cases, low‑hundreds users + edge pilot)
| Item | Spec |
|------|------|
| GPU | 2–4× A100/H100 80GB + 1× L40S (embeddings) |
| CPU/RAM | 64 vCPU / 512 GB |
| Storage | 16 TB NVMe + 40 TB bulk + backup |
| Network | 25 GbE, redundant |
| **Cost** | **Capex ~US$150k–300k** *or* **private cloud ~US$12k–30k/mo** |

### Tier C — Production HA (all assistants, 1k+ users, edge fleet)
| Item | Spec |
|------|------|
| GPU | 8–16× H100/A100 80GB (N+1), NVLink groups for 70B |
| CPU/RAM | 256+ vCPU / 1–2 TB |
| Storage | 50–100 TB NVMe (hot) + 200 TB+ object (cold/backup) |
| Network | 100 GbE backbone, redundant; isolated VLANs/segments |
| Control plane | K8s + GPU operator, HA across racks/AZs |
| **Cost** | **Capex ~US$250k–600k+** *or* **private cloud ~US$25k–60k+/mo** |

> Add ~15–25% for networking/PKI/observability/backup infra, plus power & cooling on‑prem (~US$2k–8k/mo for a Tier C rack depending on region).

## 4.4 Storage requirements

| Data | Estimate | Notes |
|------|----------|-------|
| Model weights | 0.5–2 TB | Multiple models + quantized variants + fine‑tunes |
| Vector index | ~ (chunks × dim × 4 bytes) × overhead | e.g. 50M chunks × 1024 dim ≈ 200 GB+; budget 2–4× for HNSW + replicas |
| Raw documents (object store) | depends on corpus | Versioned; could be TBs |
| Logs / audit / telemetry | grows ~GBs/day | Hot 30–90 days + cold archive (WORM) |
| Backups / snapshots | 2–3× primary | Vector DB snapshots, registry, configs |

Use **NVMe for hot** (models, active index), **object storage (MinIO/S3‑compatible)** for raw + cold + backups, with **encryption at rest** everywhere.

## 4.5 Memory & network

- **RAM:** 4–8× total GPU VRAM as host RAM is a safe rule (model loading, KV offload, caching).
- **Network:** intra‑cluster 25–100 GbE for tensor parallel + fast vector queries; **isolated segments** (inference, data, management); edge over VPN (see Doc 07). NVLink/NVSwitch within multi‑GPU nodes for 70B.

## 4.6 Cost model: build vs. commercial API

**Marginal cost of self‑hosting** ≈ amortized hardware + power + ops, independent of token count once capacity is provisioned. **Commercial API** cost scales linearly with tokens.

Illustrative break‑even logic:
- Tier C amortized ~US$30k–60k/month (capex over 3 yrs + power + ops).
- A commercial frontier API at enterprise volume (hundreds of millions–billions of tokens/month) can easily exceed that.
- **Break‑even typically 6–14 months**; past that, self‑host is multiples cheaper, and **all data stays private** (the non‑monetary driver).

> Action: build a spreadsheet with **your** projected monthly tokens × API rate vs. amortized infra; revisit quarterly.

## 4.7 Cost‑optimization levers
1. **Quantization** (4‑bit) — 2–4× more throughput per GPU.
2. **Model routing** — keep ~80% of traffic on cheap SLMs.
3. **Continuous batching + paged attention** (vLLM) — higher GPU utilization.
4. **Semantic + prefix caching** — avoid recomputing frequent answers.
5. **Autoscaling + scale‑to‑zero** for spiky workloads (off‑hours).
6. **Reserved/committed capacity** for the always‑on baseline; burst on demand.
7. **Edge offload** — answer locally, escalate rarely.
8. **Right‑size context** — retrieve fewer, better passages (reranker) to cut tokens.
