# ArthaNexus AI — Cost Guardrails & Free-Tier Ceilings

**Zero-Cost Operating Policy:** `ALLOW_PAID_SERVICES=false`  
**Budget Target:** $0.00 / month on all cloud providers.

---

## 1. Non-Negotiable Cost Principles

1. **Fail-Closed by Design:**
   If any cloud provider quota is reached (e.g., Cloudflare Workers AI 10,000 neurons/day or D1 daily write ceiling), the service enters safe cached/read-only mode. It **never** triggers an automatic card charge or paid tier upgrade.
2. **Billing Alarm & Cap Architecture:**
   - In Cloudflare: Billing alert notifications configured at $0.01 threshold.
   - In Google Cloud / Gemini AI Studio: Free tier quota enforcement enabled with 0 budget cap.
   - In Groq / Mistral: Pay-as-you-go disabled; developer keys strictly throttled.
3. **No Local Machine Running Requirement:**
   - Scheduled ETL runs serverlessly via Cloudflare Cron Triggers + Event-driven Cloudflare Workflows + secondary GitHub Actions Scheduled Workflows.
   - Users do not need to keep their laptop or a local terminal open.

---

## 2. Platform Quotas and Circuit Breakers

| Resource | Free Tier Limit | Throttle / Circuit Breaker Threshold | Action When Ceiling Reached |
|---|---|---|---|
| **Cloudflare Workers** | 100,000 req/day | 90,000 req/day | Serve static cached responses with `X-Data-Freshness: cached` header |
| **Cloudflare D1 Reads** | 5,000,000 rows/day | 4,500,000 rows/day | Enable 10-minute edge cache on read queries |
| **Cloudflare D1 Writes** | 100,000 rows/day | 90,000 rows/day | Buffer writes in memory/R2 staging, pause non-critical log writes |
| **Cloudflare R2 Storage** | 10 GB total | 8.5 GB | Trigger automated partition lifecycle pruning (purge bronze payloads older than 60 days) |
| **Cloudflare Workers AI** | 10,000 neurons/day | 9,500 neurons/day | Route to Gemini API Free Tier or Deterministic Formula Explainer |
| **Gemini API** | 1,500 requests/day | 1,400 requests/day | Failover to Groq Developer Tier or fallback text template engine |
| **AMFI / RBI Polls** | Public endpoints | Rate limit 1 req / 5 sec | Exponential backoff with random jitter |

---

## 3. Kill-Switch Configuration

In `wrangler.toml` and environment configuration:
```env
# Kill Switches
ENABLE_AI_INFERENCE=true
ENABLE_BACKGROUND_CRON=true
ENABLE_AMFI_INGESTION=true
ENABLE_RBI_INGESTION=true
ENABLE_SEBI_INGESTION=true
ALLOW_PAID_SERVICES=false
MAX_DAILY_AI_REQUESTS=1000
```
Setting `ENABLE_AI_INFERENCE=false` instantly disables all external LLM calls and serves verified deterministic calculation explanations.
