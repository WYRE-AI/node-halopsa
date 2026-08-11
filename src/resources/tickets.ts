/**
 * Tickets resource operations
 */

import type { HttpClient } from '../http.js';
import type { PaginatedIterable } from '../pagination.js';
import { createPaginatedIterable } from '../pagination.js';
import type {
  Ticket,
  TicketListParams,
  TicketListResponse,
  TicketCreateData,
  TicketUpdateData,
  TicketAction,
  ActionListParams,
  ActionListResponse,
  ActionCreateData,
  TicketAttachment,
  AttachmentListResponse,
  AttachmentCreateData,
} from '../types/tickets.js';
import { unwrapSingle, buildListParams as sharedBuildListParams } from './utils.js';

/**
 * Tickets resource operations
 */
export class TicketsResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List tickets with optional filtering
   */
  async list(params?: TicketListParams): Promise<TicketListResponse> {
    return this.httpClient.request<TicketListResponse>('/Tickets', {
      params: this.buildListParams(params),
    });
  }

  /**
   * List all tickets with automatic pagination
   */
  listAll(params?: Omit<TicketListParams, 'pageSize' | 'pageNo'>): PaginatedIterable<Ticket> {
    return createPaginatedIterable<Ticket>(
      this.httpClient,
      '/Tickets',
      'tickets',
      this.buildListParams(params)
    );
  }

  /**
   * Get a single ticket by ID
   */
  async get(id: number): Promise<Ticket> {
    const response = await this.httpClient.request<Ticket | { tickets: Ticket[] }>(`/Tickets/${id}`);
    const ticket = unwrapSingle<Ticket>(response, 'tickets');
    if (!ticket) {
      throw new Error(`Ticket ${id} not found`);
    }
    return ticket;
  }

  /**
   * Create a new ticket
   */
  async create(data: TicketCreateData): Promise<Ticket> {
    const response = await this.httpClient.request<Ticket | { tickets: Ticket[] }>('/Tickets', {
      method: 'POST',
      body: [data],
    });
    const ticket = unwrapSingle<Ticket>(response, 'tickets');
    if (!ticket) {
      throw new Error('Failed to create ticket');
    }
    return ticket;
  }

  /**
   * Update an existing ticket
   */
  async update(id: number, data: TicketUpdateData): Promise<Ticket> {
    const response = await this.httpClient.request<Ticket | { tickets: Ticket[] }>('/Tickets', {
      method: 'POST',
      body: [{ id, ...data }],
    });
    const ticket = unwrapSingle<Ticket>(response, 'tickets');
    if (!ticket) {
      throw new Error('Failed to update ticket');
    }
    return ticket;
  }

  /**
   * Delete a ticket
   */
  async delete(id: number): Promise<void> {
    await this.httpClient.request<void>(`/Tickets/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get actions for a ticket
   */
  async actions(id: number, params?: ActionListParams): Promise<ActionListResponse> {
    return this.httpClient.request<ActionListResponse>(`/Tickets/${id}/Actions`, {
      params: this.buildListParams(params),
    });
  }

  /**
   * Add an action to a ticket
   */
  async addAction(id: number, data: ActionCreateData): Promise<TicketAction> {
    const response = await this.httpClient.request<TicketAction | { actions: TicketAction[] }>('/Actions', {
      method: 'POST',
      body: [{ ticket_id: id, ...data }],
    });
    const action = unwrapSingle<TicketAction>(response, 'actions');
    if (!action) {
      throw new Error('Failed to create action');
    }
    return action;
  }

  /**
   * Get attachments for a ticket
   */
  async attachments(id: number): Promise<AttachmentListResponse> {
    return this.httpClient.request<AttachmentListResponse>(`/Tickets/${id}/Attachments`);
  }

  /**
   * Add an attachment to a ticket
   */
  async addAttachment(id: number, data: AttachmentCreateData): Promise<TicketAttachment> {
    const response = await this.httpClient.request<TicketAttachment | { attachments: TicketAttachment[] }>(`/Tickets/${id}/Attachments`, {
      method: 'POST',
      body: [data],
    });
    const attachment = unwrapSingle<TicketAttachment>(response, 'attachments');
    if (!attachment) {
      throw new Error('Failed to create attachment');
    }
    return attachment;
  }

  /**
   * Build query parameters from list params
   */
  private buildListParams<T extends object>(params?: T): Record<string, string | number | boolean | undefined> {
    return sharedBuildListParams(params);
  }
}
