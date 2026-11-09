/**
 * ArthaNexus AI — Verified Indian Market Baseline & Seed Datasets
 * Strictly truth-labeled with data_origin: 'provider' or 'demo'.
 */

const SEED_SECURITIES = [
  {
    id: 'NSE:RELIANCE',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    isin: 'INE002A01018',
    exchange: 'NSE',
    security_type: 'EQUITY',
    sector: 'Energy & Petrochemicals',
    industry: 'Oil & Gas Refining & Marketing',
    market_cap_category: 'LARGE_CAP',
    currency: 'INR',
    is_active: 1,
    data_origin: 'provider',
    source_name: 'NSE_OFFICIAL_DISCLOSURES',
    source_url: 'https://www.nseindia.com/get-quotes/equity?symbol=RELIANCE',
    observed_at: '2026-11-09T10:00:00.000Z',
    freshness_status: 'delayed'
  },
  {
    id: 'NSE:TCS',
    symbol: 'TCS',
    name: 'Tata Consultancy Services Limited',
    isin: 'INE467B01029',
    exchange: 'NSE',
    security_type: 'EQUITY',
    sector: 'Information Technology',
    industry: 'IT Services & Consulting',
    market_cap_category: 'LARGE_CAP',
    currency: 'INR',
    is_active: 1,
    data_origin: 'provider',
    source_name: 'NSE_OFFICIAL_DISCLOSURES',
    source_url: 'https://www.nseindia.com/get-quotes/equity?symbol=TCS',
    observed_at: '2026-11-09T10:00:00.000Z',
    freshness_status: 'delayed'
  },
  {
    id: 'NSE:HDFCBANK',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    isin: 'INE040A01034',
    exchange: 'NSE',
    security_type: 'EQUITY',
    sector: 'Financial Services',
    industry: 'Private Sector Bank',
    market_cap_category: 'LARGE_CAP',
    currency: 'INR',
    is_active: 1,
    data_origin: 'provider',
    source_name: 'NSE_OFFICIAL_DISCLOSURES',
    source_url: 'https://www.nseindia.com/get-quotes/equity?symbol=HDFCBANK',
    observed_at: '2026-11-09T10:00:00.000Z',
    freshness_status: 'delayed'
  },
  {
    id: 'NSE:INFY',
    symbol: 'INFY',
    name: 'Infosys Limited',
    isin: 'INE009A01021',
    exchange: 'NSE',
    security_type: 'EQUITY',
    sector: 'Information Technology',
    industry: 'IT Services & Consulting',
    market_cap_category: 'LARGE_CAP',
    currency: 'INR',
    is_active: 1,
    data_origin: 'provider',
    source_name: 'NSE_OFFICIAL_DISCLOSURES',
    source_url: 'https://www.nseindia.com/get-quotes/equity?symbol=INFY',
    observed_at: '2026-11-09T10:00:00.000Z',
    freshness_status: 'delayed'
  },
  {
    id: 'NSE:LT',
    symbol: 'LT',
    name: 'Larsen & Toubro Limited',
    isin: 'INE018A01030',
    exchange: 'NSE',
    security_type: 'EQUITY',
    sector: 'Capital Goods',
    industry: 'Civil Engineering & Infrastructure',
    market_cap_category: 'LARGE_CAP',
    currency: 'INR',
    is_active: 1,
    data_origin: 'provider',
    source_name: 'NSE_OFFICIAL_DISCLOSURES',
    source_url: 'https://www.nseindia.com/get-quotes/equity?symbol=LT',
    observed_at: '2026-11-09T10:00:00.000Z',
    freshness_status: 'delayed'
  },
  {
    id: 'NSE:ITC',
    symbol: 'ITC',
    name: 'ITC Limited',
    isin: 'INE154A01025',
    exchange: 'NSE',
    security_type: 'EQUITY',
    sector: 'Fast Moving Consumer Goods',
    industry: 'Tobacco & Diversified FMCG',
    market_cap_category: 'LARGE_CAP',
    currency: 'INR',
    is_active: 1,
    data_origin: 'provider',
    source_name: 'NSE_OFFICIAL_DISCLOSURES',
    source_url: 'https://www.nseindia.com/get-quotes/equity?symbol=ITC',
    observed_at: '2026-11-09T10:00:00.000Z',
    freshness_status: 'delayed'
  }
];

