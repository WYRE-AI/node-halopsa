/**
 * Appointments resource operations
 */

import type { HttpClient } from '../http.js';
import type { PaginatedIterable } from '../pagination.js';
import { createPaginatedIterable } from '../pagination.js';
import type {
  Appointment,
  AppointmentListParams,
  AppointmentListResponse,
  AppointmentCreateData,
  AppointmentUpdateData,
} from '../types/appointments.js';
import { unwrapSingle, buildListParams as sharedBuildListParams } from './utils.js';

/**
 * Appointments resource operations
 */
export class AppointmentsResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List appointments with optional filtering
   */
  async list(params?: AppointmentListParams): Promise<AppointmentListResponse> {
    return this.httpClient.request<AppointmentListResponse>('/Appointment', {
      params: this.buildAppointmentListParams(params),
    });
  }

  /**
   * List all appointments with automatic pagination
   */
  listAll(params?: Omit<AppointmentListParams, 'pageSize' | 'pageNo'>): PaginatedIterable<Appointment> {
    return createPaginatedIterable<Appointment>(
      this.httpClient,
      '/Appointment',
      'appointments',
      this.buildAppointmentListParams(params)
    );
  }

  /**
   * Get a single appointment by ID
   */
  async get(id: number): Promise<Appointment> {
    const response = await this.httpClient.request<Appointment | { appointments: Appointment[] }>(`/Appointment/${id}`);

    const appointment = unwrapSingle<Appointment>(response, 'appointments');

    if (!appointment) {

      throw new Error(`Appointment ${id} not found`);

    }

    return appointment;
  }

  /**
   * Create a new appointment
   */
  async create(data: AppointmentCreateData): Promise<Appointment> {
    const response = await this.httpClient.request<Appointment | { appointments: Appointment[] }>('/Appointment', {
      method: 'POST',
      body: [data],
    });
    const appointment = unwrapSingle<Appointment>(response, 'appointments');
    if (!appointment) {
      throw new Error('Failed to create appointment');
    }
    return appointment;
  }

  /**
   * Update an existing appointment
   */
  async update(id: number, data: AppointmentUpdateData): Promise<Appointment> {
    const response = await this.httpClient.request<Appointment | { appointments: Appointment[] }>('/Appointment', {
      method: 'POST',
      body: [{ id, ...data }],
    });
    const appointment = unwrapSingle<Appointment>(response, 'appointments');
    if (!appointment) {
      throw new Error('Failed to update appointment');
    }
    return appointment;
  }

  /**
   * Delete an appointment
   */
  async delete(id: number): Promise<void> {
    await this.httpClient.request<void>(`/Appointment/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Build query parameters for `list()`/`listAll()`.
   *
   * `startdate_start`/`startdate_end` are not real HaloPSA query parameters
   * -- confirmed against HaloPSA's own `/api/swagger/v2/swagger.json` --
   * sending them literally (as the shared camelCase→snake_case converter
   * would, since they're already snake_case) is accepted and silently
   * ignored, with no filtering applied and no error. The real parameters
   * are `start_date`/`end_date`. Unlike Tickets, the Appointment endpoint
   * takes no `datesearch` parameter at all -- `start_date`/`end_date` are
   * unconditional, not paired with a date-field selector.
   */
  private buildAppointmentListParams(
    params?: AppointmentListParams
  ): Record<string, string | number | boolean | undefined> {
    if (params?.startdate_start === undefined && params?.startdate_end === undefined) {
      return sharedBuildListParams(params);
    }

    const { startdate_start, startdate_end, ...rest } = params;
    return sharedBuildListParams({
      ...rest,
      start_date: startdate_start,
      end_date: startdate_end,
    });
  }
}
