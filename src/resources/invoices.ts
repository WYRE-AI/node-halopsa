/**
 * Invoices resource operations
 */

import type { HttpClient } from '../http.js';
import type { PaginatedIterable } from '../pagination.js';
import { createPaginatedIterable } from '../pagination.js';
import type {
  Invoice,
  InvoiceListParams,
  InvoiceListResponse,
  InvoiceCreateData,
  InvoiceUpdateData,
} from '../types/invoices.js';
import { unwrapSingle, buildListParams as sharedBuildListParams } from './utils.js';

/**
 * Invoices resource operations
 */
export class InvoicesResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List invoices with optional filtering
   */
  async list(params?: InvoiceListParams): Promise<InvoiceListResponse> {
    return this.httpClient.request<InvoiceListResponse>('/Invoice', {
      params: this.buildListParams(params),
    });
  }

  /**
   * List all invoices with automatic pagination
   */
  listAll(params?: Omit<InvoiceListParams, 'pageSize' | 'pageNo'>): PaginatedIterable<Invoice> {
    return createPaginatedIterable<Invoice>(
      this.httpClient,
      '/Invoice',
      'invoices',
      this.buildListParams(params)
    );
  }

  /**
   * Get a single invoice by ID
   */
  async get(id: number): Promise<Invoice> {
    const response = await this.httpClient.request<Invoice | { invoices: Invoice[] }>(`/Invoice/${id}`);

    const invoice = unwrapSingle<Invoice>(response, 'invoices');

    if (!invoice) {

      throw new Error(`Invoice ${id} not found`);

    }

    return invoice;
  }

  /**
   * Create a new invoice
   */
  async create(data: InvoiceCreateData): Promise<Invoice> {
    const response = await this.httpClient.request<Invoice | { invoices: Invoice[] }>('/Invoice', {
      method: 'POST',
      body: [data],
    });
    const invoice = unwrapSingle<Invoice>(response, 'invoices');
    if (!invoice) {
      throw new Error('Failed to create invoice');
    }
    return invoice;
  }

  /**
   * Update an existing invoice
   */
  async update(id: number, data: InvoiceUpdateData): Promise<Invoice> {
    const response = await this.httpClient.request<Invoice | { invoices: Invoice[] }>('/Invoice', {
      method: 'POST',
      body: [{ id, ...data }],
    });
    const invoice = unwrapSingle<Invoice>(response, 'invoices');
    if (!invoice) {
      throw new Error('Failed to update invoice');
    }
    return invoice;
  }

  /**
   * Delete an invoice
   */
  async delete(id: number): Promise<void> {
    await this.httpClient.request<void>(`/Invoice/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Send an invoice
   */
  async send(id: number): Promise<void> {
    await this.httpClient.request<void>(`/Invoice/${id}/Send`, {
      method: 'POST',
    });
  }

  /**
   * Build query parameters from list params
   */
  private buildListParams<T extends object>(params?: T): Record<string, string | number | boolean | undefined> {
    return sharedBuildListParams(params);
  }
}
