/**
 * ArthaNexus AI — Deterministic Financial & Quant Math Engine
 * Pure mathematical functions for returns, volatility, risk ratios,
 * SIP/EMI/Tax calculators, and technical indicators.
 */

// --------------------------------------------------------------------------
// 1. Returns & Compounding
// --------------------------------------------------------------------------

/**
 * Calculates Absolute Return: ((Final - Initial) / Initial) * 100
 */
function calculateAbsoluteReturn(initialValue, finalValue) {
  if (initialValue <= 0) throw new Error("Initial value must be greater than zero.");
  return ((finalValue - initialValue) / initialValue) * 100;
}

/**
 * Calculates Compound Annual Growth Rate (CAGR)
 * Formula: ((Final / Initial) ^ (1 / years) - 1) * 100
 */
function calculateCAGR(initialValue, finalValue, years) {
  if (initialValue <= 0) throw new Error("Initial value must be positive.");
  if (finalValue < 0) throw new Error("Final value cannot be negative.");
  if (years <= 0) throw new Error("Years must be greater than zero.");
  return (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
}

/**
 * Calculates Extended Internal Rate of Return (XIRR) using Newton-Raphson
 * with bisection fallback for irregular cash flow dates.
 *
 * @param {Array<{ amount: number, date: Date | string }>} cashFlows
 * @param {number} guess - Initial guess rate (default 0.1)
 * @returns {number} Annualized rate of return in percentage
 */
function calculateXIRR(cashFlows, guess = 0.1) {
  if (!cashFlows || cashFlows.length < 2) {
    throw new Error("XIRR requires at least 2 cash flows.");
  }

  const parsed = cashFlows.map(cf => ({
    amount: Number(cf.amount),
    time: (new Date(cf.date).getTime() - new Date(cashFlows[0].date).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  }));

  const hasPositive = parsed.some(c => c.amount > 0);
  const hasNegative = parsed.some(c => c.amount < 0);
  if (!hasPositive || !hasNegative) {
    throw new Error("XIRR requires at least one positive and one negative cash flow.");
  }

  // NPV function
  const npv = (rate) => {
    return parsed.reduce((sum, cf) => {
      return sum + cf.amount / Math.pow(1 + rate, cf.time);
    }, 0);
  };

  // Derivative of NPV
  const dnpv = (rate) => {
    return parsed.reduce((sum, cf) => {
      return sum - (cf.time * cf.amount) / Math.pow(1 + rate, cf.time + 1);
    }, 0);
  };

  let rate = guess;
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let i = 0; i < maxIterations; i++) {
    const value = npv(rate);
    if (Math.abs(value) < tolerance) {
      return rate * 100;
    }
    const derivative = dnpv(rate);
    if (Math.abs(derivative) < 1e-10) break; // Derivative too small, switch to bisection

    const newRate = rate - value / derivative;
    if (newRate <= -0.999) {
      rate = (rate - 0.999) / 2;
    } else {
      rate = newRate;
    }
  }

  // Bisection fallback if Newton didn't converge
  let low = -0.999;
  let high = 10.0;
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const val = npv(mid);
    if (Math.abs(val) < tolerance) return mid * 100;
    if (val * npv(low) < 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return rate * 100;
}

// --------------------------------------------------------------------------
// 2. Risk, Drawdown & Volatility
// --------------------------------------------------------------------------

/**
 * Calculates Maximum Drawdown and Drawdown Series from price bars or NAV series.
 * Formula: (Peak - Trough) / Peak * 100
 */
function calculateMaxDrawdown(prices) {
  if (!prices || prices.length === 0) return { maxDrawdownPct: 0, peakIndex: 0, troughIndex: 0 };
  let peak = prices[0];
  let peakIndex = 0;
  let maxDrawdown = 0;
  let mddPeakIdx = 0;
  let mddTroughIdx = 0;

  for (let i = 0; i < prices.length; i++) {
    if (prices[i] > peak) {
      peak = prices[i];
      peakIndex = i;
    }
    const drawdown = ((peak - prices[i]) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      mddPeakIdx = peakIndex;
      mddTroughIdx = i;
    }
  }

  return {
    maxDrawdownPct: maxDrawdown,
    peakIndex: mddPeakIdx,
    troughIndex: mddTroughIdx
  };
}

/**
 * Calculates Annualized Volatility (Standard Deviation of daily logarithmic returns)
 * assuming 252 Indian trading days per year.
 */
function calculateAnnualizedVolatility(prices, tradingDaysPerYear = 252) {
  if (!prices || prices.length < 2) return 0;
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
  }
  if (returns.length < 2) return 0;

  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
  const dailyStdDev = Math.sqrt(variance);

  return dailyStdDev * Math.sqrt(tradingDaysPerYear) * 100;
}

/**
 * Calculates Sharpe Ratio
 * (Portfolio Return - Risk Free Rate) / Annualized Volatility
 * Default riskFreeRatePct = 6.5 (Approx. Indian 10-Yr Benchmark G-Sec yield)
 */
function calculateSharpeRatio(portfolioReturnPct, volatilityPct, riskFreeRatePct = 6.5) {
  if (volatilityPct <= 0) return 0;
  return (portfolioReturnPct - riskFreeRatePct) / volatilityPct;
}

/**
 * Calculates Sortino Ratio (Penalizes only downside deviation below target/risk-free)
 */
function calculateSortinoRatio(dailyReturnsPct, annualizedReturnPct, riskFreeRatePct = 6.5) {
  if (!dailyReturnsPct || dailyReturnsPct.length === 0) return 0;
  const dailyRf = riskFreeRatePct / 252;
  const downsideDifferences = dailyReturnsPct.map(r => Math.min(0, r - dailyRf));
  const downsideVariance =
    downsideDifferences.reduce((sum, d) => sum + Math.pow(d, 2), 0) / dailyReturnsPct.length;
  const downsideDeviation = Math.sqrt(downsideVariance) * Math.sqrt(252);

  if (downsideDeviation <= 0) return 0;
  return (annualizedReturnPct - riskFreeRatePct) / downsideDeviation;
}

// --------------------------------------------------------------------------
// 3. Educational Financial Calculators
// --------------------------------------------------------------------------

/**
 * SIP (Systematic Investment Plan) Calculator
 * Compounded monthly: M * [ ( (1 + i)^n - 1 ) / i ] * (1 + i)
 *
 * @param {number} monthlyInvestment - Monthly SIP amount (INR)
 * @param {number} expectedAnnualReturnPct - e.g. 12%
 * @param {number} tenureYears - e.g. 10 years
 * @param {number} inflationPct - Optional annual inflation rate to calculate real value
 */
function calculateSIP(monthlyInvestment, expectedAnnualReturnPct, tenureYears, inflationPct = 0) {
  if (monthlyInvestment <= 0 || tenureYears <= 0) {
    throw new Error("Monthly investment and tenure must be positive.");
  }
  const i = expectedAnnualReturnPct / (12 * 100);
  const n = tenureYears * 12;
  const totalInvested = monthlyInvestment * n;

  let futureValue;
  if (i === 0) {
    futureValue = totalInvested;
  } else {
    futureValue = monthlyInvestment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  }

  const wealthGained = futureValue - totalInvested;

  // Inflation-adjusted future purchasing power
  let inflationAdjustedValue = futureValue;
  if (inflationPct > 0) {
    inflationAdjustedValue = futureValue / Math.pow(1 + inflationPct / 100, tenureYears);
  }

  return {
    totalInvested: Math.round(totalInvested),
    futureValue: Math.round(futureValue),
    wealthGained: Math.round(wealthGained),
    inflationAdjustedValue: Math.round(inflationAdjustedValue),
    tenureMonths: n
  };
}

/**
 * Lump-Sum Investment Calculator
 * Formula: P * (1 + r/n)^(n*t)
 */
function calculateLumpSum(principal, expectedAnnualReturnPct, tenureYears, inflationPct = 0) {
  if (principal <= 0 || tenureYears <= 0) {
    throw new Error("Principal and tenure must be positive.");
  }
  const futureValue = principal * Math.pow(1 + expectedAnnualReturnPct / 100, tenureYears);
  const wealthGained = futureValue - principal;

  let inflationAdjustedValue = futureValue;
  if (inflationPct > 0) {
    inflationAdjustedValue = futureValue / Math.pow(1 + inflationPct / 100, tenureYears);
  }

  return {
    investedAmount: Math.round(principal),
    futureValue: Math.round(futureValue),
    wealthGained: Math.round(wealthGained),
    inflationAdjustedValue: Math.round(inflationAdjustedValue)
  };
}

/**
 * EMI & Loan Amortization Calculator
 * Formula: E = P * r * (1 + r)^n / [ (1 + r)^n - 1 ]
 */
function calculateEMI(principal, annualInterestRatePct, tenureYears) {
  if (principal <= 0 || annualInterestRatePct < 0 || tenureYears <= 0) {
    throw new Error("Invalid loan parameters.");
  }
  const r = annualInterestRatePct / (12 * 100);
  const n = tenureYears * 12;

  let emi;
  if (r === 0) {
    emi = principal / n;
  } else {
    emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const totalPayment = emi * n;
  const totalInterest = totalPayment - principal;

  // Build first 12 months amortization schedule snippet
  let balance = principal;
  const scheduleSnippet = [];
  for (let month = 1; month <= Math.min(12, n); month++) {
    const interest = balance * r;
    const principalPaid = emi - interest;
    balance -= principalPaid;
    scheduleSnippet.push({
      month,
      emi: Math.round(emi),
      principalPaid: Math.round(principalPaid),
      interestPaid: Math.round(interest),
      remainingBalance: Math.max(0, Math.round(balance))
    });
  }

  return {
    monthlyEMI: Math.round(emi),
    principal: Math.round(principal),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    scheduleSnippet
  };
}

/**
 * Indian Income Tax Educational Calculator (FY 2024-25 / FY 2025-26)
 * Compares New Tax Regime (Section 115BAC default) vs Old Tax Regime.
 * Strictly educational: includes explicit CA verification notice.
 */
function calculateIndianTaxComparison(annualIncome, deductions80C = 0, healthInsurance80D = 0, hraExemption = 0) {
  if (annualIncome < 0) throw new Error("Income cannot be negative.");

  // 1. New Regime (Default)
  // Standard Deduction of Rs. 75,000 for salaried employees
  const newStandardDeduction = 75000;
  const taxableIncomeNew = Math.max(0, annualIncome - newStandardDeduction);

  let taxNew = 0;
  if (taxableIncomeNew <= 300000) {
    taxNew = 0;
  } else if (taxableIncomeNew <= 700000) {
    taxNew = (taxableIncomeNew - 300000) * 0.05;
  } else if (taxableIncomeNew <= 1000000) {
    taxNew = 20000 + (taxableIncomeNew - 700000) * 0.10;
  } else if (taxableIncomeNew <= 1200000) {
    taxNew = 50000 + (taxableIncomeNew - 1000000) * 0.15;
  } else if (taxableIncomeNew <= 1500000) {
    taxNew = 80000 + (taxableIncomeNew - 1200000) * 0.20;
  } else {
    taxNew = 140000 + (taxableIncomeNew - 1500000) * 0.30;
  }

  // Section 87A Rebate: Under New Regime, income up to 7 Lakhs (Taxable) has full rebate
  if (taxableIncomeNew <= 700000) {
    taxNew = 0;
  }

  const cessNew = taxNew * 0.04;
  const totalTaxNew = Math.round(taxNew + cessNew);

  // 2. Old Regime
  const oldStandardDeduction = 50000;
  const capped80C = Math.min(150000, deductions80C);
  const capped80D = Math.min(50000, healthInsurance80D);
  const totalDeductionsOld = oldStandardDeduction + capped80C + capped80D + hraExemption;
  const taxableIncomeOld = Math.max(0, annualIncome - totalDeductionsOld);

  let taxOld = 0;
  if (taxableIncomeOld <= 250000) {
    taxOld = 0;
  } else if (taxableIncomeOld <= 500000) {
    taxOld = (taxableIncomeOld - 250000) * 0.05;
  } else if (taxableIncomeOld <= 1000000) {
    taxOld = 12500 + (taxableIncomeOld - 500000) * 0.20;
  } else {
    taxOld = 112500 + (taxableIncomeOld - 1000000) * 0.30;
  }

  // 87A Rebate for Old Regime: Income up to 5 Lakhs is zero tax
  if (taxableIncomeOld <= 500000) {
    taxOld = 0;
  }

  const cessOld = taxOld * 0.04;
  const totalTaxOld = Math.round(taxOld + cessOld);

  const recommendedRegime = totalTaxNew <= totalTaxOld ? 'NEW_REGIME' : 'OLD_REGIME';
  const taxSavings = Math.abs(totalTaxNew - totalTaxOld);

  return {
    annualIncome,
    newRegime: {
      standardDeduction: newStandardDeduction,
      taxableIncome: taxableIncomeNew,
      taxBeforeCess: Math.round(taxNew),
      healthAndEducationCess: Math.round(cessNew),
      totalTax: totalTaxNew
    },
    oldRegime: {
      totalDeductions: totalDeductionsOld,
      taxableIncome: taxableIncomeOld,
      taxBeforeCess: Math.round(taxOld),
      healthAndEducationCess: Math.round(cessOld),
      totalTax: totalTaxOld
    },
    recommendedRegime,
    taxSavings,
    educationalNotice:
      "This is an educational calculation based on standard provisions of the Indian Income Tax Act. Surcharge on income above 50 Lakhs, marginal relief, and specific exemptions vary. Please verify with a qualified Chartered Accountant before filing."
  };
}

// --------------------------------------------------------------------------
// 4. Technical Indicators
// --------------------------------------------------------------------------

/**
 * Simple Moving Average (SMA)
 */
function calculateSMA(values, period) {
  if (!values || values.length < period) return [];
  const sma = [];
  for (let i = period - 1; i < values.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += values[i - j];
    }
    sma.push({ index: i, value: sum / period });
  }
  return sma;
}

/**
 * Exponential Moving Average (EMA)
 */
function calculateEMA(values, period) {
  if (!values || values.length < period) return [];
  const k = 2 / (period + 1);
  const ema = [];

  // Start with SMA for first EMA seed
  let sum = 0;
  for (let i = 0; i < period; i++) sum += values[i];
  let prevEma = sum / period;
  ema.push({ index: period - 1, value: prevEma });

  for (let i = period; i < values.length; i++) {
    const currentEma = values[i] * k + prevEma * (1 - k);
    ema.push({ index: i, value: currentEma });
    prevEma = currentEma;
  }
  return ema;
}

/**
 * Relative Strength Index (RSI - 14 period Wilder's Smoothing)
 */
function calculateRSI(closes, period = 14) {
  if (!closes || closes.length <= period) return [];
  const changes = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    if (changes[i] >= 0) avgGain += changes[i];
    else avgLoss += Math.abs(changes[i]);
  }
  avgGain /= period;
  avgLoss /= period;

  const rsi = [];
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let currentRsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
  rsi.push({ index: period, value: currentRsi });

  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] >= 0 ? changes[i] : 0;
    const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    currentRsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
    rsi.push({ index: i + 1, value: currentRsi });
  }

  return rsi;
}

/**
 * Bollinger Bands (20 period, 2 standard deviations)
 */
function calculateBollingerBands(closes, period = 20, multiplier = 2) {
  if (!closes || closes.length < period) return [];
  const bands = [];

  for (let i = period - 1; i < closes.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += closes[i - j];
    const middle = sum / period;

    let variance = 0;
    for (let j = 0; j < period; j++) variance += Math.pow(closes[i - j] - middle, 2);
    const stdDev = Math.sqrt(variance / period);

    bands.push({
      index: i,
      upper: middle + multiplier * stdDev,
      middle,
      lower: middle - multiplier * stdDev
    });
  }
  return bands;
}

module.exports = {
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
};
