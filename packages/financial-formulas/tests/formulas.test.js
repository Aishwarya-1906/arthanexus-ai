const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateAbsoluteReturn,
  calculateCAGR,
  calculateXIRR,
  calculateMaxDrawdown,
  calculateAnnualizedVolatility,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateSIP,
  calculateLumpSum,
  calculateEMI,
  calculateIndianTaxComparison,
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateBollingerBands
} = require('../src/index.js');

test('Financial Formulas — Absolute Return', () => {
  const result = calculateAbsoluteReturn(100, 150);
  assert.equal(result, 50);

  const loss = calculateAbsoluteReturn(100, 80);
  assert.equal(loss, -20);
});

test('Financial Formulas — CAGR', () => {
  // Doubling money in 3 years => (2^(1/3) - 1) * 100 ~= 25.992%
  const cagr = calculateCAGR(100000, 200000, 3);
  assert.ok(Math.abs(cagr - 25.992) < 0.01);
});

test('Financial Formulas — XIRR', () => {
  // Investment of 10,000 on Jan 1, 2023, return of 12,000 on Jan 1, 2024 (~20%)
  const cashFlows = [
    { amount: -10000, date: '2023-01-01' },
    { amount: 12000, date: '2024-01-01' }
  ];
  const rate = calculateXIRR(cashFlows);
  assert.ok(Math.abs(rate - 20.0) < 0.5);
});

test('Financial Formulas — Max Drawdown', () => {
  const prices = [100, 120, 150, 105, 110, 160, 140];
  const { maxDrawdownPct, peakIndex, troughIndex } = calculateMaxDrawdown(prices);
  // Peak 150 to trough 105 is (150-105)/150 = 30%
  assert.equal(maxDrawdownPct, 30);
  assert.equal(peakIndex, 2);
  assert.equal(troughIndex, 3);
});

test('Financial Formulas — Annualized Volatility & Sharpe Ratio', () => {
  const prices = [100, 102, 101, 103, 102, 105, 104, 106, 105, 108];
  const vol = calculateAnnualizedVolatility(prices);
  assert.ok(vol > 0, 'Volatility should be positive');

  const sharpe = calculateSharpeRatio(15, vol, 6.5);
  assert.ok(sharpe > 0, 'Sharpe ratio should be positive when return exceeds risk-free rate');
});

test('Financial Formulas — SIP Calculator', () => {
  // 5000/month for 5 years at 12% return
  const result = calculateSIP(5000, 12, 5, 6);
  assert.equal(result.totalInvested, 300000);
  // Future value should be approx 4,12,432
  assert.ok(result.futureValue > 410000 && result.futureValue < 420000);
  assert.ok(result.inflationAdjustedValue < result.futureValue);
});

test('Financial Formulas — Lump-Sum Calculator', () => {
  const result = calculateLumpSum(100000, 10, 5, 5);
  assert.equal(result.investedAmount, 100000);
  // 100,000 * 1.10^5 = 161,051
  assert.equal(result.futureValue, 161051);
  assert.ok(result.inflationAdjustedValue > 100000);
});

test('Financial Formulas — EMI & Loan Amortization', () => {
  // 10 Lakhs loan, 8.5% p.a., 20 years
  const result = calculateEMI(1000000, 8.5, 20);
  assert.ok(result.monthlyEMI > 8600 && result.monthlyEMI < 8700);
  assert.equal(result.scheduleSnippet.length, 12);
  assert.equal(result.scheduleSnippet[0].month, 1);
});

test('Financial Formulas — Indian Tax Comparison', () => {
  // 7 Lakhs annual income has 0 tax in New Regime due to rebate
  const lowIncome = calculateIndianTaxComparison(700000);
  assert.equal(lowIncome.newRegime.totalTax, 0);

  // 12 Lakhs income comparison
  const middleIncome = calculateIndianTaxComparison(1200000, 150000, 25000);
  assert.ok(middleIncome.newRegime.totalTax > 0);
  assert.ok(middleIncome.oldRegime.totalTax > 0);
  assert.ok(middleIncome.educationalNotice.includes('Chartered Accountant'));
});

test('Financial Formulas — Technical Indicators (SMA, EMA, RSI, Bollinger Bands)', () => {
  const closes = [
    44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08,
    45.89, 46.03, 45.61, 46.28, 46.28, 46.00, 46.03, 46.41, 46.22, 45.64, 46.21
  ];

  const sma = calculateSMA(closes, 5);
  assert.ok(sma.length > 0);

  const ema = calculateEMA(closes, 5);
  assert.ok(ema.length > 0);

  const rsi = calculateRSI(closes, 14);
  assert.ok(rsi.length > 0);
  assert.ok(rsi[0].value >= 0 && rsi[0].value <= 100);

  const bb = calculateBollingerBands(closes, 20, 2);
  assert.ok(bb.length > 0);
  assert.ok(bb[0].upper >= bb[0].middle);
  assert.ok(bb[0].middle >= bb[0].lower);
});
