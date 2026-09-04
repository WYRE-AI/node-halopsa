/**
 * node-halopsa
 * Comprehensive, fully-typed Node.js/TypeScript library for the HaloPSA API
 */

// Main client
export { HaloPsaClient } from './client.js';

// Configuration
export type { HaloPsaConfig, RateLimitConfig } from './config.js';
export { DEFAULT_RATE_LIMIT_CONFIG } from './config.js';

// Error classes
export {
  HaloPsaError,
  HaloPsaAuthenticationError,
  HaloPsaBadRequestError,
  HaloPsaForbiddenError,
  HaloPsaNotFoundError,
  HaloPsaValidationError,
  HaloPsaRateLimitError,
  HaloPsaConfigurationError,
  HaloPsaServerError,
} from './errors.js';

// Types
export * from './types/index.js';
