/**
 * ArthaNexus AI — Canonical Type Definitions
 * Strict TypeScript models for Securities, Portfolios, Financial Metrics,
 * DataOps Pipelines, AI Citations, and Provenance.
 */

export type DataOrigin = 'demo' | 'provider';

export type FreshnessStatus = 'realtime' | 'delayed' | 'eod' | 'latest_published' | 'cached' | 'stale' | 'simulated';

export interface DataProvenance {
  source_name: string;
  source_url: string;
  source_doc_id?: string;
  observed_at: string; // ISO8601 UTC
  published_at: string; // ISO8601 UTC
  retrieved_at: string; // ISO8601 UTC
  parser_version: string;
  freshness_status: FreshnessStatus;
  data_origin: DataOrigin;
  checksum?: string;
}

// --------------------------------------------------------------------------
// Securities & Markets
// --------------------------------------------------------------------------

export type SecurityType = 'EQUITY' | 'MUTUAL_FUND' | 'ETF' | 'INDEX' | 'BOND' | 'MACRO';

export interface Security {
  id: string; // e.g. "NSE:RELIANCE" or "AMFI:120503"
  symbol: string;
  name: string;
  isin?: string;
  exchange: 'NSE' | 'BSE' | 'AMFI' | 'RBI' | 'GLOBAL';
  security_type: SecurityType;
  sector?: string;
  industry?: string;
  market_cap_category?: 'LARGE_CAP' | 'MID_CAP' | 'SMALL_CAP' | 'MICRO_CAP';
  currency: 'INR' | 'USD';
  is_active: boolean;
  provenance: DataProvenance;
}

export interface PriceBar {
  security_id: string;
  timestamp: string; // ISO8601
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
  is_adjusted: boolean;
  provenance: DataProvenance;
}

export interface SecurityQuote {
  security_id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  high_52w: number;
  low_52w: number;
  pe_ratio?: number;
  pb_ratio?: number;
  market_cap_cr?: number;
  dividend_yield?: number;
  volume: number;
  last_updated: string;
  provenance: DataProvenance;
}

export interface MarketIndexOverview {
  id: string;
  symbol: string;
  name: string;
  current_value: number;
  change: number;
  change_percent: number;
  day_high: number;
  day_low: number;
  market_session: 'PRE_OPEN' | 'REGULAR_OPEN' | 'POST_CLOSE' | 'WEEKEND' | 'HOLIDAY';
  provenance: DataProvenance;
}

// --------------------------------------------------------------------------
// Financial Statements & Ratios
// --------------------------------------------------------------------------

export interface FinancialMetricRecord {
  security_id: string;
  period_type: 'ANNUAL' | 'QUARTERLY' | 'TTM';
  fiscal_year: number;
  fiscal_quarter?: number;
  period_end_date: string;
  revenue_cr: number;
  ebitda_cr: number;
  ebit_cr: number;
  pat_cr: number; // Profit After Tax
  eps: number;
  operating_cash_flow_cr: number;
  free_cash_flow_cr: number;
  total_debt_cr: number;
  cash_and_equivalents_cr: number;
  net_debt_cr: number;
  total_equity_cr: number;
  total_assets_cr: number;
  total_liabilities_cr: number;
  roe_pct: number;
  roce_pct: number;
  roa_pct: number;
  debt_to_equity: number;
  interest_coverage: number;
  current_ratio: number;
  operating_margin_pct: number;
  net_margin_pct: number;
  provenance: DataProvenance;
}

// --------------------------------------------------------------------------
// Mutual Funds
// --------------------------------------------------------------------------

export interface MutualFundScheme {
  scheme_code: number; // AMFI Scheme Code
  scheme_name: string;
  isin_div_payout?: string;
  isin_growth?: string;
  isin_div_reinvestment?: string;
  category: string;
  fund_house: string;
  plan_type: 'DIRECT' | 'REGULAR';
  option_type: 'GROWTH' | 'IDCW';
  latest_nav: number;
  nav_date: string;
  cagr_1y?: number;
  cagr_3y?: number;
  cagr_5y?: number;
  expense_ratio_pct?: number;
  aum_cr?: number;
  riskometer?: 'LOW' | 'LOW_TO_MODERATE' | 'MODERATE' | 'MODERATELY_HIGH' | 'HIGH' | 'VERY_HIGH';
  provenance: DataProvenance;
}

