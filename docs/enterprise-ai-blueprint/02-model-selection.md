# 02 — Model Selection & Comparison

> All models below are **open‑weight** and deployable inside our infrastructure. Always verify the **current license text and version** before production use — licenses and model versions change.

## 2.1 Evaluation criteria

1. **Accuracy / quality** — reasoning, instruction following, RAG faithfulness on our evals.
2. **Hardware footprint** — VRAM at target precision; ability to quantize.
3. **Cost** — GPU hours to serve target throughput.
4. **Fine‑tuning capability** — LoRA/QLoRA support, community tooling, ecosystem.
5. **Enterprise readiness** — stability, tokenizer quality, long context, tool/function calling, multilingual.
6. **Licensing** — permissiveness for commercial internal use; redistribution; restrictions.

## 2.2 Family‑by‑family comparison

| Family | Typical sizes | License (verify!) | Strengths | Watch‑outs | Best fit here |
|--------|---------------|-------------------|-----------|------------|---------------|
| **Llama (3.1 / 3.2 / 3.3)** | 1B, 3B, 8B, 70B, 405B | Llama Community License (permissive but with conditions; MAU threshold clause) | Very strong general quality, huge ecosystem, great tooling, function calling | Custom license (not OSI), 405B impractical on‑prem for most | **Central general LLM (8B, 70B); 1B/3B for edge** |
| **Qwen (2.5 / 3)** | 0.5B–72B + MoE | Apache‑2.0 for most sizes (verify per‑model) | Excellent quality‑per‑param, strong multilingual (incl. CJK), long context, coding, embeddings models | Some variants/sizes differ in license | **Primary workhorse — 7B/14B/32B/72B; embeddings** |
| **Mistral / Mixtral** | 7B, Small, Mixtral 8x7B/8x22B (MoE) | Apache‑2.0 (open weights line); some newer models are non‑open — verify | Fast, efficient MoE, good cost/perf, function calling | Newest flagship models may be non‑open | **Cost‑efficient mid‑tier; Mixtral for throughput** |
| **Gemma (2 / 3)** | 2B, 9B, 27B | Gemma Terms of Use (permissive, custom) | Strong small‑model quality, efficient, good safety tuning | Custom license, smaller ecosystem than Llama/Qwen | **Edge SLM (2B/9B); on‑device** |
| **Phi (Phi‑3 / Phi‑4)** | 3.8B (mini), ~14B | MIT (very permissive) | Outstanding reasoning‑per‑param, great for SLM, permissive license | Smaller world knowledge → **must** pair with RAG; less multilingual | **Edge/SLM reasoning; permissive‑license use** |
| **DeepSeek (V3 / R1 / distills)** | 7B distills → 671B MoE | MIT / permissive (verify per model) | Strong reasoning (R1), strong coding, MoE efficiency; distilled small variants | Largest models need big clusters; governance review of provenance | **Reasoning‑heavy tasks; distilled variants at mid‑tier** |
| **Others (Falcon, Yi, OLMo, StableLM, Granite)** | varied | varied (Apache/permissive common; **IBM Granite** Apache‑2.0 + enterprise focus) | Granite is explicitly enterprise/indemnified‑friendly; OLMo fully open incl. data | Quality varies; check ecosystem | **Granite as enterprise‑governance‑friendly option** |

## 2.3 Quantization & VRAM rules of thumb

Approximate VRAM to **serve** a model (weights only; add KV‑cache for context + batch):

| Params | FP16 (~2 GB/B) | 8‑bit (~1 GB/B) | 4‑bit (~0.5 GB/B) |
|--------|----------------|-----------------|-------------------|
| 7–8B | ~14–16 GB | ~8 GB | ~4–5 GB |
| 13–14B | ~28 GB | ~14 GB | ~7–8 GB |
| 32–34B | ~64 GB | ~34 GB | ~18–20 GB |
| 70–72B | ~140 GB | ~72 GB | ~38–40 GB |

