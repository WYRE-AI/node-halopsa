/**
 * Custom error classes for the HaloPSA client
 */

/**
 * Base error class for all HaloPSA errors
 */
export class HaloPsaError extends Error {
  /** HTTP status code if applicable */
  readonly statusCode: number;
  /** Raw response data if available */
  readonly response: unknown;

  constructor(message: string, statusCode: number = 0, response?: unknown) {
    super(message);
    this.name = 'HaloPsaError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, HaloPsaError.prototype);
  }
}

/**
 * Authentication error (401 unauthorized; also 400 from the OAuth token
 * endpoint itself, thrown directly by AuthManager — never by HttpClient,
 * since resource requests never carry skipAuth and so never reach
 * HttpClient's own 400 branch, see HaloPsaBadRequestError)
 */
export class HaloPsaAuthenticationError extends HaloPsaError {
  constructor(message: string, statusCode: number = 401, response?: unknown) {
    super(message, statusCode, response);
    this.name = 'HaloPsaAuthenticationError';
    Object.setPrototypeOf(this, HaloPsaAuthenticationError.prototype);
  }
}

/**
 * Forbidden error (403 permission denied)
 */
export class HaloPsaForbiddenError extends HaloPsaError {
  constructor(message: string, response?: unknown) {
    super(message, 403, response);
    this.name = 'HaloPsaForbiddenError';
    Object.setPrototypeOf(this, HaloPsaForbiddenError.prototype);
  }
}

/**
 * Resource not found error (404)
 */
export class HaloPsaNotFoundError extends HaloPsaError {
  constructor(message: string, response?: unknown) {
    super(message, 404, response);
    this.name = 'HaloPsaNotFoundError';
    Object.setPrototypeOf(this, HaloPsaNotFoundError.prototype);
  }
}

/**
 * Validation error (400 with field-level errors)
 */
export class HaloPsaValidationError extends HaloPsaError {
  /** Field-level validation errors */
  readonly errors: Array<{ field: string; message: string }>;

  constructor(message: string, errors: Array<{ field: string; message: string }> = [], response?: unknown) {
    super(message, 400, response);
    this.name = 'HaloPsaValidationError';
    this.errors = errors;
    Object.setPrototypeOf(this, HaloPsaValidationError.prototype);
  }
}

/**
 * Bad request error (400 from a resource endpoint that isn't a recognized
 * validation-error shape — a malformed or incomplete request payload, not
 * a credentials problem. Resource requests are always authenticated via a
 * Bearer token by the time they reach here, so a plain 400 here can't be
 * "bad credentials" the way it legitimately can be on the OAuth token
 * endpoint itself; see HaloPsaAuthenticationError)
 */
export class HaloPsaBadRequestError extends HaloPsaError {
  constructor(message: string, response?: unknown) {
    super(message, 400, response);
    this.name = 'HaloPsaBadRequestError';
    Object.setPrototypeOf(this, HaloPsaBadRequestError.prototype);
  }
}

/**
 * Rate limit exceeded error (429)
 */
export class HaloPsaRateLimitError extends HaloPsaError {
  /** Suggested retry delay in milliseconds */
  readonly retryAfter: number;

  constructor(message: string, retryAfter: number = 5000, response?: unknown) {
    super(message, 429, response);
    this.name = 'HaloPsaRateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, HaloPsaRateLimitError.prototype);
  }
}

/**
 * Configuration error (invalid client configuration, e.g. bad baseUrl)
 */
export class HaloPsaConfigurationError extends HaloPsaError {
  constructor(message: string, response?: unknown) {
    super(message, 0, response);
    this.name = 'HaloPsaConfigurationError';
    Object.setPrototypeOf(this, HaloPsaConfigurationError.prototype);
  }
}

/**
 * Server error (500+)
 */
export class HaloPsaServerError extends HaloPsaError {
  constructor(message: string, statusCode: number = 500, response?: unknown) {
    super(message, statusCode, response);
    this.name = 'HaloPsaServerError';
    Object.setPrototypeOf(this, HaloPsaServerError.prototype);
  }
}
