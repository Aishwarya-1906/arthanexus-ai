const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '../../');
const { DataGridPipeline } = require(path.join(rootDir, 'dataops/pipeline/bronze_silver_gold.js'));
const { runQualityGate } = require(path.join(rootDir, 'dataops/quality/gates.js'));
const { SchedulerControlPlane } = require(path.join(rootDir, 'ops/scheduler/leases.js'));

test('DataGrid Pipeline — Bronze Landing & Checksum', async () => {
  const pipeline = new DataGridPipeline();
  const rawPayload = [
    { scheme_code: 1001, scheme_name: 'Test Fund Growth', nav: 45.2, date: '2026-11-09' }
  ];

  const bronze = await pipeline.landBronze('AMFI_NAV', rawPayload, { sourceUrl: 'https://amfi.test' });
  assert.ok(bronze.bronzeMetadata.checksum.length === 64, 'SHA256 checksum must be 64 hex characters');
  assert.ok(bronze.bronzeMetadata.partitionKey.startsWith('bronze/AMFI_NAV/'));
});

test('DataGrid Pipeline — Silver Quality Gate & Quarantine', () => {
  const records = [
    { id: '1', symbol: 'VALID', pe_ratio: 25.0 },
    { id: '2', symbol: '', pe_ratio: 15.0 }, // Fails required field
    { id: '3', symbol: 'BAD_PE', pe_ratio: -500.0 }, // Fails range check
    { id: '1', symbol: 'DUP', pe_ratio: 30.0 } // Duplicate key
  ];

  const report = runQualityGate('TEST_SECURITIES', records, {
    requiredFields: ['symbol'],
    rangeChecks: { pe_ratio: [0, 500] },
    uniqueKey: 'id'
  });

  assert.equal(report.passedRecords.length, 1);
  assert.equal(report.quarantinedRecords.length, 3);
  assert.equal(report.passedRecords[0].symbol, 'VALID');
});

test('DataGrid Pipeline — Gold Materialization & Lineage Edge', async () => {
  const pipeline = new DataGridPipeline();
  const raw = [{ id: '1', val: 10 }, { id: '2', val: 20 }];
  const bronze = await pipeline.landBronze('TEST', raw);
  const silver = pipeline.processSilver('TEST', bronze);
  const gold = pipeline.materializeGold('TEST', silver, (recs) => {
    return { total: recs.reduce((sum, r) => sum + r.val, 0) };
  });

  assert.equal(gold.goldData.total, 30);
  assert.ok(pipeline.lineageEdges.length >= 2, 'Should trace bronze->silver and silver->gold');
});

test('Scheduler Control Plane — Leases & Duplicate Defense', async () => {
  const scheduler = new SchedulerControlPlane();
  const key1 = scheduler.generateIdempotencyKey('AMFI_NAV', 'SRC_AMFI', '2026-11-09T21:30:00Z');
  const key2 = scheduler.generateIdempotencyKey('AMFI_NAV', 'SRC_AMFI', '2026-11-09T21:30:00Z');
  assert.equal(key1, key2, 'Same window parameters must yield identical idempotency key');

  // Claim 1: Worker A claims lease
  const claim1 = await scheduler.acquireLease(key1, 'worker_cloudflare_01', 30);
  assert.equal(claim1.acquired, true);
  assert.equal(claim1.fencingToken, 1);

  // Claim 2: Worker B attempts simultaneous claim with same key
  const claim2 = await scheduler.acquireLease(key1, 'worker_github_actions_watchdog', 30);
  assert.equal(claim2.acquired, false, 'Simultaneous claim by another worker must be blocked');
  assert.ok(claim2.reason.includes('already leased'));

  // Release lease
  await scheduler.releaseLease(key1, 'worker_cloudflare_01');
  const claim3 = await scheduler.acquireLease(key1, 'worker_github_actions_watchdog', 30);
  assert.equal(claim3.acquired, true, 'After release, lease should be grantable');
});
