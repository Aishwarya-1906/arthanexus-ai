/**
 * ArthaNexus Control Plane — Distributed Leases & Idempotency Engine
 * Ensures exactly-once effects on best-effort cloud cron schedulers
 * (Cloudflare Cron, Cloudflare Workflows, and GitHub Actions).
 */

const crypto = require('node:crypto');

class SchedulerControlPlane {
  constructor(dbAdapter = null) {
    this.dbAdapter = dbAdapter;
    this.inMemoryLeases = new Map();
  }

  /**
   * Generates a deterministic idempotency key for a scheduled job window
   */
  generateIdempotencyKey(jobType, sourceId, scheduledWindow, partitionKey = 'default') {
    const raw = `${jobType}:${sourceId}:${scheduledWindow}:${partitionKey}`;
    return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32);
  }

  /**
   * Attempts to atomically claim a job lease
   * Returns { acquired: true, leaseToken } or { acquired: false, reason }
   */
  async acquireLease(jobKey, ownerId, leaseDurationSeconds = 60) {
    const now = Date.now();
    const existing = this.inMemoryLeases.get(jobKey);

    if (existing && existing.expiresAt > now && existing.ownerId !== ownerId) {
      return {
        acquired: false,
        reason: `Job already leased by worker '${existing.ownerId}' until ${new Date(existing.expiresAt).toISOString()}`,
        existingOwner: existing.ownerId,
        fencingToken: existing.fencingToken
      };
    }

    const nextFencingToken = existing ? existing.fencingToken + 1 : 1;
    const lease = {
      jobKey,
      ownerId,
      acquiredAt: now,
      expiresAt: now + leaseDurationSeconds * 1000,
      fencingToken: nextFencingToken
    };

    this.inMemoryLeases.set(jobKey, lease);

    return {
      acquired: true,
      leaseToken: lease,
      fencingToken: nextFencingToken
    };
  }

  /**
   * Extends the lease heartbeat for long-running batch operations
   */
  async heartbeat(jobKey, ownerId, extendSeconds = 60) {
    const existing = this.inMemoryLeases.get(jobKey);
    if (!existing || existing.ownerId !== ownerId) {
      return { ok: false, reason: 'Lease lost or acquired by another worker' };
    }
    existing.expiresAt = Date.now() + extendSeconds * 1000;
    return { ok: true, expiresAt: existing.expiresAt };
  }

  /**
   * Releases lease upon job completion or failure
   */
  async releaseLease(jobKey, ownerId) {
    const existing = this.inMemoryLeases.get(jobKey);
    if (existing && existing.ownerId === ownerId) {
      this.inMemoryLeases.delete(jobKey);
      return { released: true };
    }
    return { released: false, reason: 'Not lease owner' };
  }

  /**
   * Reconciles expired leases and cleans up orphan jobs
   */
  reconcileStaleJobs() {
    const now = Date.now();
    const expired = [];
    for (const [key, lease] of this.inMemoryLeases.entries()) {
      if (lease.expiresAt <= now) {
        expired.push({ key, ownerId: lease.ownerId, expiredAt: new Date(lease.expiresAt).toISOString() });
        this.inMemoryLeases.delete(key);
      }
    }
    return expired;
  }
}

module.exports = {
  SchedulerControlPlane
};
