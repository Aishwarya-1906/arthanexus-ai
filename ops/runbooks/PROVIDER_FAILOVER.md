# ArthaNexus AI — Provider Failover Runbook

This runbook outlines operational procedures when an external hosting, database, or AI provider experiences service disruption or exhausts its free quota.

---

## 1. AI Layer Failover (Quota Exhaustion)

### Symptoms
- Responses indicate `provider_used: deterministic-fallback` or `AI quota temporarily unavailable`.
- Cloudflare Workers AI daily neurons (10,000) exhausted.

### Automatic Router Behavior
The AI Gateway router tests providers in priority order:
1. **Cloudflare Workers AI** (`@cf/meta/llama-3.1-8b-instruct`)
2. **Google Gemini API** (`gemini-1.5-flash` / `gemini-2.0-flash`) via `GEMINI_API_KEY`
3. **Groq Developer Platform** (`llama-3.1-8b-instant`) via `GROQ_API_KEY`
4. **Deterministic Fallback Engine** (Formula explanations, ratio definitions, educational templates)

### Manual Recovery / Key Rotation
If `GEMINI_API_KEY` hits its free 1,500 RPD quota:
1. Update environment secret in Cloudflare Dashboard:
   ```bash
   npx wrangler secret put GEMINI_API_KEY
   ```
2. Or let the system naturally reset at 00:00 UTC. While waiting, all financial analytics, screeners, portfolios, calculators, and charts continue operating deterministically with zero interruption.

---

## 2. Database Resilience (Cloudflare D1)

- **Daily Logical Backups:** Exported to R2 and stored as timestamped SQL statements.
- **Failover Target:** PostgreSQL adapter (Neon or Supabase).
- In the event of a catastrophic D1 regional disruption, update `DATABASE_URL` in Workers environment to point to the standby Postgres instance.
