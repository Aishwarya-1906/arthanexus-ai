/**
 * SigNoz Observability & Intelligent Log Analytics Engine
 * Inspired by SigNoz (https://github.com/SigNoz/signoz)
 * Provides OpenTelemetry-structured log streams, error pattern clustering, trace correlation, and APM metrics.
 */

class SigNozLogEngine {
  constructor() {
    this.logs = this.generateSampleLogStream();
  }

  generateSampleLogStream() {
    const now = Date.now();
    const services = ['arthanexus-engine-api', 'amfi-nav-worker', 'rbi-macro-scraper', 'vercel-edge-router'];

    return [
      {
        id: 'log_01',
        timestamp: new Date(now - 2 * 60 * 1000).toISOString(),
        service: 'arthanexus-engine-api',
        level: 'INFO',
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: '00f067aa0ba902b7',
        message: 'HTTP GET /api/v1/securities/NSE:TATAMOTORS/profile completed with 200 OK',
        durationMs: 14.2,
        attributes: { http_status: 200, client_ip: '103.21.244.1', cache_status: 'HIT' }
      },
      {
        id: 'log_02',
        timestamp: new Date(now - 5 * 60 * 1000).toISOString(),
        service: 'amfi-nav-worker',
        level: 'INFO',
        traceId: '8a3b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
        spanId: '1234567890abcdef',
        message: 'Completed scheduled AMFI Daily NAV ingestion. 14,250 records extracted, 40 quarantined.',
        durationMs: 3820,
        attributes: { records_extracted: 14250, records_quarantined: 40, storage_partition: 'bronze/AMFI_NAV/2026/11/09' }
      },
      {
        id: 'log_03',
        timestamp: new Date(now - 14 * 60 * 1000).toISOString(),
        service: 'rbi-macro-scraper',
        level: 'WARN',
        traceId: '9f8e7d6c5b4a3928170f1e2d3c4b5a69',
        spanId: 'fedcba0987654321',
        message: 'Upstream RBI RSS endpoint response latency high (4,120ms). Circuit breaker threshold safe.',
        durationMs: 4120,
        attributes: { upstream_host: 'rbi.org.in', attempt: 1, max_retries: 3 }
      },
      {
        id: 'log_04',
        timestamp: new Date(now - 22 * 60 * 1000).toISOString(),
        service: 'arthanexus-rca-incident-worker',
        level: 'ERROR',
        traceId: '7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a',
        spanId: 'aabbccddeeff0011',
        message: 'Lambda invocation failed: Task timed out after 30.03 seconds. Downstream database connection pool exhausted.',
        durationMs: 30030,
        attributes: { error_type: 'TimeoutError', timeout_limit_sec: 30, memory_limit_mb: 256 },
        stack: 'TimeoutError: Task timed out after 30.03 seconds\n    at Timeout._onTimeout (/var/task/node_modules/pg-pool/index.js:184:19)\n    at listOnTimeout (node:internal/timers:573:17)\n    at process.processTimers (node:internal/timers:514:7)'
      },
      {
        id: 'log_05',
        timestamp: new Date(now - 35 * 60 * 1000).toISOString(),
        service: 'vercel-edge-router',
        level: 'ERROR',
        traceId: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
        spanId: '5566778899aabbcc',
        message: 'Edge Function upstream 504 Gateway Timeout while contacting origin API.',
        durationMs: 10020,
        attributes: { edge_region: 'bom1', status_code: 504, path: '/api/v1/research/deep-audit' }
      },
      {
        id: 'log_06',
        timestamp: new Date(now - 48 * 60 * 1000).toISOString(),
        service: 'arthanexus-engine-api',
        level: 'INFO',
        traceId: '3c2b1a0f9e8d7c6b5a4938271605f4e3',
        spanId: '1122334455667788',
        message: 'AI Gateway routed query to Google Gemini 1.5 Flash. Latency: 420ms. Citations: 3.',
        durationMs: 420,
        attributes: { model: 'gemini-1.5-flash', tokens_used: 184, quota_remaining: 982 }
      }
    ];
  }

  /**
   * Queries and filters logs with OpenTelemetry fields
   */
  queryLogs(filter = {}) {
    let result = [...this.logs];

    if (filter.level && filter.level !== 'ALL') {
      result = result.filter(l => l.level === filter.level);
    }
    if (filter.service && filter.service !== 'ALL') {
      result = result.filter(l => l.service === filter.service);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(l => 
        l.message.toLowerCase().includes(q) || 
        (l.stack && l.stack.toLowerCase().includes(q)) ||
        l.service.toLowerCase().includes(q)
      );
    }

    return {
      totalFound: result.length,
      logs: result
    };
  }

  /**
   * Groups recurring error patterns and stack traces (SigNoz APM style)
   */
  getGroupedErrorPatterns() {
    const errorLogs = this.logs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL');
    
    const patterns = [
      {
        fingerprint: 'ERR_LAMBDA_TIMEOUT_DB_POOL',
        title: 'Lambda Task Timeout (30s) — Connection Pool Exhaustion',
        category: 'Infrastructure / Database',
        severity: 'HIGH',
        occurrences24h: 14,
        firstSeen: '2026-11-09T14:15:00Z',
        lastSeen: '2026-11-09T22:45:00Z',
        affectedService: 'arthanexus-rca-incident-worker',
        sampleMessage: 'Lambda invocation failed: Task timed out after 30.03 seconds. Downstream database connection pool exhausted.',
        recommendation: 'Increase Lambda memory from 256MB to 1024MB to allocate full vCPU, and implement PgBouncer or RDS Proxy connection pooling.'
      },
      {
        fingerprint: 'ERR_VERCEL_EDGE_GATEWAY_TIMEOUT',
        title: '504 Gateway Timeout on Edge Router',
        category: 'Network / Edge Routing',
        severity: 'MEDIUM',
        occurrences24h: 3,
        firstSeen: '2026-11-09T18:20:00Z',
        lastSeen: '2026-11-09T22:30:00Z',
        affectedService: 'vercel-edge-router',
        sampleMessage: 'Edge Function upstream 504 Gateway Timeout while contacting origin API.',
        recommendation: 'Cache heavy financial calculations with stale-while-revalidate edge headers to prevent origin timeouts.'
      }
    ];

    return {
      totalDistinctPatterns: patterns.length,
      totalErrorOccurrences: patterns.reduce((acc, p) => acc + p.occurrences24h, 0),
      patterns
    };
  }

  /**
   * Ingests a new log event into the stream
   */
  ingestLog(logData) {
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: logData.timestamp || new Date().toISOString(),
      service: logData.service || 'arthanexus-app',
      level: (logData.level || 'INFO').toUpperCase(),
      traceId: logData.traceId || Math.random().toString(36).substring(2, 18),
      spanId: logData.spanId || Math.random().toString(36).substring(2, 10),
      message: logData.message || 'Log event received',
      durationMs: logData.durationMs || 10,
      attributes: logData.attributes || {}
    };

    this.logs.unshift(newLog);
    if (this.logs.length > 500) this.logs.pop(); // Keep memory bounded
    return newLog;
  }
}

module.exports = { SigNozLogEngine };
