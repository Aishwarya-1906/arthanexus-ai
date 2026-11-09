# ArthaNexus AI — Deployment Accounts & Setup Register

This document lists every cloud service, purpose, official signup URL, required environment variables/secrets, and step-by-step setup instructions.

---

## 1. Cloud Infrastructure: Cloudflare

- **Purpose:** Primary edge hosting (Pages), serverless APIs (Workers), relational database (D1), object store (R2), and primary AI inference (Workers AI).
- **Official Signup:** https://dash.cloudflare.com/sign-up
- **Pricing Plan:** Free plan ($0/mo)
- **Required Secrets & Variables:**
  ```env
  CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
  CLOUDFLARE_API_TOKEN=your_scoped_api_token
  D1_DATABASE_NAME=arthanexus-d1-prod
  R2_BUCKET_NAME=arthanexus-r2-raw-bronze
  ```
- **How to Create Scoped Token:**
  1. Go to **Cloudflare Dashboard** -> **My Profile** -> **API Tokens**.
  2. Click **Create Token** -> Select **Edit Cloudflare Workers** template.
  3. Ensure permissions include:
     - Account: `Cloudflare Pages:Edit`, `Workers Scripts:Edit`, `D1:Edit`, `Workers R2 Storage:Edit`.
  4. Save token securely.

---

## 2. GitHub Actions (Independent Scheduler & Batch Runner)

- **Purpose:** Continuous integration, automated testing, and secondary redundant scheduled reconciliation watchdog.
- **Official Signup:** https://github.com/signup
- **Pricing Plan:** Free public repository (unlimited Actions minutes) or private repository (2,000 free minutes/mo).
- **Required GitHub Secrets (`Settings` -> `Secrets and variables` -> `Actions`):**
  - `CF_API_TOKEN`: Cloudflare API token for deployment and webhook dispatch.
  - `CF_ACCOUNT_ID`: Cloudflare Account ID.
  - `CRON_DISPATCH_SECRET`: Shared HMAC key for authenticating scheduled reconciliation endpoints.
  - `GEMINI_API_KEY`: (Optional) Free Google AI Studio API key.

---

## 3. AI Inference Providers (Zero-Cost Tier)

### A. Google Gemini API
- **Official Signup:** https://aistudio.google.com/
- **Pricing Plan:** Free tier (15 requests/minute, 1,500 requests/day).
- **Secret Name:** `GEMINI_API_KEY`
- **Setup:**
  1. Sign in with Google Account at https://aistudio.google.com/.
  2. Click **Get API key** -> Create key in new Google Cloud project.
  3. Copy key to `.env` as `GEMINI_API_KEY`.

### B. Groq Developer Platform
- **Official Signup:** https://console.groq.com/
- **Pricing Plan:** Free Developer Tier.
- **Secret Name:** `GROQ_API_KEY`
- **Setup:**
  1. Register at https://console.groq.com/.
  2. Navigate to **API Keys** -> Create new key.
  3. Add `GROQ_API_KEY` to `.env`.

### C. Mistral Platform (Optional Fallback)
- **Official Signup:** https://console.mistral.ai/
- **Pricing Plan:** Experiment/Free tier.
- **Secret Name:** `MISTRAL_API_KEY`

---

## 4. Public Data Providers (Indian Financial & Macro)

| Provider | Purpose | Registration URL | Authentication Required |
|---|---|---|---|
| **AMFI** | Mutual Fund NAVs (daily all schemes) | https://www.amfiindia.com/ | None (Open public endpoint) |
| **RBI** | Monetary policy, FX reference rates, RSS | https://www.rbi.org.in/ | None (Open RSS & public statistics) |
| **SEBI** | Regulatory circulars, notices, investor alerts | https://www.sebi.gov.in/ | None (Open RSS feed) |
| **World Bank** | India GDP, Inflation, Balance of Payments | https://data.worldbank.org/ | None (Open REST API) |
| **data.gov.in** | CPI, Wholesale Prices, Government statistics | https://data.gov.in/ | Free API Key (`DATA_GOV_IN_API_KEY`) |
| **cron-job.org** | Heartbeat watchdog (external pings) | https://cron-job.org/ | Free account for 5-min ping |

---

## 5. Security & Privacy Non-Negotiables

> [!CAUTION]
> - Never store user Demat/Broker passwords, trading PINs, or OTPs.
> - Never store bank account logins or Aadhaar/PAN identity documents.
> - Portfolio tracker uses manual entry or sanitized local CSV import only.
> - Portfolio and personal holdings are **never** forwarded to third-party AI models without explicit user opt-in consent.
