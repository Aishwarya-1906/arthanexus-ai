# ArthaNexus AI — Disaster Recovery, Export & Restore Runbook

**Goal:** Zero data loss for portfolio and user preference states; 100% reproducible data pipeline for public market feeds.

---

## 1. D1 Logical Export Procedure

To export the D1 database:
```bash
# Export remote D1 database to local SQL file
npx wrangler d1 export arthanexus-d1-prod --remote --output=./backup_$(date +%Y%m%d).sql
```

## 2. Restore Procedure

To restore into a clean D1 database:
```bash
# Create new D1 database if needed
npx wrangler d1 create arthanexus-d1-prod

# Apply schema migrations
npx wrangler d1 execute arthanexus-d1-prod --remote --file=./database/migrations/0001_initial_schema.sql

# Restore data dump
npx wrangler d1 execute arthanexus-d1-prod --remote --file=./backup_20261109.sql
```

## 3. R2 Raw Payload Lifecycle & Lineage Replay

All raw bronze files reside in R2 under `bronze/{dataset}/{YYYY}/{MM}/{DD}/`.
If the silver or gold analytics tables need to be completely rebuilt:
1. Trigger the batch replay script:
   ```bash
   node scripts/replay_pipeline.js --since=2026-01-01
   ```
2. The pipeline reads the immutable bronze files from R2, validates them against current schema rules, and materializes fresh gold tables.
