import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ENV } from '../src/server/config/env.js';

describe('Environment Configuration & Validation', () => {
  it('should have standard ports configured (5050 for server, 3070 for client)', () => {
    assert.strictEqual(ENV.PORT, 5050, 'Backend port must default to 5050');
    assert.strictEqual(ENV.CLIENT_URL, 'http://localhost:3070', 'Client URL must default to http://localhost:3070');
  });

  it('should enforce API prefix starting with a slash', () => {
    assert.ok(ENV.API_PREFIX.startsWith('/'), 'API prefix must start with a slash');
    assert.strictEqual(ENV.API_PREFIX, '/api/v1');
  });

  it('should have valid JWT secrets with minimum security length', () => {
    assert.ok(ENV.JWT_ACCESS_SECRET.length >= 16, 'Access secret must be at least 16 chars');
    assert.ok(ENV.JWT_REFRESH_SECRET.length >= 16, 'Refresh secret must be at least 16 chars');
  });

  it('should have rate limiting configured with positive numbers', () => {
    assert.ok(ENV.RATE_LIMIT_MAX_REQUESTS > 0, 'Rate limit max requests must be positive');
    assert.ok(ENV.RATE_LIMIT_WINDOW_MS > 0, 'Rate limit window must be positive');
  });
});

