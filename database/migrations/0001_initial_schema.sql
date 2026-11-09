-- ============================================================================
-- ArthaNexus AI — Initial D1 / SQLite Database Schema Migration
-- Migration: 0001_initial_schema.sql
-- Portable across Cloudflare D1, libSQL/Turso, SQLite3, and PostgreSQL
-- ============================================================================

-- 1. Identity, Auth & Consents
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'registered_user', -- anonymous, registered_user, pro_analyst, admin
  created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
  updated_at TEXT NOT NULL DEFAULT (DATETIME('now')),
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS user_consents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- ai_data_processing, educational_disclaimer_ack, privacy_policy
  is_granted INTEGER NOT NULL DEFAULT 1,
  granted_at TEXT NOT NULL DEFAULT (DATETIME('now')),
  ip_hash TEXT,
  version TEXT NOT NULL
);

-- 2. Securities, Exchanges & Metadata
CREATE TABLE IF NOT EXISTS securities (
  id TEXT PRIMARY KEY, -- e.g. "NSE:RELIANCE", "AMFI:120503"
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  isin TEXT,
  exchange TEXT NOT NULL, -- NSE, BSE, AMFI, RBI, GLOBAL
  security_type TEXT NOT NULL, -- EQUITY, MUTUAL_FUND, ETF, INDEX, MACRO
  sector TEXT,
  industry TEXT,
  market_cap_category TEXT, -- LARGE_CAP, MID_CAP, SMALL_CAP
  currency TEXT NOT NULL DEFAULT 'INR',
  is_active INTEGER NOT NULL DEFAULT 1,
  data_origin TEXT NOT NULL DEFAULT 'provider', -- 'demo' or 'provider'
  source_name TEXT NOT NULL,
  source_url TEXT,
  observed_at TEXT NOT NULL,
  retrieved_at TEXT NOT NULL DEFAULT (DATETIME('now')),
  freshness_status TEXT NOT NULL DEFAULT 'eod'
);

CREATE INDEX IF NOT EXISTS idx_securities_symbol ON securities(symbol);
CREATE INDEX IF NOT EXISTS idx_securities_type ON securities(security_type);
CREATE INDEX IF NOT EXISTS idx_securities_origin ON securities(data_origin);

