/**
 * tests/unit/sebi.test.js — SEBI Instructor Agent Unit Tests
 */

'use strict';
const { test } = require('node:test');
const assert   = require('node:assert/strict');
const path     = require('node:path');

const {
  SEBIInstructorAgent,
  NSEDataFetcher,
  SEBI_REGULATIONS,
  MARKET_CONCEPTS,
  sebiAgent,
  nseDataFetcher,
} = require(path.join(__dirname, '../../packages/sebi-agent/src/index.js'));

test('SEBI Agent — Market Status is computed from system clock', () => {
  const status = sebiAgent.getMarketStatus();
  assert.ok(['OPEN', 'CLOSED', 'PRE-OPEN', 'CLOSING'].includes(status.status), 'valid status');
  assert.ok(status.session, 'session string present');
  assert.ok(status.current_ist.match(/\d{2}:\d{2} IST/), 'IST time format');
  assert.equal(status.settlement_cycle, 'T+1');
  assert.equal(status.data_origin, 'system_clock');
});

test('SEBI Agent — SEBI Regulation lookup returns key_rules', () => {
  const reg = sebiAgent.explainSEBIRegulation('investment_adviser');
  assert.equal(reg.found, true);
  assert.ok(Array.isArray(reg.key_rules), 'key_rules is array');
  assert.ok(reg.key_rules.length >= 3, 'at least 3 rules');
  assert.ok(reg.regulation.includes('SEBI'), 'regulation name contains SEBI');
});

test('SEBI Agent — Unknown regulation returns helpful not-found response', () => {
  const reg = sebiAgent.explainSEBIRegulation('unknown_xyz');
  assert.equal(reg.found, false);
  assert.ok(Array.isArray(reg.available_topics), 'lists available topics');
});

test('SEBI Agent — Market concept lookup works for all defined concepts', () => {
  const keys = Object.keys(MARKET_CONCEPTS);
  assert.ok(keys.length >= 5, 'at least 5 concepts');
  for (const k of keys) {
    const c = sebiAgent.explainMarketConcept(k);
    assert.equal(c.found, true, `concept ${k} found`);
  }
});

test('SEBI Agent — 6-Agent Equity Report structure is complete', () => {
  const report = sebiAgent.generateEquityReport('RELIANCE', {
    last_price: 2850, high_52w: 3200, low_52w: 2200, beta: 0.95, rsi_14: 58,
  }, {
    pe_ratio: 23, pb_ratio: 2.8, roe: 16, eps: 90, market_cap_cr: 190000,
  });

  assert.ok(report.consensus_rating, 'has consensus_rating');
  assert.ok(report.consensus_score,  'has consensus_score');
  assert.ok(report.executive_summary.length > 50, 'summary is non-trivial');
  assert.ok(report.agents.bull,       'bull agent present');
  assert.ok(report.agents.bear,       'bear agent present');
  assert.ok(report.agents.technical,  'technical agent present');
  assert.ok(report.agents.fundamental,'fundamental agent present');
  assert.ok(report.agents.risk,       'risk agent present');
  assert.ok(report.agents.compliance, 'compliance agent present');
  assert.ok(Array.isArray(report.next_steps) && report.next_steps.length > 0, 'next_steps present');

  // Technical analysis checks
  const tech = report.agents.technical;
  assert.ok(tech.indicators.rsi_14.includes('58'), 'RSI reflects input');
  assert.ok(tech.swing_trade_setup.risk_reward.includes('1:'), 'swing trade has RR');

  // Compliance checks
  const comply = report.agents.compliance;
  assert.equal(comply.regulatory_status, 'EDUCATIONAL ONLY — NOT INVESTMENT ADVICE');
  assert.ok(comply.mandatory_disclosures.length >= 4, 'has compliance disclosures');
});

test('SEBI Agent — NISM Module info returns correct exam metadata', () => {
  const info = sebiAgent.getNISMModuleInfo('VIII-equity-derivatives');
  assert.ok(info.full_name.includes('NISM'), 'has full name');
  assert.ok(info.syllabus_highlights.length > 0, 'has syllabus');
  assert.ok(info.exam_duration, 'has exam duration');
  assert.ok(info.registration.includes('nism'), 'has registration URL');
});

test('SEBI Agent — Bull analysis produces valid arguments', () => {
  const bull = sebiAgent._bullAnalysis('TCS', { last_price: 4200, rsi_14: 60 }, { roe: 50, pe_ratio: 29, revenue_growth_yoy: 15 });
  assert.equal(bull.verdict, 'BULLISH');
  assert.ok(bull.arguments.length >= 3, 'at least 3 arguments');
  assert.ok(bull.price_target_upside.includes('%'), 'has price target');
});

test('SEBI Agent — Bear analysis produces caution with arguments', () => {
  const bear = sebiAgent._bearAnalysis('HDFCBANK', {}, { pe_ratio: 18 });
  assert.equal(bear.verdict, 'CAUTIOUS');
  assert.ok(bear.arguments.length >= 3, 'at least 3 risk arguments');
  assert.ok(bear.downside_risk, 'has downside risk estimate');
});

test('NSE Data Fetcher — Seed fallback returns valid quote', async () => {
  // Force fallback by passing an unsupported node env where fetch is unavailable
  const fetcher = new NSEDataFetcher();
  const quote = await fetcher._seedFallback('RELIANCE', 'unit test forced fallback');
  assert.equal(quote.symbol, 'RELIANCE');
  assert.ok(quote.last_price > 0, 'positive price');
  assert.equal(quote.data_origin, 'demo_telemetry');
  assert.ok(quote.fetched_at, 'has timestamp');
});

test('NSE Data Fetcher — Unknown symbol generates synthetic seed', async () => {
  const fetcher = new NSEDataFetcher();
  const quote = await fetcher._seedFallback('FOOBAR123', 'unit test');
  assert.equal(quote.symbol, 'FOOBAR123');
  assert.ok(quote.last_price > 0);
  assert.equal(quote.data_origin, 'demo_telemetry');
});

test('SEBI Regulations DB — All 5 regulation topics are defined', () => {
  const required = ['investment_adviser', 'research_analyst', 'lodr', 'mutual_funds', 'investor_protection'];
  for (const r of required) {
    assert.ok(SEBI_REGULATIONS[r], `${r} defined in SEBI_REGULATIONS`);
    assert.ok(SEBI_REGULATIONS[r].key_rules.length >= 2, `${r} has at least 2 rules`);
  }
});
