const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '../../');
const {
  DevOpsCoordinator,
  AwsAdapter,
  GitHubAdapter,
  VercelAdapter,
  InfracostEngine,
  SigNozLogEngine,
  CrewRCAEngine,
  PredictiveAnalyticsEngine
} = require(path.join(rootDir, 'packages/devops-engine/src/index.js'));

const { AIGateway } = require(path.join(rootDir, 'packages/ai-gateway/src/index.js'));

test('AWS Adapter — S3, Lambda & CloudWatch Overview', async () => {
  const aws = new AwsAdapter({ region: 'ap-south-1' });
  const overview = await aws.getResourcesOverview();

  assert.equal(overview.status, 'HEALTHY');
  assert.equal(overview.region, 'ap-south-1');
  assert.ok(overview.summary.totalS3Buckets >= 3, 'Must report at least 3 S3 buckets');
  assert.ok(overview.summary.totalLambdaFunctions >= 4, 'Must report at least 4 Lambda functions');
  assert.ok(overview.summary.totalStorageMb > 0, 'Total storage must be positive');
  assert.ok(overview.resources.cloudWatchAlarms.length >= 1, 'Must track CloudWatch alarms');
});

test('AWS Adapter — CloudWatch Metrics & Lambda Test Execution', async () => {
  const aws = new AwsAdapter();
  const metrics = await aws.getCloudWatchMetrics('24h');
  assert.ok(metrics.metrics.length > 0, 'Should return metric time-series');
  assert.ok(metrics.metrics[0].cpuUtilizationPct !== undefined);
  assert.ok(metrics.metrics[0].memoryUtilizationPct !== undefined);

  const testInvoke = await aws.testInvokeLambda('arthanexus-quant-analytics-api');
  assert.equal(testInvoke.success, true);
  assert.equal(testInvoke.statusCode, 200);
  assert.ok(testInvoke.executionId.startsWith('exec_'));
  assert.ok(testInvoke.logsSnippet.length > 0);
});

test('GitHub & Vercel Adapters — CI/CD Pipeline & Deployment Status', async () => {
  const github = new GitHubAdapter({ repo: 'ArthaNexus/arthanexus-ai' });
  const ghStatus = await github.getRepositoryStatus();
  assert.equal(ghStatus.repository, 'ArthaNexus/arthanexus-ai');
  assert.ok(ghStatus.branches.some(b => b.name === 'main'));
  assert.ok(ghStatus.workflowRuns.length >= 2);

  const ghDispatch = await github.triggerWorkflow('CI Build & Quality Gates', 'main');
  assert.equal(ghDispatch.success, true);
  assert.ok(ghDispatch.dispatchId.startsWith('disp_'));

  const vercel = new VercelAdapter();
  const vStatus = await vercel.getDeploymentStatus();
  assert.equal(vStatus.currentProduction.state, 'READY');
  assert.ok(vStatus.deployments.length >= 2);

  const vDeploy = await vercel.triggerDeployment('production');
  assert.equal(vDeploy.success, true);
  assert.equal(vDeploy.state, 'QUEUED');
});

test('Infracost Engine — AWS Cost Modeling & Proactive Savings', () => {
  const infracost = new InfracostEngine();
  const cost = infracost.calculateMonthlyCost();

  assert.equal(cost.currency, 'USD');
  assert.ok(cost.grossMonthlyCostUsd > 0, 'Gross monthly cost should reflect compute/storage/logs');
  assert.equal(cost.netBilledMonthlyCostUsd, 0.00, 'Net billed cost should be $0.00 under AWS Free Tier');
  assert.ok(cost.recommendations.length >= 3, 'Must provide cost optimization recommendations');
  assert.ok(cost.potentialMonthlySavingsUsd > 0, 'Must identify potential dollar savings');
});

