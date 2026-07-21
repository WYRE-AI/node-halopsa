/**
 * Configuration types and defaults for the HaloPSA client
 */

import { HaloPsaConfigurationError } from './errors.js';

/**
 * Validates a user-supplied base URL, enforcing HTTPS.
 * Plain HTTP is only permitted for localhost (for local testing).
 */
function validateBaseUrl(rawUrl: string): void {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new HaloPsaConfigurationError(`Invalid baseUrl: "${rawUrl}" is not a valid URL`);
  }

  if (url.protocol === 'https:') {
    return;
  }

  const isLocalhost =
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname === '[::1]';

  if (url.protocol === 'http:' && isLocalhost) {
    return;
  }

  throw new HaloPsaConfigurationError(
    `Invalid baseUrl: "${rawUrl}" must use the https: scheme ` +
      `(http: is only allowed for localhost)`,
  );
}

/** Hosted Halo domains a tenant subdomain may be paired with. */
const HALO_HOSTED_DOMAINS = ['halopsa.com', 'haloitsm.com', 'haloservicedesk.com', 'nethelpdesk.com'];

/**
 * Normalize a user-supplied tenant into the bare subdomain that
 * `https://{tenant}.halopsa.com` expects.
 *
 * Users routinely supply a full host or URL here instead of the subdomain
 * ("acme.halopsa.com", "https://acme.halopsa.com/"). Because `*.halopsa.com`
 * has a wildcard DNS record, the resulting `acme.halopsa.com.halopsa.com`
 * still resolves — it then dies at TLS, because the wildcard certificate
 * only covers a single label. The caller sees an opaque `fetch failed`.
 *
 * TODO(policy): decide what to do with a tenant that isn't a bare subdomain.
 * See HALO_HOSTED_DOMAINS above for the recognized hosted domains, and
 * HaloPsaConfigurationError for the rejection path.
 */
function normalizeTenant(tenant: string): string {
  // Accept a full URL or bare host; keep only the host (drop scheme and path).
  const host = tenant.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');

  if (!host.includes('.')) return host; // already a bare subdomain

  const domain = HALO_HOSTED_DOMAINS.find((d) => host.endsWith(`.${d}`));
  if (domain) return host.slice(0, -(domain.length + 1));

  throw new HaloPsaConfigurationError(
    `Invalid tenant: "${tenant}" is not a hosted Halo subdomain. ` +
      `Use baseUrl for a self-hosted or custom-domain instance.`,
  );
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /** Whether rate limiting is enabled (default: true) */
  enabled: boolean;
  /** Maximum requests per window (default: 500) */
  maxRequests: number;
  /** Window duration in milliseconds (default: 180000 = 3 minutes) */
  windowMs: number;
  /** Threshold percentage to start throttling (default: 0.8 = 80% = 400 requests) */
  throttleThreshold: number;
  /** Delay between retries on 429 (default: 5000ms) */
  retryAfterMs: number;
  /** Maximum retry attempts on rate limit errors (default: 3) */
  maxRetries: number;
}

/**
 * Default rate limit configuration for HaloPSA
 * 500 requests per 3-minute rolling window
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  enabled: true,
  maxRequests: 500,
  windowMs: 180_000, // 3 minutes
  throttleThreshold: 0.8, // 80% = 400 requests
  retryAfterMs: 5_000,
  maxRetries: 3,
};

/**
 * Configuration for the HaloPSA client
 */
export interface HaloPsaConfig {
  /** OAuth 2.0 Client ID */
  clientId: string;
  /** OAuth 2.0 Client Secret */
  clientSecret: string;
  /** Tenant name (used to construct the base URL: https://{tenant}.halopsa.com) */
  tenant?: string;
  /** Explicit base URL (alternative to tenant) */
  baseUrl?: string;
  /** Tenant ID for multi-tenant applications */
  tenantId?: string;
  /** OAuth scope (default: 'all') */
  scope?: string;
  /** Rate limiting configuration */
  rateLimit?: Partial<RateLimitConfig>;
}

/**
 * Resolved configuration with all defaults applied
 */
export interface ResolvedConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  tenantId?: string;
  scope: string;
  rateLimit: RateLimitConfig;
}

/**
 * Resolves a configuration object by applying defaults
 */
export function resolveConfig(config: HaloPsaConfig): ResolvedConfig {
  // Determine base URL
  let baseUrl: string;
  if (config.baseUrl) {
    // Remove trailing slash if present
    baseUrl = config.baseUrl.replace(/\/$/, '');
    validateBaseUrl(baseUrl);
  } else if (config.tenant) {
    baseUrl = `https://${normalizeTenant(config.tenant.trim())}.halopsa.com`;
  } else {
    throw new HaloPsaConfigurationError('Either tenant or baseUrl must be provided');
  }

  return {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    baseUrl,
    tenantId: config.tenantId,
    scope: config.scope ?? 'all',
    rateLimit: {
      ...DEFAULT_RATE_LIMIT_CONFIG,
      ...config.rateLimit,
    },
  };
}
