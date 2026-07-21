/**
 * Configuration tests
 */

import { describe, it, expect } from 'vitest';
import { resolveConfig, DEFAULT_RATE_LIMIT_CONFIG } from '../../src/config.js';

describe('resolveConfig', () => {
  it('should resolve config with tenant', () => {
    const config = resolveConfig({
      clientId: 'test-id',
      clientSecret: 'test-secret',
      tenant: 'mycompany',
    });

    expect(config.baseUrl).toBe('https://mycompany.halopsa.com');
    expect(config.clientId).toBe('test-id');
    expect(config.clientSecret).toBe('test-secret');
    expect(config.scope).toBe('all');
  });

  it('should resolve config with explicit baseUrl', () => {
    const config = resolveConfig({
      clientId: 'test-id',
      clientSecret: 'test-secret',
      baseUrl: 'https://custom.halopsa.com',
    });

    expect(config.baseUrl).toBe('https://custom.halopsa.com');
  });

  it('should strip trailing slash from baseUrl', () => {
    const config = resolveConfig({
      clientId: 'test-id',
      clientSecret: 'test-secret',
      baseUrl: 'https://custom.halopsa.com/',
    });

    expect(config.baseUrl).toBe('https://custom.halopsa.com');
  });

  describe('tenant normalization', () => {
    const base = { clientId: 'test-id', clientSecret: 'test-secret' };

    it('should trim surrounding whitespace from a tenant', () => {
      expect(resolveConfig({ ...base, tenant: '  mycompany  ' }).baseUrl).toBe(
        'https://mycompany.halopsa.com'
      );
    });

    it('should coerce a full hosted host to its subdomain', () => {
      expect(resolveConfig({ ...base, tenant: 'mycompany.halopsa.com' }).baseUrl).toBe(
        'https://mycompany.halopsa.com'
      );
    });

    it('should coerce a full hosted URL to its subdomain', () => {
      expect(resolveConfig({ ...base, tenant: 'https://mycompany.halopsa.com/' }).baseUrl).toBe(
        'https://mycompany.halopsa.com'
      );
    });

    it('should coerce other hosted Halo domains to their subdomain', () => {
      expect(resolveConfig({ ...base, tenant: 'mycompany.haloitsm.com' }).baseUrl).toBe(
        'https://mycompany.halopsa.com'
      );
    });

    it('should reject a custom-domain tenant and point at baseUrl', () => {
      expect(() => resolveConfig({ ...base, tenant: 'halo.mycompany.co.uk' })).toThrow(
        /not a hosted Halo subdomain.*baseUrl/s
      );
    });
  });

  it('should throw if neither tenant nor baseUrl provided', () => {
    expect(() =>
      resolveConfig({
        clientId: 'test-id',
        clientSecret: 'test-secret',
      })
    ).toThrow('Either tenant or baseUrl must be provided');
  });

  it('should use custom scope', () => {
    const config = resolveConfig({
      clientId: 'test-id',
      clientSecret: 'test-secret',
      tenant: 'mycompany',
      scope: 'edit:tickets',
    });

    expect(config.scope).toBe('edit:tickets');
  });

  it('should include tenantId when provided', () => {
    const config = resolveConfig({
      clientId: 'test-id',
      clientSecret: 'test-secret',
      tenant: 'mycompany',
      tenantId: 'specific-tenant',
    });

    expect(config.tenantId).toBe('specific-tenant');
  });

  it('should apply default rate limit config', () => {
    const config = resolveConfig({
      clientId: 'test-id',
      clientSecret: 'test-secret',
      tenant: 'mycompany',
    });

    expect(config.rateLimit).toEqual(DEFAULT_RATE_LIMIT_CONFIG);
  });

  it('should merge custom rate limit config', () => {
    const config = resolveConfig({
      clientId: 'test-id',
      clientSecret: 'test-secret',
      tenant: 'mycompany',
      rateLimit: {
        maxRequests: 300,
        enabled: false,
      },
    });

    expect(config.rateLimit.maxRequests).toBe(300);
    expect(config.rateLimit.enabled).toBe(false);
    expect(config.rateLimit.windowMs).toBe(180000); // Default preserved
  });
});
