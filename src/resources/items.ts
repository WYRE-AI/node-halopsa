/**
 * Items (Products/Services) resource operations
 */

import type { HttpClient } from '../http.js';
import type { PaginatedIterable } from '../pagination.js';
import { createPaginatedIterable } from '../pagination.js';
import type {
  Item,
  ItemListParams,
  ItemListResponse,
  ItemCreateData,
  ItemUpdateData,
} from '../types/items.js';
import { unwrapSingle, buildListParams as sharedBuildListParams } from './utils.js';

/**
 * Items resource operations
 */
export class ItemsResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List items with optional filtering
   */
  async list(params?: ItemListParams): Promise<ItemListResponse> {
    return this.httpClient.request<ItemListResponse>('/Item', {
      params: this.buildListParams(params),
    });
  }

  /**
   * List all items with automatic pagination
   */
  listAll(params?: Omit<ItemListParams, 'pageSize' | 'pageNo'>): PaginatedIterable<Item> {
    return createPaginatedIterable<Item>(
      this.httpClient,
      '/Item',
      'items',
      this.buildListParams(params)
    );
  }

  /**
   * Get a single item by ID
   */
  async get(id: number): Promise<Item> {
    const response = await this.httpClient.request<Item | { items: Item[] }>(`/Item/${id}`);

    const item = unwrapSingle<Item>(response, 'items');

    if (!item) {

      throw new Error(`Item ${id} not found`);

    }

    return item;
  }

  /**
   * Create a new item
   */
  async create(data: ItemCreateData): Promise<Item> {
    const response = await this.httpClient.request<Item | { items: Item[] }>('/Item', {
      method: 'POST',
      body: [data],
    });
    const item = unwrapSingle<Item>(response, 'items');
    if (!item) {
      throw new Error('Failed to create item');
    }
    return item;
  }

  /**
   * Update an existing item
   */
  async update(id: number, data: ItemUpdateData): Promise<Item> {
    const response = await this.httpClient.request<Item | { items: Item[] }>('/Item', {
      method: 'POST',
      body: [{ id, ...data }],
    });
    const item = unwrapSingle<Item>(response, 'items');
    if (!item) {
      throw new Error('Failed to update item');
    }
    return item;
  }

  /**
   * Delete an item
   */
  async delete(id: number): Promise<void> {
    await this.httpClient.request<void>(`/Item/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Build query parameters from list params
   */
  private buildListParams<T extends object>(params?: T): Record<string, string | number | boolean | undefined> {
    return sharedBuildListParams(params);
  }
}