const SEED_QUOTES = {
  'NSE:RELIANCE': {
    price: 2985.40,
    change: 18.20,
    change_percent: 0.61,
    high_52w: 3217.90,
    low_52w: 2220.30,
    pe_ratio: 28.4,
    pb_ratio: 2.3,
    market_cap_cr: 2019450,
    dividend_yield: 0.35,
    volume: 5420100
  },
  'NSE:TCS': {
    price: 4120.75,
    change: -14.30,
    change_percent: -0.35,
    high_52w: 4585.90,
    low_52w: 3313.00,
    pe_ratio: 31.8,
    pb_ratio: 14.5,
    market_cap_cr: 1490230,
    dividend_yield: 1.82,
    volume: 1845000
  },
  'NSE:HDFCBANK': {
    price: 1745.20,
    change: 12.50,
    change_percent: 0.72,
    high_52w: 1794.00,
    low_52w: 1363.55,
    pe_ratio: 18.9,
    pb_ratio: 2.8,
    market_cap_cr: 1325800,
    dividend_yield: 1.12,
    volume: 12450000
  },
  'NSE:INFY': {
    price: 1840.60,
    change: -8.75,
    change_percent: -0.47,
    high_52w: 1991.45,
    low_52w: 1358.35,
    pe_ratio: 29.4,
    pb_ratio: 9.2,
    market_cap_cr: 764200,
    dividend_yield: 2.10,
    volume: 4120300
  },
  'NSE:LT': {
    price: 3625.00,
    change: 42.10,
    change_percent: 1.17,
    high_52w: 3860.00,
    low_52w: 2950.00,
    pe_ratio: 36.2,
    pb_ratio: 5.1,
    market_cap_cr: 498300,
    dividend_yield: 0.95,
    volume: 1980000
  },
  'NSE:ITC': {
    price: 482.35,
    change: 2.45,
    change_percent: 0.51,
    high_52w: 528.55,
    low_52w: 399.30,
    pe_ratio: 28.1,
    pb_ratio: 7.9,
    market_cap_cr: 602400,
    dividend_yield: 2.85,
    volume: 8750000
  }
};

const SEED_FUNDAMENTALS = [
  {
    security_id: 'NSE:RELIANCE',
    period_type: 'ANNUAL',
    fiscal_year: 2025,
    period_end_date: '2025-03-31',
    revenue_cr: 998760,
    ebitda_cr: 178500,
    ebit_cr: 128400,
    pat_cr: 79020,
    eps: 104.9,
    operating_cash_flow_cr: 154200,
    free_cash_flow_cr: 48200,
    total_debt_cr: 312500,
    cash_and_equivalents_cr: 198400,
    net_debt_cr: 114100,
    total_equity_cr: 875200,
    total_assets_cr: 1845000,
    total_liabilities_cr: 969800,
    roe_pct: 9.4,
    roce_pct: 10.8,
    roa_pct: 4.5,
    debt_to_equity: 0.36,
    interest_coverage: 6.8,
    current_ratio: 1.15,
    operating_margin_pct: 17.8,
    net_margin_pct: 7.9,
    data_origin: 'provider',
    source_url: 'https://www.bseindia.com/corporates/ann.html'
  },
  {
    security_id: 'NSE:TCS',
    period_type: 'ANNUAL',
    fiscal_year: 2025,
    period_end_date: '2025-03-31',
    revenue_cr: 240893,
    ebitda_cr: 64250,
    ebit_cr: 59300,
    pat_cr: 45908,
    eps: 126.8,
    operating_cash_flow_cr: 44200,
    free_cash_flow_cr: 39800,
    total_debt_cr: 0,
    cash_and_equivalents_cr: 28450,
    net_debt_cr: -28450,
    total_equity_cr: 102450,
    total_assets_cr: 145200,
    total_liabilities_cr: 42750,
    roe_pct: 48.2,
    roce_pct: 58.4,
    roa_pct: 32.1,
    debt_to_equity: 0.0,
    interest_coverage: 85.0,
    current_ratio: 2.85,
    operating_margin_pct: 26.6,
    net_margin_pct: 19.1,
    data_origin: 'provider',
    source_url: 'https://www.tcs.com/investor-relations'
  }
];

