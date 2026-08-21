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
 *
 * Also defaults `page_no` to `1` whenever `page_size` is set without it:
 * HaloPSA only honors a caller's `page_size` when `page_no` is *also*
 * present on the same request. Send `page_size` alone (as every single-page
 * `.list({ pageSize })` call did before this fix) and the API silently
 * falls back to its own default page size (50) for that implicit first
 * page — `page_size` is accepted but ignored, with no error, and the
 * records between the truncated first page and an explicit `page_no: 2`
 * request are never returned by any call. `record_count` is affected the
 * same way: it only reports the true total once pagination is genuinely
 * active on every request, which requires `page_no` to be explicit too.
 */
export function addPageinate(
  params: Record<string, string | number | boolean | undefined>
): Record<string, string | number | boolean | undefined> {
  if (params.page_size !== undefined || params.page_no !== undefined) {
    params.pageinate = true;
    if (params.page_no === undefined) {
      params.page_no = 1;
    }
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
