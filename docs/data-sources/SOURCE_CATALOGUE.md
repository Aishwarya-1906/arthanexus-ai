# ArthaNexus DataGrid — Source Catalogue & Provenance Registry

**Architecture:** Pluggable connector registry with Bronze/Silver/Gold tier lineage tracking.  
**Freshness Standard:** Every record contains `observed_at`, `published_at`, `retrieved_at`, and `provenance_id`.

---

## 1. Official & Public Connector Registry

### A. AMFI (Association of Mutual Funds in India)
- **Dataset:** Daily Net Asset Value (NAV) of all active Indian Mutual Fund schemes.
- **Provider URL:** https://www.amfiindia.com/
- **Endpoint:** `https://www.amfiindia.com/spages/NAVAll.txt`
- **License / Terms:** Public investor disclosure under SEBI MF Regulations.
- **Polling Cadence:** Daily at 21:30 IST (after AMC publication cutoff).
- **Schema Fields:**
  - `Scheme Code` (Integer canonical identifier)
  - `ISIN Div Payout / ISIN Growth` (Standard securities identifier)
  - `ISIN Div Reinvestment`
  - `Scheme Name` (Text, includes Plan & Option)
  - `Net Asset Value` (Decimal fixed precision)
  - `Date` (DD-MMM-YYYY normalized to UTC ISO8601)
- **Quality Checks:** Row count > 10,000 schemes, NAV > 0, valid ISIN regex, duplicate scheme code check.

### B. Reserve Bank of India (RBI)
- **Dataset:** Monetary policy rates (Repo, Reverse Repo, MSF, Bank Rate), FX Reference Rates (USD/INR, EUR/INR, GBP/INR, JPY/INR), Macroeconomic statistics.
- **Provider URL:** https://www.rbi.org.in/
- **Endpoint:** RSS Feeds (`https://www.rbi.org.in/Scripts/rss.aspx`) & Statistical Tables.
- **Polling Cadence:** Hourly during market business days (09:00 - 18:00 IST).
- **Quality Checks:** Rates within historical corridor [2.00%, 15.00%], currency non-zero.

### C. Securities and Exchange Board of India (SEBI)
- **Dataset:** Regulatory circulars, investor protection notices, registered intermediary alerts, enforcement orders.
- **Provider URL:** https://www.sebi.gov.in/
- **Endpoint:** `https://www.sebi.gov.in/sebirss.xml`
- **Polling Cadence:** Hourly check.
- **Enrichment:** Tagged by department (Market Regulation, Corporation Finance, Investment Management).

### D. World Bank Open Data (Macroeconomics)
- **Dataset:** India macroeconomic time series:
  - `NY.GDP.MKTP.CD` (GDP Current USD)
  - `NY.GDP.MKTP.KD.ZG` (GDP Growth Annual %)
  - `FP.CPI.TOTL.ZG` (Inflation, consumer prices annual %)
  - `NE.EXP.GNFS.ZS` (Exports of goods and services % of GDP)
- **Endpoint:** `https://api.worldbank.org/v2/country/IN/indicator/{indicator}?format=json`
- **Cadence:** Weekly / Monthly check.

### E. Open Government Data Platform India (data.gov.in)
- **Dataset:** Consumer Price Index (CPI), Index of Industrial Production (IIP).
- **Endpoint:** `https://api.data.gov.in/resource/{resource_id}`
- **Cadence:** Monthly on official release dates (typically 12th of each month for CPI).
