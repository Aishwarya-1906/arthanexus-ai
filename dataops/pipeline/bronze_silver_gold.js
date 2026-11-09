/**
 * ArthaNexus DataGrid — Bronze -> Silver -> Gold ELT Pipeline
 * Idempotent, traceable, and observable data processing.
 */

const crypto = require('node:crypto');
const { runQualityGate } = require('../quality/gates.js');

class DataGridPipeline {
  constructor(storageAdapter = null) {
    this.storageAdapter = storageAdapter; // Optional Cloudflare R2 / S3 adapter
    this.lineageEdges = [];
    this.jobHistory = [];
  }

  /**
   * Stage 1: Bronze Landing
   * Immutable raw payload capture with checksum and partitioning
   */
  async landBronze(datasetName, rawPayload, options = {}) {
    const timestamp = new Date().toISOString();
    const datePartition = timestamp.split('T')[0].replace(/-/g, '/');
    const partitionKey = `bronze/${datasetName}/${datePartition}/${Date.now()}.json`;

    const rawString = typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload);
    const checksum = crypto.createHash('sha256').update(rawString).digest('hex');

    const bronzeMetadata = {
      partitionKey,
      datasetName,
      checksum,
      sizeBytes: Buffer.byteLength(rawString),
      landedAt: timestamp,
      sourceUrl: options.sourceUrl || 'direct_ingest'
    };

    // If R2 storage adapter is configured, persist raw payload
    if (this.storageAdapter && typeof this.storageAdapter.put === 'function') {
      await this.storageAdapter.put(partitionKey, rawString, {
        customMetadata: { checksum, datasetName }
      });
    }

    return {
      bronzeMetadata,
      payload: rawPayload
    };
  }

  /**
   * Stage 2: Silver Normalization & Quality Gate
   */
  processSilver(datasetName, bronzeResult, qualityRules = {}) {
    const records = Array.isArray(bronzeResult.payload) ? bronzeResult.payload : [bronzeResult.payload];
    const qualityReport = runQualityGate(datasetName, records, qualityRules);

    const silverDataset = {
      datasetName,
      records: qualityReport.passedRecords,
      quarantined: qualityReport.quarantinedRecords,
      qualityChecks: qualityReport.checks,
      bronzeChecksum: bronzeResult.bronzeMetadata.checksum,
      processedAt: new Date().toISOString()
    };

    // Track Lineage
    this.lineageEdges.push({
      sourceDataset: datasetName,
      targetLayer: 'silver',
      targetDataset: `${datasetName}_normalized`,
      recordCount: qualityReport.passedRecords.length,
      createdAt: new Date().toISOString()
    });

    return silverDataset;
  }

  /**
   * Stage 3: Gold Materialization
   * Pre-aggregated analytics ready for the Terminal UI and REST API
   */
  materializeGold(datasetName, silverResult, aggregatorFn) {
    const goldData = aggregatorFn ? aggregatorFn(silverResult.records) : silverResult.records;

    this.lineageEdges.push({
      sourceDataset: `${datasetName}_normalized`,
      targetLayer: 'gold',
      targetDataset: `${datasetName}_materialized`,
      recordCount: Array.isArray(goldData) ? goldData.length : 1,
      createdAt: new Date().toISOString()
    });

    return {
      datasetName,
      goldData,
      materializedAt: new Date().toISOString(),
      qualityPassed: silverResult.quarantined.length === 0
    };
  }
}

module.exports = {
  DataGridPipeline
};
