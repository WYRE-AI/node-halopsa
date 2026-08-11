/**
 * Opportunities (Sales) resource operations
 */

import type { HttpClient } from '../http.js';
import type { PaginatedIterable } from '../pagination.js';
import { createPaginatedIterable } from '../pagination.js';
import type {
  Opportunity,
  OpportunityListParams,
  OpportunityListResponse,
  OpportunityCreateData,
  OpportunityUpdateData,
} from '../types/opportunities.js';
import { unwrapSingle, buildListParams as sharedBuildListParams } from './utils.js';

/**
 * Opportunities resource operations
 */
export class OpportunitiesResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List opportunities with optional filtering
   */
  async list(params?: OpportunityListParams): Promise<OpportunityListResponse> {
    return this.httpClient.request<OpportunityListResponse>('/Opportunities', {
      params: this.buildListParams(params),
    });
  }

  /**
   * List all opportunities with automatic pagination
   */
  listAll(params?: Omit<OpportunityListParams, 'pageSize' | 'pageNo'>): PaginatedIterable<Opportunity> {
    return createPaginatedIterable<Opportunity>(
      this.httpClient,
      '/Opportunities',
      'opportunities',
      this.buildListParams(params)
    );
  }

  /**
   * Get a single opportunity by ID
   */
  async get(id: number): Promise<Opportunity> {
    const response = await this.httpClient.request<Opportunity | { opportunities: Opportunity[] }>(`/Opportunities/${id}`);

    const opportunity = unwrapSingle<Opportunity>(response, 'opportunities');

    if (!opportunity) {

      throw new Error(`Opportunity ${id} not found`);

    }

    return opportunity;
  }

  /**
   * Create a new opportunity
   */
  async create(data: OpportunityCreateData): Promise<Opportunity> {
    const response = await this.httpClient.request<Opportunity | { opportunities: Opportunity[] }>('/Opportunities', {
      method: 'POST',
      body: [data],
    });
    const opportunity = unwrapSingle<Opportunity>(response, 'opportunities');
    if (!opportunity) {
      throw new Error('Failed to create opportunity');
    }
    return opportunity;
  }

  /**
   * Update an existing opportunity
   */
  async update(id: number, data: OpportunityUpdateData): Promise<Opportunity> {
    const response = await this.httpClient.request<Opportunity | { opportunities: Opportunity[] }>('/Opportunities', {
      method: 'POST',
      body: [{ id, ...data }],
    });
    const opportunity = unwrapSingle<Opportunity>(response, 'opportunities');
    if (!opportunity) {
      throw new Error('Failed to update opportunity');
    }
    return opportunity;
  }

  /**
   * Delete an opportunity
   */
  async delete(id: number): Promise<void> {
    await this.httpClient.request<void>(`/Opportunities/${id}`, {
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