test('SigNoz Log Engine — Ingestion, Filtering & Pattern Grouping', () => {
  const signoz = new SigNozLogEngine();
  
  // Query all
  const allLogs = signoz.queryLogs();
  assert.ok(allLogs.totalFound >= 5);

  // Filter by level
  const errorsOnly = signoz.queryLogs({ level: 'ERROR' });
  assert.ok(errorsOnly.logs.every(l => l.level === 'ERROR'));

  // Search filter
  const timeoutSearch = signoz.queryLogs({ search: 'timeout' });
  assert.ok(timeoutSearch.totalFound > 0);

  // Grouped Error Patterns
  const patterns = signoz.getGroupedErrorPatterns();
  assert.ok(patterns.totalDistinctPatterns >= 2);
  assert.ok(patterns.patterns.some(p => p.fingerprint === 'ERR_LAMBDA_TIMEOUT_DB_POOL'));

  // Ingest new log
  const newLog = signoz.ingestLog({
    service: 'unit-test-runner',
    level: 'INFO',
    message: 'Test log event ingested successfully'
  });
  assert.equal(newLog.service, 'unit-test-runner');
  assert.ok(newLog.traceId.length > 0);
});

test('CrewAI RCA Engine — Multi-Agent Incident Investigation', async () => {
  const rca = new CrewRCAEngine();
  const incidents = rca.getIncidents();
  assert.ok(incidents.totalIncidents >= 2);

  const inc402 = incidents.incidents.find(i => i.id === 'INC-402');
  assert.ok(inc402);
  assert.equal(inc402.confidencePct, 96);
  assert.equal(inc402.agentContributions.length, 4, 'Must have 4 specialized agent contributions');
  assert.ok(inc402.remediationRunbook.length >= 3, 'Must include actionable step-by-step runbook');

  // Investigate dynamic timeout incident
  const dynamicReport = await rca.investigateIncident({
    service: 'payment-gateway',
    errorText: 'Connection timed out after 30000ms while waiting for DB connection pool'
  });
  assert.ok(dynamicReport.id.startsWith('INC-'));
  assert.ok(dynamicReport.confidencePct >= 90);
  assert.equal(dynamicReport.agentContributions.length, 4);
});

test('Predictive Analytics Engine — 30-Day Capacity Forecast', () => {
  const predictive = new PredictiveAnalyticsEngine();
  const forecast = predictive.forecastResourceCapacity();

  assert.equal(forecast.forecastHorizonDays, 30);
  assert.equal(forecast.projections.length, 30);
  assert.ok(forecast.warnings.length > 0);

  const anomaly = predictive.detectAnomalies();
  assert.ok(anomaly.anomalyScore !== undefined);
  assert.ok(anomaly.anomaliesDetected.length > 0);
});

test('DevOps Coordinator — Unified Dashboard Synthesis', async () => {
  const coordinator = new DevOpsCoordinator();
  const overview = await coordinator.getDevOpsOverview();

  assert.equal(overview.status, 'OPERATIONAL');
  assert.ok(overview.layers.aws);
  assert.ok(overview.layers.github);
  assert.ok(overview.layers.vercel);
  assert.ok(overview.layers.aiRca);
  assert.ok(overview.layers.observability);
  assert.equal(overview.costOverview.netBilledMonthlyCostUsd, 0.00);
});

test('AI Gateway — 8 Mandatory DevOps Natural-Language Questions', async () => {
  const ai = new AIGateway();

  const queries = [
    'Why did my latest deployment fail?',
    'What is causing high AWS resource utilization?',
    'Which Lambda functions are experiencing errors?',
    'Analyze my application logs.',
    'Identify potential infrastructure bottlenecks.',
    'Explain the latest CI/CD pipeline failure.',
    'What are the potential root causes of this incident?',
    'Recommend ways to optimize AWS costs.'
  ];

  for (const q of queries) {
    const res = await ai.answerDevOpsQuery(q);
    assert.ok(res.direct_answer.length > 50, `Query "${q}" should return substantive answer`);
    assert.ok(res.evidence_citations.length > 0, `Query "${q}" must include evidence citations`);
    assert.ok(res.compliance_notice.length > 0, `Query "${q}" must include compliance notice`);
  }
});
