# ArthaNexus AI — Remaining Limitations & Future Improvements

> **Platform version:** v2.0.0 · **Status:** Production-ready simulation mode; live-cloud mode requires credential configuration.

---

## Table of Contents

1. [Current Limitations](#current-limitations)
2. [Live Credential Configuration](#live-credential-configuration)
3. [Future Improvements](#future-improvements)
4. [Architecture Evolution Roadmap](#architecture-evolution-roadmap)

---

## Current Limitations

### 1. AWS / Cloud Connectivity

| Limitation | Detail | Workaround |
|---|---|---|
| **Simulation mode by default** | Without real `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`, all AWS API responses use `data_origin: "demo_telemetry"`. | Set real AWS credentials in `.env` or Vercel environment variables (see below). |
| **LocalStack requires Docker** | Full AWS API emulation via LocalStack (`localstack/localstack`) requires Docker Desktop and `localstack start`. | Use real AWS credentials, or run `docker compose up localstack` from project root. |
| **Region hard-coded to `ap-south-1`** | Infracost engine uses Mumbai pricing constants. | Update `INFRACOST_REGION` env var (not yet wired); PRs welcome. |
| **CloudWatch metrics are deterministic** | The AwsAdapter generates realistic but synthetic CloudWatch data when not connected to real AWS. | Configure real `AWS_ACCESS_KEY_ID` to switch to live CloudWatch SDK calls. |

### 2. GitHub / CI/CD Integration

| Limitation | Detail | Workaround |
|---|---|---|
| **GitHub Actions dispatch requires a real token** | `triggerGitHubWorkflow()` needs `GITHUB_TOKEN` with `workflow:write` scope and an existing `workflow_dispatch`-enabled workflow in the repo. | Create the GitHub repo, set `GITHUB_TOKEN` in Vercel env vars, and ensure `.github/workflows/ci.yml` exists on `main`. |
| **Commit/branch list uses demo data without token** | Without `GITHUB_TOKEN`, the GitHub adapter returns synthetic repository metadata. | Set `GITHUB_TOKEN` to get live repository data. |
| **No PR/issue integration** | Pull request and issue tracking are not yet implemented. | Future improvement — see roadmap. |

### 3. Vercel Deployment Monitoring

| Limitation | Detail | Workaround |
|---|---|---|
| **Vercel token not yet set** | Without `VERCEL_TOKEN` + `VERCEL_PROJECT_ID`, the Vercel adapter returns demo deployment records. | Generate a Vercel token at https://vercel.com/account/tokens and add to `.env`. |
| **Deployment trigger requires confirmation** | `triggerVercelDeploy()` always prompts for user confirmation (security gate) before POSTing to the Vercel deploy hook. | Expected behaviour — by design, not a limitation. |

### 4. AI / LLM Capabilities

| Limitation | Detail | Workaround |
|---|---|---|
| **Gemini / Groq required for live AI responses** | Without `GEMINI_API_KEY` or `GROQ_API_KEY`, the AI gateway uses deterministic grounded fallback responses (not live LLM). | Add at least one API key to `.env`. Both are free-tier eligible. |
| **CrewAI RCA is pattern-matching, not live agents** | The `crew_rca_engine.js` implements multi-agent RCA logic in pure JavaScript (design-inspired). It does **not** use the real Python CrewAI library or actual LLM orchestration. | For production: install `crewai` Python package and proxy calls through a Python sidecar service. |
| **RAG not yet implemented** | No vector database or embedding pipeline exists. AI answers are grounded on live telemetry, not document retrieval. | Future improvement — integrate pgvector, Chroma, or Pinecone for log/runbook RAG. |
| **Context window for log analysis is limited** | AI log analysis submits only the most recent 20 log entries to the LLM to avoid token limits. | Future improvement — implement chunking and summarisation pipeline for large log volumes. |

### 5. Observability & Log Storage

| Limitation | Detail | Workaround |
|---|---|---|
| **SigNoz log store is in-memory only** | Logs ingested via `/api/v1/devops/logs/ingest` are held in a JavaScript `Map` in the engine process. They are lost on restart. | Future improvement — back with SQLite, Redis, or a real OpenTelemetry collector + SigNoz instance. |
| **No persistent time-series metrics** | CloudWatch-style metrics are generated on-demand; no historical series is stored. | Future improvement — write metrics to a time-series store (InfluxDB, TimescaleDB, or Amazon Timestream). |
| **No alerting / notifications** | No PagerDuty, Slack, or email alert integration. | Future improvement — add webhook-based alerting on anomaly detection. |

### 6. Predictive Analytics

| Limitation | Detail | Workaround |
|---|---|---|
| **Limited historical data** | The 30-day capacity forecast in `predictive_engine.js` uses a linear regression over synthetic seed data until real metrics are collected. | Accuracy improves automatically as real CloudWatch metrics accumulate. |
| **No ML models** | Anomaly detection uses statistical z-scores, not trained ML models. | Future improvement — integrate Prophet (time-series forecasting) or scikit-learn isolation forest. |

### 7. Infrastructure as Code

| Limitation | Detail | Workaround |
|---|---|---|
| **No Terraform / CDK templates generated** | Infracost cost modelling is read-only. No IaC output is generated from the dashboard. | Future improvement — add IaC generation from the cost breakdown view. |

---

## Live Credential Configuration

To switch from simulation mode to live cloud mode, set the following in `.env` (local) or Vercel environment variables (production):

```env
# AWS Live Mode
AWS_ACCESS_KEY_ID=your_real_key_id
AWS_SECRET_ACCESS_KEY=your_real_secret
AWS_DEFAULT_REGION=ap-south-1

# GitHub Live Mode
GITHUB_TOKEN=ghp_your_github_token
GITHUB_REPOSITORY=your-username/arthanexus-ai

# Vercel Live Mode
VERCEL_TOKEN=your_vercel_token
VERCEL_PROJECT_ID=your_project_id

# AI Live Mode (at least one required for live LLM responses)
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

> **Security reminder:** Never commit real credentials to Git. The `.env` file is in `.gitignore`. Use Vercel/GitHub Secrets for CI/CD.

---

## Future Improvements

### Short-term (Next Sprint)

- [ ] **Persistent log storage** — Replace in-memory log store with SQLite (via `better-sqlite3`) for log persistence across restarts.
- [ ] **Real CrewAI integration** — Add Python sidecar (`apps/rca-sidecar/`) exposing a FastAPI endpoint that runs real CrewAI agents with Gemini or Groq as the LLM provider.
- [ ] **RAG pipeline** — Add vector embeddings for runbook documents and past incident reports; use cosine similarity to retrieve relevant context before each RCA query.
- [ ] **Webhook alerts** — On anomaly detection, POST to a configured Slack / Teams webhook URL.
- [ ] **PR & issue tracking** — Extend `github_adapter.js` to fetch open pull requests and issues for the CI/CD dashboard.

### Medium-term

- [ ] **Multi-cloud support** — Add Azure and GCP adapters using the same adapter interface.
- [ ] **IaC generation** — Generate Terraform HCL or AWS CDK TypeScript from the Infracost cost breakdown.
- [ ] **ML anomaly detection** — Replace z-score anomaly detection with an Isolation Forest model (via TensorFlow.js or a Python sidecar).
- [ ] **Time-series metrics persistence** — Write CloudWatch-style metrics to InfluxDB or TimescaleDB for long-range forecasting.
- [ ] **Role-based access control** — Add user authentication (NextAuth / Clerk) and RBAC for destructive DevOps actions.
- [ ] **Mobile PWA** — Add `manifest.json` and service worker for offline-capable PWA deployment.

### Long-term

- [ ] **Kubernetes monitoring** — Extend the DevOps dashboard to monitor EKS clusters and Kubernetes workloads.
- [ ] **Cost governance** — Implement budget alerts and automated rightsizing recommendations using Compute Optimizer data.
- [ ] **Incident management** — Integrate PagerDuty or OpsGenie for end-to-end incident lifecycle management.
- [ ] **Compliance reporting** — Add AWS Config and Security Hub integration for compliance posture visibility.
- [ ] **Multi-tenant SaaS** — Support multiple isolated tenants (teams/companies) on a single platform deployment.

---

## Architecture Evolution Roadmap

```
Phase 1 (Current) ─── Phase 2 ──────────── Phase 3 ──────────────── Phase 4
─────────────────     ─────────────────     ─────────────────────     ─────────────────────
Simulation Mode       Live Cloud Mode       ML & RAG Layer            Enterprise SaaS
                                                                        
✅ All adapters        Real AWS/GH/Vercel    CrewAI Python sidecar     Multi-tenant RBAC
✅ Demo telemetry      credentials wired     Vector DB (Chroma/pg)     Kubernetes support
✅ Deterministic AI    Live LLM routing      ML anomaly detection      PagerDuty / OpsGenie
✅ 39 tests green      Persistent SQLite     Time-series store         Compliance (SOC2)
```

---

## Known Technical Debt

| Item | File | Priority |
|---|---|---|
| ~~`url.parse()` deprecation~~ | ~~`apps/engine/src/index.js`~~ | ✅ Fixed in v2.0.1 |
| Mobile nav buttons missing `mobile-nav-btn` class | `apps/web/public/index.html` | ✅ Fixed in v2.0.1 |
| Cloudflare `wrangler.toml` missing DevOps routes | `infra/cloudflare/wrangler.toml` | Medium |
| `build_static.js` only synced to `dist/` | `apps/web/scripts/build_static.js` | ✅ Fixed in v2.0.1 |

---

*Last updated: November 2026 — ArthaNexus AI v2.0.1*
