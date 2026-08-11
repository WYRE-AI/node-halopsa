/**
 * Resource helper unit tests
 */

import { describe, it, expect } from 'vitest';
import { unwrapSingle, addPageinate, buildListParams } from '../../src/resources/utils.js';

describe('unwrapSingle', () => {
  it('returns first element of wrapped list response', () => {
    const wrapped = { tickets: [{ id: 1, summary: 'wrapped' }, { id: 2, summary: 'second' }] };
    expect(unwrapSingle<{ id: number }>(wrapped, 'tickets')).toEqual({ id: 1, summary: 'wrapped' });
  });

  it('returns response itself when bare object', () => {
    const bare = { id: 7, summary: 'bare' };
    expect(unwrapSingle<{ id: number }>(bare, 'tickets')).toEqual(bare);
  });

  it('returns first element of bare array response', () => {
    const bareArray = [{ id: 4, summary: 'bare array' }, { id: 5, summary: 'second' }];
    expect(unwrapSingle<{ id: number }>(bareArray, 'tickets')).toEqual({ id: 4, summary: 'bare array' });
  });

  it('returns undefined when wrapped list is empty', () => {
    expect(unwrapSingle({ tickets: [] }, 'tickets')).toBeUndefined();
  });

  it('returns undefined when bare array is empty', () => {
    expect(unwrapSingle([], 'tickets')).toBeUndefined();
  });

  it('returns undefined for null/undefined response', () => {
    expect(unwrapSingle(null, 'tickets')).toBeUndefined();
    expect(unwrapSingle(undefined, 'tickets')).toBeUndefined();
  });
});

describe('addPageinate', () => {
  it('adds pageinate=true when page_size is set', () => {
    expect(addPageinate({ page_size: 10 })).toEqual({ page_size: 10, pageinate: true });
  });

  it('adds pageinate=true when page_no is set', () => {
    expect(addPageinate({ page_no: 2 })).toEqual({ page_no: 2, pageinate: true });
  });

  it('does not add pageinate when neither paging param is set', () => {
    expect(addPageinate({ open_only: true })).toEqual({ open_only: true });
  });
});

describe('buildListParams', () => {
  it('camelCase → snake_case', () => {
    expect(buildListParams({ pageSize: 25, openOnly: true })).toEqual({
      page_size: 25,
      open_only: true,
      pageinate: true,
    });
  });

  it('drops undefined values', () => {
    expect(buildListParams({ pageSize: undefined, clientId: 1 })).toEqual({ client_id: 1 });
  });

  it('returns empty object when params is undefined', () => {
    expect(buildListParams()).toEqual({});
  });
});
