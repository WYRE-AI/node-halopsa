/**
 * HttpClient response-handling tests.
 *
 * Regression: connectwise-automate-mcp#54 — every API-backed call returned an
 * empty object (200 with a non-JSON body was swallowed as `{}`), and repeat
 * calls threw "Body is unusable: Body has already been read" (the error path
 * consumed the body with response.json() and then re-read it with
 * response.text() in the catch). The body must be read exactly once.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClient } from '../../src/http.js';
import { AuthManager } from '../../src/auth.js';
import { RateLimiter } from '../../src/rate-limiter.js';
import {
  HaloPsaError,
  HaloPsaAuthenticationError,
  HaloPsaBadRequestError,
  HaloPsaNotFoundError,
  HaloPsaServerError,
  HaloPsaValidationError,
} from '../../src/errors.js';
import type { ResolvedConfig } from '../../src/config.js';

const config = {
  baseUrl: 'https://testcompany.halopsa.com',
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  scope: 'all',
  rateLimit: {
    enabled: true,
    maxRequests: 500,
    windowMs: 180_000,
    throttleThreshold: 0.8,
    retryAfterMs: 1000,
    maxRetries: 3,
  },
} as unknown as ResolvedConfig;

function makeClient(): HttpClient {
  const auth = {
    getToken: vi.fn().mockResolvedValue('test-token'),
    refreshToken: vi.fn().mockResolvedValue(undefined),
  } as unknown as AuthManager;
  const limiter = new RateLimiter(config.rateLimit);
  return new HttpClient(config, auth, limiter);
}

/** A real Response so body semantics (one-shot stream) are exercised. */
function realResponse(body: string, init: ResponseInit = {}): Response {
  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

describe('HttpClient response handling', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses a JSON 200 response', async () => {
    vi.mocked(fetch).mockResolvedValue(realResponse('[{"id":1}]'));
    const result = await makeClient().request('/Tickets');
    expect(result).toEqual([{ id: 1 }]);
  });

  it('parses JSON even when the content-type header is wrong', async () => {
    vi.mocked(fetch).mockResolvedValue(
      realResponse('{"id":7}', { headers: { 'content-type': 'text/plain' } })
    );
    const result = await makeClient().request('/Tickets/7');
    expect(result).toEqual({ id: 7 });
  });

  it('returns {} for a genuinely empty 200/204 body', async () => {
    vi.mocked(fetch).mockResolvedValue(
      realResponse('', { status: 200, headers: { 'content-type': 'text/plain' } })
    );
    const result = await makeClient().request('/Tickets');
    expect(result).toEqual({});
  });

  it('throws a descriptive error (not {}) for a 200 with a non-JSON body', async () => {
    vi.mocked(fetch).mockResolvedValue(
      realResponse('<html>WAF challenge page</html>', {
        headers: { 'content-type': 'text/html' },
      })
    );
    await expect(makeClient().request('/Tickets')).rejects.toThrow(
      /Expected JSON .* text\/html.*WAF challenge page/
    );
  });

  it('reads a non-JSON error body exactly once — no "Body is unusable"', async () => {
    vi.mocked(fetch).mockResolvedValue(
      realResponse('<html>gateway error</html>', {
        status: 404,
        headers: { 'content-type': 'text/html' },
      })
    );
    // Before the fix this threw TypeError "Body is unusable: Body has already
    // been read" instead of the typed not-found error carrying the real body.
    const err = await makeClient()
      .request('/Tickets/999')
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(HaloPsaNotFoundError);
    expect((err as HaloPsaNotFoundError).response).toContain('gateway error');
  });

  it('passes a parsed JSON error body to the typed error', async () => {
    vi.mocked(fetch).mockResolvedValue(
      realResponse('{"message":"boom"}', { status: 503 })
    );
    // 5xx retries once, then throws — both responses must be fresh.
    vi.mocked(fetch).mockResolvedValueOnce(realResponse('{"message":"boom"}', { status: 503 }));
    vi.mocked(fetch).mockResolvedValueOnce(realResponse('{"message":"boom"}', { status: 503 }));
    const err = await makeClient()
      .request('/Tickets')
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(HaloPsaServerError);
    expect((err as HaloPsaServerError).response).toEqual({ message: 'boom' });
  }, 15000);

  it('a non-validation-shaped 400 raises HaloPsaBadRequestError, not an auth error', async () => {
    // Regression: node-halopsa#78 — a 400 from a resource endpoint (e.g. a
    // required field like Actions' `outcome` missing) used to throw
    // HaloPsaAuthenticationError with a "invalid credentials or parameters"
    // message, which read as a permissions/credentials problem to callers
    // even though the Bearer token was never in question — a bad token
    // fails as 401, not 400. This body has neither `errors` nor
    // `validation_errors`, so it isn't the recognized validation shape.
    vi.mocked(fetch).mockResolvedValue(
      realResponse('{"message":"outcome is required"}', { status: 400 })
    );
    const err = await makeClient()
      .request('/Actions', { method: 'POST', body: [{ ticket_id: 1, note: 'hi' }] })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(HaloPsaBadRequestError);
    expect(err).not.toBeInstanceOf(HaloPsaAuthenticationError);
    expect((err as HaloPsaBadRequestError).message).not.toMatch(/credentials/i);
    expect((err as HaloPsaBadRequestError).response).toEqual({ message: 'outcome is required' });
  });

  it('a validation-shaped 400 still raises HaloPsaValidationError', async () => {
    vi.mocked(fetch).mockResolvedValue(
      realResponse('{"errors":[{"field":"outcome","message":"is required"}]}', { status: 400 })
    );
    const err = await makeClient()
      .request('/Actions', { method: 'POST', body: [{ ticket_id: 1, note: 'hi' }] })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(HaloPsaValidationError);
    expect((err as HaloPsaValidationError).errors).toEqual([{ field: 'outcome', message: 'is required' }]);
  });

  it('generic non-2xx statuses raise HaloPsaError with the raw body', async () => {
    vi.mocked(fetch).mockResolvedValue(
      realResponse('teapot', { status: 418, headers: { 'content-type': 'text/plain' } })
    );
    const err = await makeClient()
      .request('/Tickets')
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(HaloPsaError);
    expect((err as HaloPsaError).response).toBe('teapot');
  });
});
