/**
 * Appointment types for HaloPSA
 */

import type { BaseEntity, BaseListParams } from './common.js';

/**
 * Appointment entity
 */
export interface Appointment extends BaseEntity {
  subject: string;
  description?: string;
  ticket_id?: number;
  client_id?: number;
  client_name?: string;
  site_id?: number;
  site_name?: string;
  user_id?: number;
  user_name?: string;
  agent_id?: number;
  agent_name?: string;
  startdate: string;
  enddate: string;
  allday: boolean;
  location?: string;
  status?: string;
}

/**
 * Appointment list parameters
 */
export interface AppointmentListParams extends BaseListParams {
  /** Filter by ticket */
  ticket_id?: number;
  /** Filter by client */
  client_id?: number;
  /** Filter by agent */
  agent_id?: number;
  /** Filter by start date (translated to HaloPSA's start_date parameter) */
  startdate_start?: string;
  /** Filter by end date (translated to HaloPSA's end_date parameter) */
  startdate_end?: string;
}

/**
 * Appointment list response
 */
export interface AppointmentListResponse {
  record_count: number;
  appointments: Appointment[];
}

/**
 * Appointment creation data
 */
export interface AppointmentCreateData {
  subject: string;
  description?: string;
  ticket_id?: number;
  client_id?: number;
  site_id?: number;
  user_id?: number;
  agent_id?: number;
  startdate: string;
  enddate: string;
  allday?: boolean;
  location?: string;
  status?: string;
}

/**
 * Appointment update data
 */
export interface AppointmentUpdateData {
  subject?: string;
  description?: string;
  ticket_id?: number;
  site_id?: number;
  user_id?: number;
  agent_id?: number;
  startdate?: string;
  enddate?: string;
  allday?: boolean;
  location?: string;
  status?: string;
}
