/**
 * ArthaNexus DataGrid — AMFI India NAV Connector
 * Extracts, parses and validates official daily Mutual Fund NAVs
 * Official Source: https://www.amfiindia.com/spages/NAVAll.txt
 */

const crypto = require('node:crypto');

const AMFI_ENDPOINT = 'https://www.amfiindia.com/spages/NAVAll.txt';

/**
 * Parses raw AMFI semicolon-delimited text data into structured records
 * Format:
 * Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date
 */
function parseAmfiNavText(rawText, maxRows = 500) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Invalid AMFI payload: string expected');
  }

  const lines = rawText.split('\n');
  const records = [];
  let currentCategory = 'Other';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // AMFI text files include category header lines without semicolons
    // e.g. "Open Ended Schemes ( Equity Scheme - Large Cap Fund )"
    if (!trimmed.includes(';')) {
      if (trimmed.includes('Schemes') || trimmed.includes('Fund')) {
        currentCategory = trimmed;
      }
      continue;
    }

    const parts = trimmed.split(';');
    if (parts.length < 6) continue;

    const schemeCode = parseInt(parts[0], 10);
    if (isNaN(schemeCode)) continue; // Header row (e.g. "Scheme Code;ISIN...")

    const isinGrowth = parts[1]?.trim() || null;
    const isinReinvest = parts[2]?.trim() || null;
    const schemeName = parts[3]?.trim();
    const navStr = parts[4]?.trim();
    const navDateStr = parts[5]?.trim();

    const nav = parseFloat(navStr);
    if (isNaN(nav) || nav <= 0) continue; // Skip unquoted / invalid NAV entries

    // Determine plan type and option type from scheme name
    const isDirect = /direct/i.test(schemeName);
    const isGrowth = /growth/i.test(schemeName);

    records.push({
      scheme_code: schemeCode,
      scheme_name: schemeName,
      isin_growth: isinGrowth,
      isin_div_reinvestment: isinReinvest,
      category: currentCategory,
      fund_house: extractFundHouse(schemeName),
      plan_type: isDirect ? 'DIRECT' : 'REGULAR',
      option_type: isGrowth ? 'GROWTH' : 'IDCW',
      latest_nav: nav,
      nav_date: parseAmfiDate(navDateStr),
      observed_at: new Date().toISOString(),
      source_name: 'AMFI_INDIA',
      source_url: AMFI_ENDPOINT
    });

    if (records.length >= maxRows) break;
  }

  return records;
}

function extractFundHouse(schemeName) {
  const commonHouses = [
    'HDFC', 'ICICI Prudential', 'SBI', 'Nippon India', 'Kotak Mahindra',
    'Axis', 'UTI', 'Aditya Birla Sun Life', 'Mirae Asset', 'Tata',
    'DSP', 'Parag Parikh', 'Bandhan', 'Quant', 'Motilal Oswal'
  ];
  for (const house of commonHouses) {
    if (new RegExp(`^${house}|\\b${house}\\b`, 'i').test(schemeName)) {
      return `${house} Mutual Fund`;
    }
  }
  const firstWord = schemeName.split(' ')[0];
  return `${firstWord} Mutual Fund`;
}

function parseAmfiDate(dateStr) {
  // AMFI date format is typically "09-Nov-2026" or "09-11-2026"
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch {}
  return new Date().toISOString().split('T')[0];
}

/**
 * Fetches real live NAVs from AMFI endpoint with timeout and error fallback
 */
async function fetchAmfiNavs(options = { timeoutMs: 10000, maxRows: 300 }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const response = await fetch(AMFI_ENDPOINT, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ArthaNexus-AI-DataGrid/1.0 (+https://arthanexus.ai)'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AMFI HTTP error: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    const checksum = crypto.createHash('sha256').update(text).digest('hex');
    const records = parseAmfiNavText(text, options.maxRows);

    return {
      success: true,
      records,
      record_count: records.length,
      checksum,
      raw_size_bytes: Buffer.byteLength(text),
      fetched_at: new Date().toISOString(),
      source: AMFI_ENDPOINT,
      data_origin: 'provider'
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      success: false,
      error: err.message,
      records: [],
      data_origin: 'provider',
      fallback_available: true
    };
  }
}

module.exports = {
  AMFI_ENDPOINT,
  parseAmfiNavText,
  fetchAmfiNavs
};
