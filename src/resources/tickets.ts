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
      params: this.buildTicketListParams(params),
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
      this.buildTicketListParams(params)
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
      params: sharedBuildListParams(params),
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
   * Build query parameters for `list()`/`listAll()`.
   *
   * `dateoccurred_start`/`dateoccurred_end` are not real HaloPSA query
   * parameters -- sending them literally (as the shared camelCase→snake_case
   * converter would, since they're already snake_case) is accepted and
   * silently ignored by the API, with no error and no filtering applied.
   * The actual mechanism (confirmed against HaloPSA's own
   * `/api/swagger/v2/swagger.json`) is a generic `datesearch=<field>` plus
   * `startdate`/`enddate` pair; `dateoccured` (missing the second 'r') is
   * HaloPSA's own misspelling of the "date opened" field, not ours.
   *
   * Only ticket list params carry this pair (`actions()` uses the shared
   * `buildListParams` directly), so this stays properly typed rather than
   * the generic `<T extends object>` every other resource's private helper
   * uses -- there's no other caller to support here.
   */
  private buildTicketListParams(
    params?: TicketListParams
  ): Record<string, string | number | boolean | undefined> {
    if (params?.dateoccurred_start === undefined && params?.dateoccurred_end === undefined) {
      return sharedBuildListParams(params);
    }

    const { dateoccurred_start, dateoccurred_end, ...rest } = params;
    return sharedBuildListParams({
      ...rest,
      datesearch: 'dateoccured',
      startdate: dateoccurred_start,
      enddate: dateoccurred_end,
    });
  }
}
