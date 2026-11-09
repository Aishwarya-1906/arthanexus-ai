/**
 * ArthaNexus DataGrid — Data Quality Gates & Validation Rules
 * Runs across Bronze -> Silver -> Gold transformation stages.
 * Any suspicious record is quarantined; never silently coerced.
 */

function runQualityGate(datasetName, records, rules = {}) {
  const results = {
    datasetName,
    totalRecords: records.length,
    passedRecords: [],
    quarantinedRecords: [],
    checks: []
  };

  if (!records || records.length === 0) {
    results.checks.push({
      checkName: 'non_empty_dataset',
      status: 'WARNING',
      testedCount: 0,
      failedCount: 0,
      details: 'Dataset is empty'
    });
    return results;
  }

  // 1. Null Checks on Required Fields
  const requiredFields = rules.requiredFields || [];
  let nullFailures = 0;

  // 2. Range Checks
  const rangeChecks = rules.rangeChecks || {};

  // 3. Duplicate Checks
  const uniqueKey = rules.uniqueKey;
  const seenKeys = new Set();
  let duplicateFailures = 0;

  for (const record of records) {
    let isQuarantined = false;
    let quarantineReason = '';

    // Required fields check
    for (const field of requiredFields) {
      if (record[field] === undefined || record[field] === null || record[field] === '') {
        nullFailures++;
        isQuarantined = true;
        quarantineReason = `Missing required field: ${field}`;
        break;
      }
    }

    // Range checks
    if (!isQuarantined) {
      for (const [field, [min, max]] of Object.entries(rangeChecks)) {
        const val = Number(record[field]);
        if (isNaN(val) || val < min || val > max) {
          isQuarantined = true;
          quarantineReason = `Field ${field} value (${val}) outside permissible range [${min}, ${max}]`;
          break;
        }
      }
    }

    // Duplicate check
    if (!isQuarantined && uniqueKey) {
      const keyVal = String(record[uniqueKey]);
      if (seenKeys.has(keyVal)) {
        duplicateFailures++;
        isQuarantined = true;
        quarantineReason = `Duplicate key detected: ${keyVal}`;
      } else {
        seenKeys.add(keyVal);
      }
    }

    if (isQuarantined) {
      results.quarantinedRecords.push({
        record,
        reason: quarantineReason,
        quarantined_at: new Date().toISOString()
      });
    } else {
      results.passedRecords.push(record);
    }
  }

  // Summarize checks
  results.checks.push({
    checkName: 'null_completeness',
    status: nullFailures === 0 ? 'PASSED' : 'FAILED',
    testedCount: records.length,
    failedCount: nullFailures,
    details: `${nullFailures} records failed null completeness check`
  });

  if (uniqueKey) {
    results.checks.push({
      checkName: 'uniqueness_integrity',
      status: duplicateFailures === 0 ? 'PASSED' : 'FAILED',
      testedCount: records.length,
      failedCount: duplicateFailures,
      details: `${duplicateFailures} duplicates encountered on key '${uniqueKey}'`
    });
  }

  results.checks.push({
    checkName: 'quarantine_gate',
    status: results.quarantinedRecords.length === 0 ? 'PASSED' : 'WARNING',
    testedCount: records.length,
    failedCount: results.quarantinedRecords.length,
    details: `${results.quarantinedRecords.length} records quarantined; ${results.passedRecords.length} passed`
  });

  return results;
}

module.exports = {
  runQualityGate
};
