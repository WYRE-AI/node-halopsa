/**
 * Authentication tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server.js';
import { AuthManager } from '../../src/auth.js';
import { HaloPsaAuthenticationError } from '../../src/errors.js';
import type { ResolvedConfig } from '../../src/config.js';

describe('AuthManager', () => {
  let config: ResolvedConfig;
  let authManager: AuthManager;

  beforeEach(() => {
    config = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      baseUrl: 'https://testcompany.halopsa.com',
      scope: 'all',
      rateLimit: {
        enabled: true,
        maxRequests: 500,
        windowMs: 180000,
        throttleThreshold: 0.8,
        retryAfterMs: 5000,
        maxRetries: 3,
      },
    };
    authManager = new AuthManager(config);
  });

  describe('getToken', () => {
    it('should acquire a new token successfully', async () => {
      const token = await authManager.getToken();

      expect(token).toBe('mock-jwt-token-for-testing');
    });

    it('should return cached token on subsequent calls', async () => {
      const token1 = await authManager.getToken();
      const token2 = await authManager.getToken();

      expect(token1).toBe('mock-jwt-token-for-testing');
      expect(token2).toBe('mock-jwt-token-for-testing');
    });

    it('should throw error on bad credentials', async () => {
      // Override the handler for this test
      server.use(
        http.post('https://testcompany.halopsa.com/auth/token', () => {
          return HttpResponse.json(
            { error: 'invalid_client', error_description: 'Bad credentials' },
            { status: 400 }
          );
        })
      );

      await expect(authManager.getToken()).rejects.toThrow(HaloPsaAuthenticationError);
    });

    // `fetch` rejects with a bare `TypeError: fetch failed` for every
    // network-layer problem — bad DNS, TLS mismatch, refused connection,
    // timeout. The diagnosis lives in `error.cause`, so dropping it leaves
    // the caller with an error that names no cause at all.
    describe('network-level failures', () => {
      afterEach(() => {
        vi.unstubAllGlobals();
      });

      /** Reject like undici does: a bare `fetch failed` wrapping the real reason. */
      function stubFetchFailure(causeMessage: string): void {
        vi.stubGlobal('fetch', () =>
          Promise.reject(
            Object.assign(new TypeError('fetch failed'), {
              cause: new Error(causeMessage),
            })
          )
        );
      }

      it('should surface the underlying cause of a fetch failure', async () => {
        stubFetchFailure(
          "Hostname/IP does not match certificate's altnames: Host: bogus.halopsa.com.halopsa.com"
        );

        await expect(authManager.getToken()).rejects.toThrow(
          /does not match certificate's altnames/
        );
      });

      it('should surface a DNS failure cause', async () => {
        stubFetchFailure('getaddrinfo ENOTFOUND nosuchtenant.halopsa.com');

        await expect(authManager.getToken()).rejects.toThrow(/ENOTFOUND/);
      });

      it('should still report a fetch failure when there is no cause', async () => {
        vi.stubGlobal('fetch', () => Promise.reject(new TypeError('fetch failed')));

        await expect(authManager.getToken()).rejects.toThrow(
          /Failed to acquire token: fetch failed/
        );
      });
    });
  });

  describe('refreshToken', () => {
    it('should get a new token', async () => {
      const token1 = await authManager.getToken();
      authManager.invalidateToken();
      const token2 = await authManager.refreshToken();

      expect(token1).toBe('mock-jwt-token-for-testing');
      expect(token2).toBe('mock-jwt-token-for-testing');
    });
  });

  describe('invalidateToken', () => {
    it('should clear the cached token', async () => {
      await authManager.getToken();
      expect(authManager.hasValidToken()).toBe(true);

      authManager.invalidateToken();
      expect(authManager.hasValidToken()).toBe(false);
    });
  });

  describe('hasValidToken', () => {
    it('should return false when no token', () => {
      expect(authManager.hasValidToken()).toBe(false);
    });

    it('should return true after token acquisition', async () => {
      await authManager.getToken();
      expect(authManager.hasValidToken()).toBe(true);
    });

    it('should return false after invalidation', async () => {
      await authManager.getToken();
      authManager.invalidateToken();
      expect(authManager.hasValidToken()).toBe(false);
    });
  });

  describe('concurrent token requests', () => {
    it('should handle concurrent getToken calls', async () => {
      // Make concurrent calls - they should all get the same token
      const [token1, token2, token3] = await Promise.all([
        authManager.getToken(),
        authManager.getToken(),
        authManager.getToken(),
      ]);

      expect(token1).toBe('mock-jwt-token-for-testing');
      expect(token2).toBe('mock-jwt-token-for-testing');
      expect(token3).toBe('mock-jwt-token-for-testing');
    });
  });
});