> KV‑cache adds meaningfully with long context and batch size. For 70B at long context you typically need **2× 80GB GPUs** (tensor parallel) even at 4‑bit for comfortable throughput. Use **vLLM/TGI** with paged attention to maximize concurrency.

**Quantization recommendation:** serve with **AWQ / GPTQ / GGUF (4‑bit)** for edge and cost‑sensitive tiers; keep **FP16/BF16 or 8‑bit** for the highest‑accuracy central tier and for any model used as a fine‑tuning base.

## 2.4 Recommended model portfolio

| Tier | Model(s) | Precision | Serving | Use cases |
|------|----------|-----------|---------|-----------|
| **Edge SLM** | Phi‑4 (~14B), Gemma 2 9B, Qwen2.5 7B, Llama 3.2 1B/3B | 4‑bit (GGUF/AWQ) | llama.cpp / Ollama / vLLM on small GPU/NPU | U9, low‑latency U1/U8 offline |
| **Mid‑tier** | Qwen2.5 14B/32B, Mistral Small, Mixtral 8x7B | 4‑/8‑bit (AWQ) | vLLM | U1, U2, U5, U6, U8 |
| **Central LLM** | Llama 3.1 70B / 3.3 70B, Qwen2.5 72B, DeepSeek (reasoning) | 8‑bit / FP16 | vLLM, tensor parallel | U3, U4, U6, U7, escalations |
| **Embeddings** | bge‑large‑en / bge‑m3, e5‑large, Qwen3‑Embedding | FP16 | TEI / vLLM | RAG indexing & query |
| **Reranker** | bge‑reranker‑v2, Qwen reranker | FP16 | TEI | RAG precision boost |

### Default picks & justification
- **Primary workhorse: Qwen2.5** — Apache‑2.0 on most sizes (lowest legal friction), best quality‑per‑parameter across a wide size range, strong multilingual + coding, and a matching embeddings line. Lets us standardize one family from edge to central.
- **Strong alternative / co‑primary: Llama 3.x** — largest ecosystem, excellent tooling and function calling; use 8B and 70B. Note the Llama Community License conditions (review the MAU clause and acceptable‑use policy with Legal).
- **Edge SLM: Phi‑4 (MIT)** — best reasoning‑per‑param and the most permissive license; pair with RAG to compensate for narrower world knowledge.
- **Cost/throughput: Mixtral 8x7B / Mistral Small (Apache‑2.0 line)** — MoE efficiency for high‑volume mid‑tier.
- **Governance‑sensitive workloads: IBM Granite** — Apache‑2.0 and explicitly enterprise‑oriented; good when indemnification/provenance posture matters.

## 2.5 Licensing guidance (engage Legal before production)

| License type | Examples | Implication |
|--------------|----------|-------------|
| **Apache‑2.0 / MIT** | many Qwen, Mistral/Mixtral (open line), Phi, Granite, OLMo, DeepSeek (verify) | Lowest friction for internal commercial use; preferred |
| **Custom community license** | Llama (Community License), Gemma (Terms of Use) | Permissive for our scale but **has conditions** (acceptable use, attribution, possible thresholds) — Legal sign‑off required |
| **Non‑open / restricted** | some newest flagship vendor models | May prohibit self‑host or commercial use — **exclude unless cleared** |

**Process:** maintain a **Model Approval Register** (model, version, exact license URL/hash, approval date, approver, allowed use). No model enters production without an entry. Re‑review on every version bump.

## 2.6 How we will actually choose (don't trust public leaderboards alone)

Run our **own evaluation harness** (see [Doc 06](./06-training-and-finetuning.md)) on **our** RAG data and tasks:
1. Build a labeled eval set per use case (Q, gold answer, gold sources).
2. Score candidate models on **groundedness, accuracy, refusal correctness, latency, $/1k tokens**.
3. Pick the **cheapest model that clears the per‑use‑case bar**; record the decision.
4. Re‑evaluate quarterly and on new model releases.
