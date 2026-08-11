/**
 * Internal helpers shared across resource implementations.
 */

/**
 * HaloPSA's single-entity endpoints (`GET /<Entity>/{id}` and `POST /<Entity>`
 * create/update) return the entity bare (`{ id: 1, ... }`), wrapped in a
 * list-style envelope (`{ entities: [{...}] }`), or as a bare array
 * (`[{ id: 1, ... }]`). The shape is endpoint- and version-dependent.
 * This helper accepts all three forms and returns the entity (or undefined).
 */
export function unwrapSingle<T>(
  response: T | T[] | Record<string, unknown> | undefined | null,
  listKey: string
): T | undefined {
  if (!response || typeof response !== 'object') {
    return undefined;
  }
  if (Array.isArray(response)) {
    return response[0] as T | undefined;
  }
  const wrapped = (response as Record<string, unknown>)[listKey];
  if (Array.isArray(wrapped)) {
    return wrapped[0] as T | undefined;
  }
  return response as T;
}

/**
 * HaloPSA silently ignores `page_size`/`page_no` unless `pageinate=true`
 * (their typo, not ours) is sent alongside. Mutates the params object in
 * place when paging is requested.
 */
export function addPageinate(
  params: Record<string, string | number | boolean | undefined>
): Record<string, string | number | boolean | undefined> {
  if (params.page_size !== undefined || params.page_no !== undefined) {
    params.pageinate = true;
  }
  return params;
}

/**
 * Standard camelCase → snake_case converter used by every resource's
 * `buildListParams` to match HaloPSA's API conventions, plus the
 * pageinate fix for paging support.
 */
export function buildListParams<T extends object>(
  params?: T
): Record<string, string | number | boolean | undefined> {
  if (!params) return {};
  const result: Record<string, string | number | boolean | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      const apiKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[apiKey] = value as string | number | boolean;
    }
  }
  return addPageinate(result);
}
