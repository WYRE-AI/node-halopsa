/**
 * Actions (Ticket Activities) resource operations
 */

import type { HttpClient } from '../http.js';
import type { PaginatedIterable } from '../pagination.js';
import { createPaginatedIterable } from '../pagination.js';
import type {
  Action,
  ActionListParams,
  ActionListResponse,
  ActionCreateData,
  ActionUpdateData,
} from '../types/actions.js';
import { unwrapSingle, buildListParams as sharedBuildListParams } from './utils.js';

/**
 * Actions resource operations
 */
export class ActionsResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List actions with optional filtering
   */
  async list(params?: ActionListParams): Promise<ActionListResponse> {
    return this.httpClient.request<ActionListResponse>('/Actions', {
      params: this.buildListParams(params),
    });
  }

  /**
   * List all actions with automatic pagination
   */
  listAll(params?: Omit<ActionListParams, 'pageSize' | 'pageNo'>): PaginatedIterable<Action> {
    return createPaginatedIterable<Action>(
      this.httpClient,
      '/Actions',
      'actions',
      this.buildListParams(params)
    );
  }

  /**
   * Get a single action by ID
   */
  async get(id: number): Promise<Action> {
    const response = await this.httpClient.request<Action | { actions: Action[] }>(`/Actions/${id}`);
    const action = unwrapSingle<Action>(response, 'actions');
    if (!action) {
      throw new Error(`Action ${id} not found`);
    }
    return action;
  }

  /**
   * Create a new action
   */
  async create(data: ActionCreateData): Promise<Action> {
    const response = await this.httpClient.request<Action | { actions: Action[] }>('/Actions', {
      method: 'POST',
      body: [data],
    });
    const action = unwrapSingle<Action>(response, 'actions');
    if (!action) {
      throw new Error('Failed to create action');
    }
    return action;
  }

  /**
   * Update an existing action
   */
  async update(id: number, data: ActionUpdateData): Promise<Action> {
    const response = await this.httpClient.request<Action | { actions: Action[] }>('/Actions', {
      method: 'POST',
      body: [{ id, ...data }],
    });
    const action = unwrapSingle<Action>(response, 'actions');
    if (!action) {
      throw new Error('Failed to update action');
    }
    return action;
  }

  /**
   * Delete an action
   */
  async delete(id: number): Promise<void> {
    await this.httpClient.request<void>(`/Actions/${id}`, {
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
