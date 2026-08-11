/**
 * Quotes resource operations
 */

import type { HttpClient } from '../http.js';
import type { PaginatedIterable } from '../pagination.js';
import { createPaginatedIterable } from '../pagination.js';
import type {
  Quote,
  QuoteListParams,
  QuoteListResponse,
  QuoteCreateData,
  QuoteUpdateData,
  QuoteConvertResponse,
} from '../types/quotes.js';
import { unwrapSingle, buildListParams as sharedBuildListParams } from './utils.js';

/**
 * Quotes resource operations
 */
export class QuotesResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List quotes with optional filtering
   */
  async list(params?: QuoteListParams): Promise<QuoteListResponse> {
    return this.httpClient.request<QuoteListResponse>('/Quotation', {
      params: this.buildListParams(params),
    });
  }

  /**
   * List all quotes with automatic pagination
   */
  listAll(params?: Omit<QuoteListParams, 'pageSize' | 'pageNo'>): PaginatedIterable<Quote> {
    return createPaginatedIterable<Quote>(
      this.httpClient,
      '/Quotation',
      'quotations',
      this.buildListParams(params)
    );
  }

  /**
   * Get a single quote by ID
   */
  async get(id: number): Promise<Quote> {
    const response = await this.httpClient.request<Quote | { quotations: Quote[] }>(`/Quotation/${id}`);

    const quote = unwrapSingle<Quote>(response, 'quotations');

    if (!quote) {

      throw new Error(`Quote ${id} not found`);

    }

    return quote;
  }

  /**
   * Create a new quote
   */
  async create(data: QuoteCreateData): Promise<Quote> {
    const response = await this.httpClient.request<Quote | { quotations: Quote[] }>('/Quotation', {
      method: 'POST',
      body: [data],
    });
    const quote = unwrapSingle<Quote>(response, 'quotations');
    if (!quote) {
      throw new Error('Failed to create quote');
    }
    return quote;
  }

  /**
   * Update an existing quote
   */
  async update(id: number, data: QuoteUpdateData): Promise<Quote> {
    const response = await this.httpClient.request<Quote | { quotations: Quote[] }>('/Quotation', {
      method: 'POST',
      body: [{ id, ...data }],
    });
    const quote = unwrapSingle<Quote>(response, 'quotations');
    if (!quote) {
      throw new Error('Failed to update quote');
    }
    return quote;
  }

  /**
   * Delete a quote
   */
  async delete(id: number): Promise<void> {
    await this.httpClient.request<void>(`/Quotation/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Send a quote
   */
  async send(id: number): Promise<void> {
    await this.httpClient.request<void>(`/Quotation/${id}/Send`, {
      method: 'POST',
    });
  }

  /**
   * Convert a quote to an invoice
   */
  async convertToInvoice(id: number): Promise<QuoteConvertResponse> {
    return this.httpClient.request<QuoteConvertResponse>(`/Quotation/${id}/ConvertToInvoice`, {
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
