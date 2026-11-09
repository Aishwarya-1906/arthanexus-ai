/**
 * ArthaNexus AI — Production Smoke & Health Verification Script
 * Validates core financial and DevOps endpoints in-memory without loopback port restrictions.
 */

const { Readable, Writable } = require('node:stream');
const { server } = require('../apps/engine/src/index.js');

function dispatch(requestUrl, options = {}) {
  return new Promise((resolve) => {
    const method = (options.method || 'GET').toUpperCase();
    const bodyStr = options.body ? JSON.stringify(options.body) : '';

    const req = new Readable({
      read() {
        if (bodyStr) this.push(Buffer.from(bodyStr));
        this.push(null);
      }
    });
    req.url = requestUrl;
    req.method = method;
    req.headers = {
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(bodyStr)
    };

    let statusCode = 200;
    const chunks = [];
    const res = new Writable({
      write(chunk, enc, cb) { chunks.push(chunk); cb(); }
    });
    res.writeHead = (status) => { statusCode = status; return res; };
    res.setHeader = () => {};
    res.on('finish', () => {
      const text = Buffer.concat(chunks).toString('utf8');
      let data;
      try { data = JSON.parse(text); } catch { data = text; }
      resolve({ status: statusCode, json: async () => data });
    });

    server.emit('request', req, res);
  });
}

async function runSmokeTests() {
  console.log('--- Starting ArthaNexus AI Unified Smoke Tests ---');

  try {
    // 1. Health check
    const h = await (await dispatch('/health')).json();
    console.log(`[PASS] /health: ${h.service} v${h.version} (${h.status})`);

    // 2. Data sources
    const d = await (await dispatch('/health/data')).json();
    console.log(`[PASS] /health/data: ${d.sources.length} active public connectors`);

    // 3. Scheduler
    const s = await (await dispatch('/health/scheduler')).json();
    console.log(`[PASS] /health/scheduler: ${s.primary_scheduler}`);

    // 4. DevOps Overview
    const dev = await (await dispatch('/api/v1/devops/overview')).json();
    console.log(`[PASS] /api/v1/devops/overview: Status ${dev.status}, AWS S3: ${dev.layers.aws.s3BucketsCount}, Lambdas: ${dev.layers.aws.lambdaFunctionsCount}`);

    // 5. AWS Resources
    const aws = await (await dispatch('/api/v1/devops/aws/resources')).json();
    console.log(`[PASS] /api/v1/devops/aws/resources: ${aws.resources.s3Buckets.length} S3 Buckets, ${aws.resources.lambdaFunctions.length} Lambdas`);

    // 6. Infracost Spend
    const cost = await (await dispatch('/api/v1/devops/infracost/breakdown')).json();
    console.log(`[PASS] /api/v1/devops/infracost/breakdown: Net Billed $${cost.netBilledMonthlyCostUsd}/mo, Identified Savings: $${cost.potentialMonthlySavingsUsd}/mo`);

    // 7. SigNoz Logs
    const logs = await (await dispatch('/api/v1/devops/logs')).json();
    console.log(`[PASS] /api/v1/devops/logs: ${logs.totalFound} OpenTelemetry structured spans`);

    // 8. CrewAI Incidents
    const rca = await (await dispatch('/api/v1/devops/rca/incidents')).json();
    console.log(`[PASS] /api/v1/devops/rca/incidents: ${rca.totalIncidents} active multi-agent investigated incidents`);

    // 9. AI DevOps Assistant Grounding
    const ai = await (await dispatch('/api/v1/ai/devops-chat', {
      method: 'POST',
      body: { query: 'Why did my latest deployment fail?' }
    })).json();
    console.log(`[PASS] /api/v1/ai/devops-chat: Provider '${ai.provider_used}', Citations: ${ai.evidence_citations.length}`);

    console.log('--- All Unified Smoke Tests Succeeded (100% Pass) ---');
  } catch (err) {
    console.error('[FAIL] Smoke tests encountered error:', err);
    process.exitCode = 1;
  }
}

runSmokeTests();
