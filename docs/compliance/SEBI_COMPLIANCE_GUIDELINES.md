# ArthaNexus AI — Compliance, Regulatory Boundaries & Investor Protection

**Jurisdiction:** India  
**Applicable Frameworks:**
- SEBI (Investment Advisers) Regulations, 2013 (last amended August 2025)
- SEBI (Research Analysts) Regulations, 2014
- SEBI Master Circular for Intermediaries
- Digital Personal Data Protection Act (DPDPA), 2023

---

## 1. Regulatory Status & Non-Negotiable Disclaimers

> [!IMPORTANT]
> **ArthaNexus AI is strictly an educational, analytical, and financial data research software platform.**
> - It is **NOT** a SEBI-registered Investment Adviser (IA), Research Analyst (RA), Stockbroker, Merchant Banker, Portfolio Manager, or Exchange.
> - It **does NOT** provide personalized investment advice, financial planning, buy/sell/hold trade calls, target prices, or return guarantees.
> - It **must NEVER** be represented or marketed as "SEBI-approved", "SEBI-certified", "SEBI-compliant", or as a replacement for a licensed financial professional.
> - All analytics, ratios, screener outputs, technical indicators, and historical backtests are purely descriptive mathematical representations of historical public data.

---

## 2. Platform Compliance Guardrails

### A. No Trade Execution & No Credential Ingestion
- ArthaNexus AI has zero integration with broker order execution APIs.
- The platform will **never** ask for, collect, store, or process:
  - Broker account credentials, passwords, or MPINs.
  - One-Time Passwords (OTPs) or two-factor authentication tokens.
  - Bank account numbers, net banking passwords, or card numbers.
  - Aadhaar or PAN identity documents.
- Portfolio tracking is strictly based on manual entry or user-initiated CSV import.

### B. Strict Truth in Financial Data
- **No False "Live" Labels:** Data points must explicitly disclose their feed status:
  - `Real-Time (Licensed Feed)` — only if an authorized exchange data license is active.
  - `Delayed (15m)` — for feeds with standard exchange reporting delays.
  - `End-of-Day (EOD)` — for closing price bars published post-market.
  - `Latest Published` — for financial results, shareholding, or NAVs.
  - `Cached / Stale` — whenever an upstream feed has missed its expected publication window.
  - `DEMO / SYNTHETIC` — clearly watermarked on demo mode screens.

### C. AI Guardrails & Grounding Contract
- AI responses must cite specific official filings, press releases, circulars, or data points.
- Prompts are fortified against financial recommendation generation:
  - If a user asks *"Should I buy Reliance?"*, the AI explicitly answers:
    *"ArthaNexus AI does not provide investment advice or recommendations. Here are the historical financial fundamentals, verified debt metrics, and latest reported quarterly earnings for your own research..."*

### D. Investor Grievance & Content Dispute Workflow
- Every company profile, filing summary, and calculation card includes a **"Report Inaccuracy"** link.
- Inaccuracy reports trigger an automated DataOps quarantine review to inspect schema drift, parser discrepancies, or source corrections.
