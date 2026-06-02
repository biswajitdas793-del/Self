# 00 — Executive Summary

## The opportunity

The organization can capture the productivity and decision‑quality gains of Generative AI **without** exposing proprietary data to third‑party AI providers and **without** the unpredictable per‑token costs of commercial LLM APIs. By running open‑source Small Language Models (SLMs) and open LLMs inside our own infrastructure, we gain complete data privacy, predictable cost, and full control over training, deployment, and governance.

## What we are building

A **private, single‑tenant AI platform** that:

- Serves internal assistants (chatbot, SOP, procurement, finance, HR, knowledge management, workflow automation) grounded in company knowledge via **Retrieval‑Augmented Generation (RAG)**.
- Runs models **on‑prem and/or in private cloud**, with **quantized SLMs at the edge** for low‑latency and offline scenarios.
- Connects every edge / model device to the central server over a **zero‑trust, encrypted channel** (VPN + mTLS + certificate‑based identity) for inference, sync, monitoring, updates, logging, and governance.

## Why this is the right approach

| Driver | Commercial API | **Private SLM/LLM (this blueprint)** |
|--------|----------------|--------------------------------------|
| Data privacy | Data sent to vendor | **Never leaves our boundary** |
| Cost at scale | Per‑token, grows with usage | **Fixed infra cost, marginal cost ≈ electricity** |
| Customization | Limited | **Full fine‑tuning + RAG on our data** |
| Latency / offline | Internet‑dependent | **Edge inference, works offline** |
| Governance / audit | Vendor‑controlled | **End‑to‑end, we own every log** |
| Lock‑in | High | **Open weights, portable** |

## Headline numbers (illustrative — see [Doc 04](./04-infrastructure-and-cost.md))

- **PoC capital:** ~US$40k–80k (1–2 GPU server) or ~US$3k–8k/month private‑cloud GPU.
- **Production cluster:** ~US$250k–600k capex (8–16 GPUs, HA) **or** ~US$25k–60k/month private cloud.
- **Break‑even vs. commercial APIs:** typically **6–14 months** at moderate enterprise volume (≥ a few hundred million tokens/month), after which the private platform is dramatically cheaper.
- **Team:** 6–10 FTE core (ML, MLOps, data, security, product) during build; ~4–6 FTE steady‑state.

## Recommended model strategy (see [Doc 02](./02-model-selection.md))

- **On‑device SLM:** `Phi‑4` (~14B) / `Gemma 2 9B` / `Qwen2.5 7B` — quantized to 4‑bit for edge.
- **Central general LLM:** `Llama 3.1 70B` and `Qwen2.5 32B/72B` for complex reasoning.
- **Cost‑efficient mid‑tier:** `Mistral Small` / `Mixtral 8x7B`.
- **Embeddings:** `bge‑large` / `e5‑large` / `Qwen3‑Embedding`.

## Recommended architecture (see [Doc 03](./03-architecture-design.md))

**Hybrid**: central GPU cluster (training + heavy inference + governance plane) with **federated edge nodes** running quantized SLMs. RAG keeps knowledge current without retraining. A **model router** sends each request to the cheapest model that can meet the quality bar.

## Security posture (see [Doc 07](./07-security-and-connectivity.md))

Zero‑trust throughout: internal **PKI** issuing short‑lived certificates, **mTLS** on every hop, **WireGuard/IPsec VPN** for device‑to‑server transport, an **API gateway** for authn/authz/rate‑limiting, **RBAC/ABAC**, **PII masking**, **encryption at rest and in transit**, and **immutable audit trails**. Aligned to ISO 27001, SOC 2, GDPR, and (where relevant) sector regulations.

## Roadmap (see [Doc 09](./09-deployment-roadmap.md))

| Phase | Duration | Goal |
|-------|----------|------|
| 1 — PoC | 6–8 weeks | Prove RAG quality on 1–2 use cases |
| 2 — Pilot | 8–12 weeks | Limited production users, hardening, edge pilot |
| 3 — Production | 12–16 weeks | HA rollout, full security, multiple assistants |
| 4 — Optimize & Scale | Ongoing | Fine‑tuning, cost optimization, new use cases |

## Key risks & mitigations (see [Doc 10](./10-risk-and-resources.md))

- **Hallucination / wrong answers** → RAG grounding, citations, evaluation gates, human‑in‑the‑loop for high‑risk flows.
- **GPU cost / scarcity** → quantization, batching, autoscaling, tiered routing, reserved capacity.
- **Data leakage** → strict trust boundary, PII masking, DLP, no external calls, audit.
- **Talent gap** → partner + upskill, managed MLOps tooling.

## The ask

Approve **Phase 1 (PoC)** funding and a cross‑functional team. The PoC is designed to de‑risk the largest unknowns (knowledge quality and security model) with minimal spend before committing to production capex.
