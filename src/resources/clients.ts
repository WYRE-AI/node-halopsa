/**
 * Clients (Companies) resource operations
 */

import type { HttpClient } from '../http.js';
import type { PaginatedIterable } from '../pagination.js';
import { createPaginatedIterable } from '../pagination.js';
import type {
  Client,
  ClientListParams,
  ClientListResponse,
  ClientCreateData,
  ClientUpdateData,
} from '../types/clients.js';
import { unwrapSingle, buildListParams as sharedBuildListParams } from './utils.js';

/**
 * Clients resource operations
 */
export class ClientsResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List clients with optional filtering
   */
  async list(params?: ClientListParams): Promise<ClientListResponse> {
    return this.httpClient.request<ClientListResponse>('/Client', {
      params: this.buildListParams(params),
    });
  }

  /**
   * List all clients with automatic pagination
   */
  listAll(params?: Omit<ClientListParams, 'pageSize' | 'pageNo'>): PaginatedIterable<Client> {
    return createPaginatedIterable<Client>(
      this.httpClient,
      '/Client',
      'clients',
      this.buildListParams(params)
    );
  }

  /**
   * Get a single client by ID
   */
  async get(id: number): Promise<Client> {
    const response = await this.httpClient.request<Client | { clients: Client[] }>(`/Client/${id}`);

    const client = unwrapSingle<Client>(response, 'clients');

    if (!client) {

      throw new Error(`Client ${id} not found`);

    }

    return client;
  }

  /**
   * Create a new client
   */
  async create(data: ClientCreateData): Promise<Client> {
    const response = await this.httpClient.request<Client | { clients: Client[] }>('/Client', {
      method: 'POST',
      body: [data],
    });
    const client = unwrapSingle<Client>(response, 'clients');
    if (!client) {
      throw new Error('Failed to create client');
    }
    return client;
  }

  /**
   * Update an existing client
   */
  async update(id: number, data: ClientUpdateData): Promise<Client> {
    const response = await this.httpClient.request<Client | { clients: Client[] }>('/Client', {
      method: 'POST',
      body: [{ id, ...data }],
    });
    const client = unwrapSingle<Client>(response, 'clients');
    if (!client) {
      throw new Error('Failed to update client');
    }
    return client;
  }

  /**
   * Delete a client
   */
  async delete(id: number): Promise<void> {
    await this.httpClient.request<void>(`/Client/${id}`, {
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
