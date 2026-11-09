# ArthaNexus AI — Cron & Automation Health Runbook

**Redundant Multi-Scheduler Design:**
1. **Primary Scheduler:** Cloudflare Cron Triggers (`wrangler.toml`).
2. **Batch Orchestrator:** Cloudflare Workflows (checkpointed task runner).
3. **Backup / Watchdog:** GitHub Actions Scheduled Workflow (`.github/workflows/scheduled-reconciliation.yml`).
4. **Heartbeat Pinger (Optional):** cron-job.org HMAC-signed endpoint.

---

## 1. Deployed Schedules (Persisted in UTC, Visualized in Asia/Kolkata)

| Schedule Expression | Cadence (IST) | Task / Connector | Purpose | Failover Mechanism |
|---|---|---|---|---|
| `*/5 * * * *` | Every 5 minutes | Scheduler Heartbeat | Liveness check & lease reconciliation | Failover to GitHub Actions if 2 beats missed |
| `0 16 * * 1-5` | 21:30 IST (Mon-Fri) | AMFI Mutual Fund NAV | Ingest all scheme NAVs post cutoff | Replay via GitHub Actions at 22:30 IST |
| `0 4,7,10 * * 1-5` | 09:30, 12:30, 15:30 IST | RBI & SEBI Feeds | Regulatory notices, FX & repo updates | Next window checks lookback |
| `0 12 * * 5` | 17:30 IST (Fridays) | World Bank Macro | GDP, CPI & Foreign Trade series | Weekly reconciliation batch |
| `0 17 * * 1-5` | 22:30 IST (Mon-Fri) | Gold Layer Aggregation | Compute screener ranks & daily snapshot | Idempotent upsert |

---

## 2. Idempotency & Duplicate Execution Guarantee

All scheduled jobs must acquire a lease with an idempotency key:
```
key = SHA256(job_type + source_id + scheduled_window + partition_key)
```
- If Cloudflare Cron triggers simultaneously with a GitHub Actions reconciliation run, only one worker obtains the atomic lease in D1 (`fencing_token`).
- The second worker receives `{ acquired: false }` and safely exits without writing duplicate records or corrupting the gold aggregates.

---

## 3. Manual Recovery & Job Replay Procedure

If a data feed experiences an upstream outage or network failure:
1. Navigate to **DataOps Console** (`/dataops`).
2. Filter jobs by status `failed` or `quarantined`.
3. Review the exact error message and quarantined schema mismatch reasons.
4. Click **"Replay Job"** or trigger manual GitHub Action dispatch:
   ```bash
   gh workflow run scheduled-reconciliation.yml -f force_replay=true
   ```