// --------------------------------------------------------------------------
// Macroeconomic Series
// --------------------------------------------------------------------------

export interface MacroObservation {
  series_id: string;
  series_name: string;
  category: 'INFLATION' | 'GDP' | 'POLICY_RATE' | 'FX' | 'RESERVES' | 'TRADE';
  date: string;
  value: number;
  unit: string;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'DAILY';
  provenance: DataProvenance;
}

// --------------------------------------------------------------------------
// User Portfolio (Manual / CSV - Never Broker Logins)
// --------------------------------------------------------------------------

export interface PortfolioHolding {
  id: string;
  portfolio_id: string;
  security_id: string;
  symbol: string;
  name: string;
  asset_type: 'EQUITY' | 'MUTUAL_FUND' | 'GOLD' | 'DEBT' | 'CASH';
  quantity: number;
  average_buy_price: number;
  current_price: number;
  invested_amount: number;
  current_value: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  allocation_pct: number;
  sector?: string;
}

export interface PortfolioAnalytics {
  portfolio_id: string;
  total_invested: number;
  current_value: number;
  total_pnl: number;
  total_pnl_pct: number;
  xirr_pct?: number;
  cagr_pct?: number;
  max_drawdown_pct: number;
  annualized_volatility_pct: number;
  sharpe_ratio?: number;
  sortino_ratio?: number;
  diversification_score: number; // 0 to 100
  asset_allocation: { asset_type: string; percentage: number; amount: number }[];
  sector_allocation: { sector: string; percentage: number; amount: number }[];
  single_stock_concentration_top1_pct: number;
  single_stock_concentration_top3_pct: number;
  as_of_date: string;
}

// --------------------------------------------------------------------------
// Screener
// --------------------------------------------------------------------------

export interface ScreenerFilterRule {
  field: string;
  operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in';
  value: number | string | (number | string)[];
}

export interface ScreenerQuery {
  name?: string;
  filters: ScreenerFilterRule[];
  sort_by: string;
  sort_order: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// --------------------------------------------------------------------------
// DataOps & Redundant Scheduler
// --------------------------------------------------------------------------

export type JobStatus =
  | 'queued'
  | 'claimed'
  | 'running'
  | 'succeeded'
  | 'retry_wait'
  | 'failed'
  | 'quarantined'
  | 'blocked_by_capacity';

export interface IngestionJob {
  id: string;
  job_type: 'AMFI_NAV' | 'RBI_STATISTICS' | 'SEBI_CIRCULARS' | 'WORLDBANK_MACRO' | 'RECONCILIATION';
  source_id: string;
  scheduled_window: string;
  partition_key: string;
  status: JobStatus;
  lease_owner?: string;
  lease_expires_at?: string;
  retry_count: number;
  max_retries: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  records_extracted: number;
  records_loaded: number;
  records_quarantined: number;
  error_message?: string;
  provenance_id: string;
}

export interface DataQualityCheckResult {
  job_id: string;
  dataset_name: string;
  check_name: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  tested_count: number;
  failed_count: number;
  details: string;
  checked_at: string;
}

// --------------------------------------------------------------------------
// AI Layer — Grounded Answer Contract
// --------------------------------------------------------------------------

export interface AICitation {
  source_title: string;
  source_url: string;
  publication_date: string;
  excerpt: string;
  section_or_page?: string;
}

export interface AIResponseContract {
  direct_answer: string;
  as_of_timestamp: string;
  data_freshness: FreshnessStatus;
  evidence_citations: AICitation[];
  calculation_assumptions?: string[];
  limitations: string[];
  compliance_notice: string; // Mandatory non-recommendation disclaimer
  provider_used: 'cloudflare-workers-ai' | 'gemini-api' | 'groq' | 'mistral' | 'deterministic-fallback';
  token_usage?: { prompt_tokens: number; completion_tokens: number };
}
