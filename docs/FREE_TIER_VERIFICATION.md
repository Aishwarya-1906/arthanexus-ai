# ArthaNexus AI — Free-Tier Verification & Provider Evidence

**Verification Date:** November 9, 2026  
**Policy:** `ALLOW_PAID_SERVICES=false` (Strict zero-cost default)  
**Rule:** No hidden paid fallbacks, no silent billing activation, fail-closed quota boundaries.

---

## 1. Cloud Infrastructure: Cloudflare Edge Free Tier

### A. Cloudflare Workers
- **Official Documentation:** https://developers.cloudflare.com/workers/platform/pricing/
- **Verified Free Allowance (2026):**
  - 100,000 requests per day across all Workers.
  - Up to 10 ms CPU time per request on Free plan.
  - 30+ Cron Triggers supported across account.
- **Architectural Guard:**
  - Lightweight edge route handling (`apps/engine`).
  - Strict bounded execution time (<10ms CPU target).
  - Heavy transforms partitioned and offloaded to Cloudflare Workflows / GitHub Actions batch runner.

### B. Cloudflare Pages
- **Official Documentation:** https://developers.cloudflare.com/pages/platform/limits/
- **Verified Free Allowance (2026):**
  - Unlimited bandwidth & requests.
  - 500 builds per month.
  - 1 concurrent build.
- **Architectural Guard:**
  - Static Asset hosting + Edge SSR for ArthaNexus Terminal.
  - Production URL format: `*.pages.dev`.

### C. Cloudflare D1 (Serverless Relational Database)
- **Official Documentation:** https://developers.cloudflare.com/d1/platform/pricing/
- **Verified Free Allowance (2026):**
  - 5 Million row reads per day.
  - 100,000 row writes per day.
  - 5 GB total database storage.
- **Architectural Guard:**
  - Normalized schemas with strict index coverage.
  - Raw tick data is **not** kept in D1; raw payloads land in R2 object storage.
  - Daily aggregated analytics (Gold tier) kept bounded and indexed.

### D. Cloudflare R2 (Object Storage)
- **Official Documentation:** https://developers.cloudflare.com/r2/pricing/
- **Verified Free Allowance (2026):**
  - 10 GB storage per month included free.
  - 1,000,000 Class A operations (writes/lists) per month.
  - 10,000,000 Class B operations (reads) per month.
  - Zero egress fees.
- **Architectural Guard:**
  - Gzip/Brotli compressed raw payloads partitioned by `provider/dataset/YYYY/MM/DD/`.
  - Retention lifecycle of 90 days for raw bronze payloads; immutable checksum verification.

### E. Cloudflare Workers AI
- **Official Documentation:** https://developers.cloudflare.com/workers-ai/platform/pricing/
- **Verified Free Allowance (2026):**
  - 10,000 Neurons per day on free tier (covers ~100-300 lightweight queries).
  - Open-weights models: `@cf/meta/llama-3.1-8b-instruct`, `@cf/mistral/mistral-7b-instruct-v0.2`, `@cf/baai/bge-small-en-v1.5` embeddings.
- **Architectural Guard:**
  - Primary edge routing with neuron quota tracker.
  - Failover to Gemini API / Groq / Mistral developer free tier.
  - Non-LLM deterministic fallback when daily neuron ceiling is hit.

---

## 2. AI Providers Free Allowance Register

| Provider | Model ID | Rate Limit / Quota | Purpose | Failover Priority |
|---|---|---|---|---|
| **Cloudflare Workers AI** | `@cf/meta/llama-3.1-8b-instruct` | 10k Neurons/day free | Natural language explanations & ratios | Priority 1 |
| **Google Gemini API** | `gemini-1.5-flash` / `gemini-2.0-flash` | 15 RPM / 1M TPM / 1500 RPD free tier | Annual report Q&A & RAG summaries | Priority 2 |
| **Groq Cloud** | `llama-3.1-8b-instant` | Free Developer tier (30 RPM, 14.4k RPD) | Fast response latency fallback | Priority 3 |
| **Mistral AI** | `mistral-small-latest` | Free developer tier | Comparative peer analysis fallback | Priority 4 |
| **Deterministic Engine** | TypeScript Rule-Based Templates | Unlimited / Zero Cost | Ratios, formulas, screener explanations | Hard Fallback |

---

## 3. Official Indian Public Data Sources (Zero Cost & Lawful Access)

1. **AMFI (Association of Mutual Funds in India)**
   - **URL:** https://www.amfiindia.com/net-asset-value/nav-history
   - **Access:** Official public plain-text NAV endpoint (`https://www.amfiindia.com/spages/NAVAll.txt`).
   - **Cadence:** Daily post 21:00 IST (market close + reporting window).
   - **Terms:** Public investor dissemination; non-commercial educational use permitted.

2. **Reserve Bank of India (RBI)**
   - **URL:** https://www.rbi.org.in/Scripts/Statistics.aspx & https://www.rbi.org.in/Scripts/rss.aspx
   - **Access:** Official RSS feeds for press releases, policy rate announcements, FX reference rates, and monetary aggregates.
   - **Cadence:** Hourly RSS check (09:00 - 18:00 IST business hours).

3. **Securities and Exchange Board of India (SEBI)**
   - **URL:** https://www.sebi.gov.in/sebirss.xml
   - **Access:** Official RSS feeds for circulars, investor alerts, orders, and public notices.
   - **Cadence:** Hourly check.

4. **Open Government Data India (data.gov.in)**
   - **URL:** https://data.gov.in/
   - **Access:** Open Government Data (OGD) Platform API (Free API Key required).
   - **Datasets:** CPI, WPI, macro indices, sector production indicators.

5. **World Bank Open Data**
   - **URL:** https://api.worldbank.org/v2/
   - **Access:** Open REST API without authentication key required.
   - **Datasets:** India GDP, Inflation, Trade Balance, Gross Capital Formation.

6. **GDELT Project**
   - **URL:** https://api.gdeltproject.org/api/v2/
   - **Access:** Free public query API for global & India financial macro/corporate events.
