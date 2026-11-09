/**
 * Unified DevOps, AWS & AI Analytics Coordinator
 * Assembles LocalStack AWS adapter, Infracost cost engine, SigNoz log engine,
 * CrewAI RCA engine, and Predictive Analytics engine.
 */

const { AwsAdapter } = require('./aws_adapter.js');
const { GitHubAdapter } = require('./github_adapter.js');
const { VercelAdapter } = require('./vercel_adapter.js');
const { InfracostEngine } = require('./infracost_engine.js');
const { SigNozLogEngine } = require('./signoz_engine.js');
const { CrewRCAEngine } = require('./crew_rca_engine.js');
const { PredictiveAnalyticsEngine } = require('./predictive_engine.js');

class DevOpsCoordinator {
  constructor(config = {}) {
    this.aws = new AwsAdapter(config.aws);
    this.github = new GitHubAdapter(config.github);
    this.vercel = new VercelAdapter(config.vercel);
    this.infracost = new InfracostEngine();
    this.signoz = new SigNozLogEngine();
    this.crewRca = new CrewRCAEngine();
    this.predictive = new PredictiveAnalyticsEngine();
  }

  /**
   * Retrieves high-level DevOps health dashboard combining all layers
   */
  async getDevOpsOverview() {
    const [awsOverview, githubStatus, vercelStatus] = await Promise.all([
      this.aws.getResourcesOverview(),
      this.github.getRepositoryStatus(),
      this.vercel.getDeploymentStatus()
    ]);

    const costAnalysis = this.infracost.calculateMonthlyCost();
    const errorPatterns = this.signoz.getGroupedErrorPatterns();
    const incidents = this.crewRca.getIncidents();
    const predictive = this.predictive.forecastResourceCapacity();

    return {
      status: 'OPERATIONAL',
      timestamp: new Date().toISOString(),
      policy: 'ALLOW_PAID_SERVICES=false',
      layers: {
        aws: {
          status: awsOverview.status,
          region: awsOverview.region,
          isLive: awsOverview.is_live_aws,
          source: awsOverview.source,
          s3BucketsCount: awsOverview.summary.totalS3Buckets,
          lambdaFunctionsCount: awsOverview.summary.totalLambdaFunctions,
          activeAlarms: awsOverview.summary.activeAlarmsCount,
          monthlyCostUsd: costAnalysis.netBilledMonthlyCostUsd
        },
        github: {
          repository: githubStatus.repository,
          defaultBranch: 'main',
          latestCommit: githubStatus.recentCommits[0]?.sha,
          latestWorkflowStatus: githubStatus.workflowRuns[0]?.conclusion || 'success'
        },
        vercel: {
          projectId: vercelStatus.projectId,
          productionState: vercelStatus.currentProduction?.state || 'READY',
          productionUrl: vercelStatus.currentProduction?.url,
          lastDeployed: vercelStatus.currentProduction?.createdAt
        },
        aiRca: {
          activeIncidentsCount: incidents.totalIncidents,
          unresolvedCount: incidents.incidents.filter(i => i.status !== 'RESOLVED').length,
          lastIncidentId: incidents.incidents[0]?.id
        },
        observability: {
          distinctErrorPatterns: errorPatterns.totalDistinctPatterns,
          totalErrors24h: errorPatterns.totalErrorOccurrences
        }
      },
      costOverview: {
        grossMonthlyCostUsd: costAnalysis.grossMonthlyCostUsd,
        netBilledMonthlyCostUsd: costAnalysis.netBilledMonthlyCostUsd,
        potentialMonthlySavingsUsd: costAnalysis.potentialMonthlySavingsUsd,
        optimizationsCount: costAnalysis.optimizationsAvailableCount
      },
      capacityAlert: predictive.warnings[0]
    };
  }
}

module.exports = {
  DevOpsCoordinator,
  AwsAdapter,
  GitHubAdapter,
  VercelAdapter,
  InfracostEngine,
  SigNozLogEngine,
  CrewRCAEngine,
  PredictiveAnalyticsEngine
};