-- 3. Price Bars & Market Indices
CREATE TABLE IF NOT EXISTS price_bars (
  id TEXT PRIMARY KEY,
  security_id TEXT NOT NULL REFERENCES securities(id) ON DELETE CASCADE,
  bar_timestamp TEXT NOT NULL,
  open REAL NOT NULL,
  high REAL NOT NULL,
  low REAL NOT NULL,
  close REAL NOT NULL,
  volume REAL NOT NULL,
  vwap REAL,
  is_adjusted INTEGER NOT NULL DEFAULT 0,
  data_origin TEXT NOT NULL DEFAULT 'provider',
  retrieved_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_price_bars_security_time ON price_bars(security_id, bar_timestamp);

CREATE TABLE IF NOT EXISTS market_indices (
  id TEXT PRIMARY KEY, -- e.g. "INDEX:NIFTY_50", "INDEX:SENSEX"
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  current_value REAL NOT NULL,
  change_value REAL NOT NULL,
  change_percent REAL NOT NULL,
  day_high REAL NOT NULL,
  day_low REAL NOT NULL,
  market_session TEXT NOT NULL DEFAULT 'REGULAR_OPEN',
  data_origin TEXT NOT NULL DEFAULT 'provider',
  retrieved_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

-- 4. Company Profiles & Fundamental Statements
CREATE TABLE IF NOT EXISTS company_fundamentals (
  id TEXT PRIMARY KEY,
  security_id TEXT NOT NULL REFERENCES securities(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL, -- ANNUAL, QUARTERLY, TTM
  fiscal_year INTEGER NOT NULL,
  fiscal_quarter INTEGER,
  period_end_date TEXT NOT NULL,
  revenue_cr REAL NOT NULL,
  ebitda_cr REAL NOT NULL,
  ebit_cr REAL NOT NULL,
  pat_cr REAL NOT NULL,
  eps REAL NOT NULL,
  operating_cash_flow_cr REAL NOT NULL,
  free_cash_flow_cr REAL NOT NULL,
  total_debt_cr REAL NOT NULL,
  cash_and_equivalents_cr REAL NOT NULL,
  net_debt_cr REAL NOT NULL,
  total_equity_cr REAL NOT NULL,
  total_assets_cr REAL NOT NULL,
  total_liabilities_cr REAL NOT NULL,
  roe_pct REAL NOT NULL,
  roce_pct REAL NOT NULL,
  roa_pct REAL NOT NULL,
  debt_to_equity REAL NOT NULL,
  interest_coverage REAL NOT NULL,
  current_ratio REAL NOT NULL,
  operating_margin_pct REAL NOT NULL,
  net_margin_pct REAL NOT NULL,
  data_origin TEXT NOT NULL DEFAULT 'provider',
  source_url TEXT,
  retrieved_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE INDEX IF NOT EXISTS idx_fundamentals_sec_period ON company_fundamentals(security_id, fiscal_year, period_type);

-- 5. Mutual Funds & Daily NAVs
CREATE TABLE IF NOT EXISTS mutual_fund_schemes (
  scheme_code INTEGER PRIMARY KEY,
  scheme_name TEXT NOT NULL,
  isin_growth TEXT,
  isin_div_payout TEXT,
  category TEXT NOT NULL,
  fund_house TEXT NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'DIRECT', -- DIRECT, REGULAR
  option_type TEXT NOT NULL DEFAULT 'GROWTH', -- GROWTH, IDCW
  latest_nav REAL NOT NULL,
  nav_date TEXT NOT NULL,
  cagr_1y REAL,
  cagr_3y REAL,
  cagr_5y REAL,
  expense_ratio_pct REAL,
  aum_cr REAL,
  riskometer TEXT,
  data_origin TEXT NOT NULL DEFAULT 'provider',
  retrieved_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE INDEX IF NOT EXISTS idx_mf_category ON mutual_fund_schemes(category);
CREATE INDEX IF NOT EXISTS idx_mf_house ON mutual_fund_schemes(fund_house);

CREATE TABLE IF NOT EXISTS nav_history (
  id TEXT PRIMARY KEY,
  scheme_code INTEGER NOT NULL REFERENCES mutual_fund_schemes(scheme_code) ON DELETE CASCADE,
  nav_date TEXT NOT NULL,
  nav REAL NOT NULL,
  retrieved_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_nav_history_scheme_date ON nav_history(scheme_code, nav_date);

-- 6. Macroeconomic Series & Observations
CREATE TABLE IF NOT EXISTS macro_observations (
  id TEXT PRIMARY KEY,
  series_id TEXT NOT NULL, -- e.g. "RBI_REPO_RATE", "WB_INDIA_GDP_GROWTH", "MOSPI_CPI"
  series_name TEXT NOT NULL,
  category TEXT NOT NULL, -- POLICY_RATE, GDP, INFLATION, FX, TRADE
  observation_date TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  frequency TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT,
  data_origin TEXT NOT NULL DEFAULT 'provider',
  retrieved_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE INDEX IF NOT EXISTS idx_macro_series_date ON macro_observations(series_id, observation_date);

-- 7. Filings, Circulars & Announcements
CREATE TABLE IF NOT EXISTS corporate_announcements (
  id TEXT PRIMARY KEY,
  security_id TEXT,
  issuer_name TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- REGULATION, EARNINGS, CORPORATE_ACTION, GENERAL
  published_at TEXT NOT NULL,
  summary TEXT,
  source_url TEXT NOT NULL,
  attachment_url TEXT,
  source_name TEXT NOT NULL, -- SEBI, NSE_RSS, BSE_RSS, RBI
  data_origin TEXT NOT NULL DEFAULT 'provider',
  retrieved_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE INDEX IF NOT EXISTS idx_announcements_time ON corporate_announcements(published_at DESC);

-- 8. User Portfolios, Holdings & Transactions (Manual/CSV Only)
CREATE TABLE IF NOT EXISTS portfolios (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
  updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id TEXT PRIMARY KEY,
  portfolio_id TEXT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  security_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL, -- EQUITY, MUTUAL_FUND, GOLD, DEBT
  quantity REAL NOT NULL,
  average_buy_price REAL NOT NULL,
  current_price REAL NOT NULL,
  sector TEXT,
  updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE INDEX IF NOT EXISTS idx_holdings_portfolio ON portfolio_holdings(portfolio_id);

-- 9. Screeners & Research Notes
CREATE TABLE IF NOT EXISTS saved_screens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  query_definition TEXT NOT NULL, -- JSON formatted filter object
  created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
  updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE TABLE IF NOT EXISTS watchlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  symbols_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
  updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

-- 10. DataOps Engine: Jobs, Redundant Leases & Quality Results
CREATE TABLE IF NOT EXISTS source_registry (
  id TEXT PRIMARY KEY, -- e.g. "SRC_AMFI_NAV", "SRC_RBI_RSS", "SRC_SEBI_CIRCULARS"
  name TEXT NOT NULL,
  official_url TEXT NOT NULL,
  polling_cadence_minutes INTEGER NOT NULL,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  last_successful_fetch TEXT,
  last_attempted_fetch TEXT,
  failure_count INTEGER NOT NULL DEFAULT 0,
  reliability_score REAL NOT NULL DEFAULT 100.0,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 30,
  parser_version TEXT NOT NULL DEFAULT '1.0.0'
);

CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id TEXT PRIMARY KEY,
  job_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  scheduled_window TEXT NOT NULL,
  partition_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued', -- queued, claimed, running, succeeded, failed, quarantined
  lease_owner TEXT,
  lease_expires_at TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  records_extracted INTEGER NOT NULL DEFAULT 0,
  records_loaded INTEGER NOT NULL DEFAULT 0,
  records_quarantined INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
  started_at TEXT,
  completed_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_idempotency ON ingestion_jobs(job_type, source_id, scheduled_window, partition_key);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON ingestion_jobs(status);

CREATE TABLE IF NOT EXISTS data_quality_results (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  dataset_name TEXT NOT NULL,
  check_name TEXT NOT NULL,
  status TEXT NOT NULL, -- PASSED, FAILED, WARNING
  tested_count INTEGER NOT NULL,
  failed_count INTEGER NOT NULL,
  details TEXT,
  checked_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE TABLE IF NOT EXISTS lineage_edges (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  source_dataset TEXT NOT NULL,
  target_layer TEXT NOT NULL, -- bronze, silver, gold
  target_dataset TEXT NOT NULL,
  record_count INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

-- 11. AI Layer: Conversations, Citations & Usage Meter
CREATE TABLE IF NOT EXISTS ai_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Financial Inquiry',
  created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
  updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  citations_json TEXT, -- JSON array of AICitation objects
  provider_used TEXT,
  tokens_used INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE TABLE IF NOT EXISTS ai_daily_usage (
  usage_date TEXT PRIMARY KEY, -- YYYY-MM-DD
  total_requests INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  neurons_used INTEGER NOT NULL DEFAULT 0,
  capped INTEGER NOT NULL DEFAULT 0
);