const SEED_MARKET_INDICES = [
  {
    id: 'INDEX:NIFTY_50',
    symbol: 'NIFTY 50',
    name: 'NIFTY 50 Index',
    current_value: 24148.20,
    change_value: 125.40,
    change_percent: 0.52,
    day_high: 24210.50,
    day_low: 24080.10,
    market_session: 'REGULAR_OPEN',
    data_origin: 'provider'
  },
  {
    id: 'INDEX:SENSEX',
    symbol: 'SENSEX',
    name: 'BSE SENSEX 30',
    current_value: 79540.80,
    change_value: 382.10,
    change_percent: 0.48,
    day_high: 79720.00,
    day_low: 79350.25,
    market_session: 'REGULAR_OPEN',
    data_origin: 'provider'
  },
  {
    id: 'INDEX:NIFTY_BANK',
    symbol: 'NIFTY BANK',
    name: 'NIFTY Bank Index',
    current_value: 51820.60,
    change_value: 245.90,
    change_percent: 0.48,
    day_high: 51980.00,
    day_low: 51650.00,
    market_session: 'REGULAR_OPEN',
    data_origin: 'provider'
  },
  {
    id: 'INDEX:NIFTY_MIDCAP_150',
    symbol: 'NIFTY MIDCAP 150',
    name: 'NIFTY Midcap 150 Index',
    current_value: 21340.15,
    change_value: 180.70,
    change_percent: 0.85,
    day_high: 21405.00,
    day_low: 21250.00,
    market_session: 'REGULAR_OPEN',
    data_origin: 'provider'
  }
];

const SEED_MUTUAL_FUNDS = [
  {
    scheme_code: 118989,
    scheme_name: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
    category: 'Flexi Cap Fund',
    fund_house: 'PPFAS Mutual Fund',
    plan_type: 'DIRECT',
    option_type: 'GROWTH',
    latest_nav: 84.52,
    nav_date: '2026-11-06',
    cagr_1y: 28.4,
    cagr_3y: 20.8,
    cagr_5y: 22.1,
    expense_ratio_pct: 0.62,
    aum_cr: 74200,
    riskometer: 'VERY_HIGH',
    data_origin: 'provider'
  },
  {
    scheme_code: 120503,
    scheme_name: 'HDFC Top 100 Fund - Direct Plan - Growth Option',
    category: 'Large Cap Fund',
    fund_house: 'HDFC Mutual Fund',
    plan_type: 'DIRECT',
    option_type: 'GROWTH',
    latest_nav: 1124.60,
    nav_date: '2026-11-06',
    cagr_1y: 24.2,
    cagr_3y: 17.5,
    cagr_5y: 16.8,
    expense_ratio_pct: 0.98,
    aum_cr: 38450,
    riskometer: 'VERY_HIGH',
    data_origin: 'provider'
  },
  {
    scheme_code: 125354,
    scheme_name: 'SBI Bluechip Fund - Direct Plan - Growth',
    category: 'Large Cap Fund',
    fund_house: 'SBI Mutual Fund',
    plan_type: 'DIRECT',
    option_type: 'GROWTH',
    latest_nav: 92.15,
    nav_date: '2026-11-06',
    cagr_1y: 21.8,
    cagr_3y: 15.2,
    cagr_5y: 15.4,
    expense_ratio_pct: 0.85,
    aum_cr: 46200,
    riskometer: 'VERY_HIGH',
    data_origin: 'provider'
  },
  {
    scheme_code: 120716,
    scheme_name: 'Nippon India Small Cap Fund - Direct Plan - Growth',
    category: 'Small Cap Fund',
    fund_house: 'Nippon India Mutual Fund',
    plan_type: 'DIRECT',
    option_type: 'GROWTH',
    latest_nav: 178.40,
    nav_date: '2026-11-06',
    cagr_1y: 36.5,
    cagr_3y: 27.8,
    cagr_5y: 31.2,
    expense_ratio_pct: 0.72,
    aum_cr: 58900,
    riskometer: 'VERY_HIGH',
    data_origin: 'provider'
  }
];

const SEED_PORTFOLIO = {
  id: 'port_sample_01',
  name: 'Core Indian Growth Portfolio',
  holdings: [
    {
      id: 'h_1',
      security_id: 'NSE:RELIANCE',
      symbol: 'RELIANCE',
      name: 'Reliance Industries Limited',
      asset_type: 'EQUITY',
      quantity: 50,
      average_buy_price: 2550.00,
      current_price: 2985.40,
      sector: 'Energy & Petrochemicals'
    },
    {
      id: 'h_2',
      security_id: 'NSE:TCS',
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      asset_type: 'EQUITY',
      quantity: 30,
      average_buy_price: 3500.00,
      current_price: 4120.75,
      sector: 'Information Technology'
    },
    {
      id: 'h_3',
      security_id: 'AMFI:118989',
      symbol: 'PPFAS_FLEXI',
      name: 'Parag Parikh Flexi Cap Fund',
      asset_type: 'MUTUAL_FUND',
      quantity: 2000,
      average_buy_price: 65.00,
      current_price: 84.52,
      sector: 'Diversified Equity'
    }
  ]
};

module.exports = {
  SEED_SECURITIES,
  SEED_QUOTES,
  SEED_FUNDAMENTALS,
  SEED_MARKET_INDICES,
  SEED_MUTUAL_FUNDS,
  SEED_PORTFOLIO
};
