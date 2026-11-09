const test = require('node:test');
const assert = require('node:assert/strict');
const { Readable, Writable } = require('node:stream');
const { server } = require('../src/index.js');

function dispatch(requestUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const method = (options.method || 'GET').toUpperCase();
    const bodyStr = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : '';

    const req = new Readable({
      read() {
        if (bodyStr) {
          this.push(Buffer.from(bodyStr));
        }
        this.push(null);
      }
    });
    req.url = requestUrl;
    req.method = method;
    req.headers = {
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(bodyStr),
      ...(options.headers || {})
    };

    let statusCode = 200;
    const responseHeaders = {};
    const chunks = [];

    const res = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      }
    });

    res.writeHead = function (status, headers = {}) {
      statusCode = status;
      Object.assign(responseHeaders, headers);
      return this;
    };
    res.setHeader = function (name, val) {
      responseHeaders[name.toLowerCase()] = val;
    };

    res.on('finish', () => {
      const buffer = Buffer.concat(chunks);
      const text = buffer.toString('utf8');
      let data = null;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = text;
      }
      resolve({
        status: statusCode,
        headers: responseHeaders,
        json: async () => data,
        text: async () => text
      });
    });

    server.emit('request', req, res);
  });
}

test('Engine API — Health & Diagnostics', async () => {
  const res = await dispatch('/health');
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'UP');
  assert.equal(data.service, 'ArthaNexus Engine');
  assert.equal(data.allow_paid_services, false);
});

test('Engine API — Data Source Health', async () => {
  const res = await dispatch('/health/data');
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'HEALTHY');
  assert.ok(data.sources.length >= 3);
});

test('Engine API — Scheduler Health', async () => {
  const res = await dispatch('/health/scheduler');
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'OPERATIONAL');
  assert.ok(data.primary_scheduler.includes('Cloudflare Cron'));
});

test('Engine API — Markets Overview', async () => {
  const res = await dispatch('/api/v1/markets/overview');
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.indices.length >= 2);
  assert.equal(data.provenance.data_origin, 'provider');
});

test('Engine API — Mutual Funds Explorer', async () => {
  const res = await dispatch('/api/v1/funds');
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.funds.length > 0);
  assert.ok(data.disclaimer.includes('market risks'));
});

test('Engine API — Screener Query', async () => {
  const res = await dispatch('/api/v1/screener/query', {
    method: 'POST',
    body: { min_roe: 20 }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.results.length > 0);
  assert.ok(data.results.every(r => r.roe_pct >= 20));
});

test('Engine API — SIP Calculator Endpoint', async () => {
  const res = await dispatch('/api/v1/calculators/sip', {
    method: 'POST',
    body: { monthly_investment: 10000, expected_return_pct: 12, tenure_years: 10 }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.totalInvested, 1200000);
  assert.ok(data.futureValue > 2000000);
});

test('Engine API — AI Chat Grounded Fallback', async () => {
  const res = await dispatch('/api/v1/ai/chat', {
    method: 'POST',
    body: { query: 'What is ROCE and how is it calculated?' }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.direct_answer.includes('Return on Capital Employed'));
  assert.ok(data.compliance_notice.includes('SEBI-registered Investment Adviser'));
  assert.ok(data.evidence_citations.length > 0);
});

test('Engine API — DevOps Overview', async () => {
  const res = await dispatch('/api/v1/devops/overview');
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'OPERATIONAL');
  assert.ok(data.layers.aws);
  assert.ok(data.layers.github);
  assert.ok(data.layers.vercel);
});

test('Engine API — AWS Resources & Metrics', async () => {
  const res = await dispatch('/api/v1/devops/aws/resources');
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.resources.s3Buckets.length >= 3);
  assert.ok(data.resources.lambdaFunctions.length >= 4);

  const mRes = await dispatch('/api/v1/devops/aws/metrics?timeRange=24h');
  assert.equal(mRes.status, 200);
  const mData = await mRes.json();
  assert.ok(mData.metrics.length > 0);
});

test('Engine API — Lambda Test Invoke Endpoint', async () => {
  const res = await dispatch('/api/v1/devops/aws/lambda/test', {
    method: 'POST',
    body: { functionName: 'arthanexus-quant-analytics-api' }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.statusCode, 200);
});

test('Engine API — GitHub & Vercel Status', async () => {
  const ghRes = await dispatch('/api/v1/devops/github/status');
  assert.equal(ghRes.status, 200);
  const ghData = await ghRes.json();
  assert.ok(ghData.branches.length > 0);

  const vRes = await dispatch('/api/v1/devops/vercel/status');
  assert.equal(vRes.status, 200);
  const vData = await vRes.json();
  assert.equal(vData.currentProduction.state, 'READY');
});

test('Engine API — SigNoz Log Stream & Error Patterns', async () => {
  const logRes = await dispatch('/api/v1/devops/logs?level=ALL');
  assert.equal(logRes.status, 200);
  const logData = await logRes.json();
  assert.ok(logData.logs.length > 0);

  const patRes = await dispatch('/api/v1/devops/logs/patterns');
  assert.equal(patRes.status, 200);
  const patData = await patRes.json();
  assert.ok(patData.patterns.length >= 2);
});

test('Engine API — CrewAI Incident Investigation', async () => {
  const incRes = await dispatch('/api/v1/devops/rca/incidents');
  assert.equal(incRes.status, 200);
  const incData = await incRes.json();
  assert.ok(incData.incidents.length >= 2);

  const invRes = await dispatch('/api/v1/devops/rca/investigate', {
    method: 'POST',
    body: { service: 'api-gateway', errorText: '504 Gateway Timeout' }
  });
  assert.equal(invRes.status, 200);
  const invData = await invRes.json();
  assert.ok(invData.id.startsWith('INC-'));
  assert.ok(invData.confidencePct >= 90);
});

test('Engine API — Infracost Cost Breakdown & Predictive Analytics', async () => {
  const costRes = await dispatch('/api/v1/devops/infracost/breakdown');
  assert.equal(costRes.status, 200);
  const costData = await costRes.json();
  assert.equal(costData.netBilledMonthlyCostUsd, 0.00);

  const predRes = await dispatch('/api/v1/devops/analytics/predictive');
  assert.equal(predRes.status, 200);
  const predData = await predRes.json();
  assert.equal(predData.forecastHorizonDays, 30);
});

test('Engine API — AI DevOps Assistant Endpoint', async () => {
  const res = await dispatch('/api/v1/ai/devops-chat', {
    method: 'POST',
    body: { query: 'Why did my latest deployment fail?' }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.direct_answer.includes('Deployment Failure'));
  assert.ok(data.evidence_citations.length > 0);
});
