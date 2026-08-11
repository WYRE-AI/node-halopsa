/**
 * Suppliers resource operations
 */

import type { HttpClient } from '../http.js';
import type { PaginatedIterable } from '../pagination.js';
import { createPaginatedIterable } from '../pagination.js';
import type {
  Supplier,
  SupplierListParams,
  SupplierListResponse,
  SupplierCreateData,
  SupplierUpdateData,
} from '../types/suppliers.js';
import { unwrapSingle, buildListParams as sharedBuildListParams } from './utils.js';

/**
 * Suppliers resource operations
 */
export class SuppliersResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List suppliers with optional filtering
   */
  async list(params?: SupplierListParams): Promise<SupplierListResponse> {
    return this.httpClient.request<SupplierListResponse>('/Supplier', {
      params: this.buildListParams(params),
    });
  }

  /**
   * List all suppliers with automatic pagination
   */
  listAll(params?: Omit<SupplierListParams, 'pageSize' | 'pageNo'>): PaginatedIterable<Supplier> {
    return createPaginatedIterable<Supplier>(
      this.httpClient,
      '/Supplier',
      'suppliers',
      this.buildListParams(params)
    );
  }

  /**
   * Get a single supplier by ID
   */
  async get(id: number): Promise<Supplier> {
    const response = await this.httpClient.request<Supplier | { suppliers: Supplier[] }>(`/Supplier/${id}`);

    const supplier = unwrapSingle<Supplier>(response, 'suppliers');

    if (!supplier) {

      throw new Error(`Supplier ${id} not found`);

    }

    return supplier;
  }

  /**
   * Create a new supplier
   */
  async create(data: SupplierCreateData): Promise<Supplier> {
    const response = await this.httpClient.request<Supplier | { suppliers: Supplier[] }>('/Supplier', {
      method: 'POST',
      body: [data],
    });
    const supplier = unwrapSingle<Supplier>(response, 'suppliers');
    if (!supplier) {
      throw new Error('Failed to create supplier');
    }
    return supplier;
  }

  /**
   * Update an existing supplier
   */
  async update(id: number, data: SupplierUpdateData): Promise<Supplier> {
    const response = await this.httpClient.request<Supplier | { suppliers: Supplier[] }>('/Supplier', {
      method: 'POST',
      body: [{ id, ...data }],
    });
    const supplier = unwrapSingle<Supplier>(response, 'suppliers');
    if (!supplier) {
      throw new Error('Failed to update supplier');
    }
    return supplier;
  }

  /**
   * Delete a supplier
   */
  async delete(id: number): Promise<void> {
    await this.httpClient.request<void>(`/Supplier/${id}`, {
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
