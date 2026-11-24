import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getDatabaseHealth } from '../src/server/config/database.js';

describe('System & Database Health Module', () => {
  it('should return a structured database health object', () => {
    const health = getDatabaseHealth();
    assert.ok(health);
    assert.ok(['connected', 'disconnected', 'connecting', 'disconnecting', 'uninitialized'].includes(health.status));
    assert.strictEqual(typeof health.readyState, 'number');
  });
});

