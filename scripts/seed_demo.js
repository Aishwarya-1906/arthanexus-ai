/**
 * ArthaNexus AI — Demo Seed Script
 * Generates synthetic fixtures strictly tagged with data_origin: 'demo'.
 * Notice: Synthetic values must never be blended into production tables without this tag.
 */

const {
  SEED_SECURITIES,
  SEED_QUOTES,
  SEED_FUNDAMENTALS,
  SEED_MUTUAL_FUNDS
} = require('../database/seeds/sample_data.js');

console.log('--- Seeding ArthaNexus Demo Environment ---');
console.log('Notice: All generated records have data_origin = "demo".');

const demoSecurities = SEED_SECURITIES.map(s => ({
  ...s,
  id: `DEMO:${s.symbol}`,
  data_origin: 'demo',
  source_name: 'SYNTHETIC_DEMO_FIXTURE'
}));

console.log(`[SEED] Created ${demoSecurities.length} demo securities.`);
console.log(`[SEED] Created ${SEED_MUTUAL_FUNDS.length} demo mutual fund schemes.`);
console.log('[SEED] Demo mode ready. Displays "DEMO DATA — NOT MARKET DATA" banner in UI.');
