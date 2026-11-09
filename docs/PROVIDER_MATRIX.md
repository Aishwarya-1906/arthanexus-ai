# ArthaNexus AI — Provider Matrix & Architectural Adapters

**Design Principle:** Decoupled interfaces. Every external capability has a tested primary adapter and at least one documented, operational fallback.

---

## 1. Matrix Overview

| Subsystem | Primary Implementation | Fallback 1 | Fallback 2 | Failover Behavior |
|---|---|---|---|---|
| **Web UI Hosting** | Cloudflare Pages | Vercel Hobby | Static S3 / GH Pages | Automatic via DNS / CNAME switch |
| **API Runtime** | Cloudflare Workers (TypeScript Edge) | Cloudflare Workflows / Pages Functions | Node.js Express / Docker | Clean portable Hono/Express route layer |
| **Relational Database** | Cloudflare D1 (SQLite Edge) | PostgreSQL (Neon / Supabase) | Turso (libSQL) | Portable Knex / Kysely repository pattern |
| **Object Storage** | Cloudflare R2 | AWS S3 Standard-IA | GitHub Releases (Public exports only) | S3-compatible API client interface |
| **Scheduler (Primary)** | Cloudflare Cron Triggers | Cloudflare Workflows | GitHub Actions Cron | Multi-scheduler lease control plane |
| **Scheduler (Watchdog)** | GitHub Actions Scheduled Workflow | cron-job.org HTTP Trigger | Cloudflare Workflow Timer | Idempotent reconciliation endpoint |
| **AI Layer (NL Q&A)** | Cloudflare Workers AI (`llama-3.1-8b`) | Google Gemini API (`gemini-1.5-flash`) | Groq (`llama-3.1-8b-instant`) | Circuit breaker + deterministic templates |
| **Fund Data** | AMFI India NAV Portal | Staged snapshot mirror | Curated manual CSV import | Provider status warning + cached display |
| **Macro Data** | RBI Official RSS & Statistics | World Bank Open Data API | data.gov.in API | Lineage edge tags + freshness indicators |

---

## 2. Database Adapter Contract

The application repository layer implements:
```typescript
export interface IDatabaseAdapter {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<{ rowsAffected: number; lastInsertRowId?: number | string }>;
  batch(statements: { sql: string; params?: unknown[] }[]): Promise<void>;
  healthCheck(): Promise<{ ok: boolean; latencyMs: number; engine: 'd1' | 'postgres' | 'turso' }>;
}
```

This guarantees that whether running on Cloudflare D1 locally with `better-sqlite3` / `miniflare` or on PostgreSQL via Supabase/Neon, product code does not change.
