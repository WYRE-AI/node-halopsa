/**
 * Agents (Technicians) resource operations
 */

import type { HttpClient } from '../http.js';
import type { PaginatedIterable } from '../pagination.js';
import { createPaginatedIterable } from '../pagination.js';
import type {
  Agent,
  AgentListParams,
  AgentListResponse,
  AgentCreateData,
  AgentUpdateData,
} from '../types/agents.js';
import { unwrapSingle, buildListParams as sharedBuildListParams } from './utils.js';

/**
 * Agents resource operations
 */
export class AgentsResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List agents with optional filtering
   */
  async list(params?: AgentListParams): Promise<AgentListResponse> {
    return this.httpClient.request<AgentListResponse>('/Agent', {
      params: this.buildListParams(params),
    });
  }

  /**
   * List all agents with automatic pagination
   */
  listAll(params?: Omit<AgentListParams, 'pageSize' | 'pageNo'>): PaginatedIterable<Agent> {
    return createPaginatedIterable<Agent>(
      this.httpClient,
      '/Agent',
      'agents',
      this.buildListParams(params)
    );
  }

  /**
   * Get a single agent by ID
   */
  async get(id: number): Promise<Agent> {
    const response = await this.httpClient.request<Agent | { agents: Agent[] }>(`/Agent/${id}`);

    const agent = unwrapSingle<Agent>(response, 'agents');

    if (!agent) {

      throw new Error(`Agent ${id} not found`);

    }

    return agent;
  }

  /**
   * Get the current authenticated agent
   */
  async me(): Promise<Agent> {
    const response = await this.httpClient.request<Agent | { agents: Agent[] }>('/Agent/me');
    const agent = unwrapSingle<Agent>(response, 'agents');
    if (!agent) {
      throw new Error('Failed to get current agent');
    }
    return agent;
  }

  /**
   * Create a new agent
   */
  async create(data: AgentCreateData): Promise<Agent> {
    const response = await this.httpClient.request<Agent | { agents: Agent[] }>('/Agent', {
      method: 'POST',
      body: [data],
    });
    const agent = unwrapSingle<Agent>(response, 'agents');
    if (!agent) {
      throw new Error('Failed to create agent');
    }
    return agent;
  }

  /**
   * Update an existing agent
   */
  async update(id: number, data: AgentUpdateData): Promise<Agent> {
    const response = await this.httpClient.request<Agent | { agents: Agent[] }>('/Agent', {
      method: 'POST',
      body: [{ id, ...data }],
    });
    const agent = unwrapSingle<Agent>(response, 'agents');
    if (!agent) {
      throw new Error('Failed to update agent');
    }
    return agent;
  }

  /**
   * Delete an agent
   */
  async delete(id: number): Promise<void> {
    await this.httpClient.request<void>(`/Agent/${id}`, {
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
