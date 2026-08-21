/**
 * Ticket types for HaloPSA
 */

import type { BaseEntity, BaseListParams, CustomField } from './common.js';

/**
 * Ticket entity
 */
export interface Ticket extends BaseEntity {
  summary: string;
  details: string;
  client_id: number;
  client_name?: string;
  site_id?: number;
  site_name?: string;
  user_id?: number;
  user_name?: string;
  agent_id?: number;
  agent_name?: string;
  team_id?: number;
  team_name?: string;
  tickettype_id: number;
  tickettype_name?: string;
  status_id: number;
  status_name?: string;
  priority_id: number;
  priority_name?: string;
  category_1?: string;
  category_2?: string;
  category_3?: string;
  category_4?: string;
  sla_id?: number;
  sla_name?: string;
  dateoccurred: string;
  datecreated: string;
  datelastupdate?: string;
  deadlinedate?: string;
  responsedate?: string;
  resolutiondate?: string;
  closeddate?: string;
  customfields?: CustomField[];
}

/**
 * Ticket list parameters
 */
export interface TicketListParams extends BaseListParams {
  /** Filter by client */
  client_id?: number;
  /** Filter by site */
  site_id?: number;
  /** Filter by user */
  user_id?: number;
  /** Filter by assigned agent */
  agent_id?: number;
  /** Filter by team */
  team_id?: number;
  /** Filter by status */
  status_id?: number;
  /** Filter by priority */
  priority_id?: number;
  /** Filter by ticket type */
  tickettype_id?: number;
  /** Filter by category */
  category_1?: string;
  /** Filter by date occurred start (translated to HaloPSA's datesearch/startdate pair) */
  dateoccurred_start?: string;
  /** Filter by date occurred end (translated to HaloPSA's datesearch/enddate pair) */
  dateoccurred_end?: string;
  /** Show only open tickets */
  open_only?: boolean;
  /** Show only closed tickets */
  closed_only?: boolean;
  /** Include ticket actions */
  includeactions?: boolean;
}

/**
 * Ticket list response
 */
export interface TicketListResponse {
  record_count: number;
  tickets: Ticket[];
}

/**
 * Ticket creation data
 */
export interface TicketCreateData {
  summary: string;
  details?: string;
  client_id: number;
  site_id?: number;
  user_id?: number;
  agent_id?: number;
  team_id?: number;
  tickettype_id: number;
  status_id?: number;
  priority_id?: number;
  category_1?: string;
  category_2?: string;
  category_3?: string;
  category_4?: string;
  sla_id?: number;
  deadlinedate?: string;
  customfields?: CustomField[];
}

/**
 * Ticket update data
 */
export interface TicketUpdateData {
  summary?: string;
  details?: string;
  site_id?: number;
  user_id?: number;
  agent_id?: number;
  team_id?: number;
  status_id?: number;
  priority_id?: number;
  category_1?: string;
  category_2?: string;
  category_3?: string;
  category_4?: string;
  sla_id?: number;
  deadlinedate?: string;
  customfields?: CustomField[];
}

/**
 * Ticket action (activity)
 */
export interface TicketAction {
  id: number;
  ticket_id: number;
  who: string;
  who_agentid?: number;
  who_type: string;
  note: string;
  note_html?: string;
  outcome?: string;
  timetaken?: number;
  hiddenfromuser?: boolean;
  emailfrom?: string;
  emailto?: string;
  emailcc?: string;
  sendemail?: boolean;
  actiondate: string;
  actiontype_id?: number;
  actiontype_name?: string;
}

/**
 * Action list parameters
 */
export interface ActionListParams extends BaseListParams {
  /** Filter by ticket */
  ticket_id?: number;
}

/**
 * Action list response
 */
export interface ActionListResponse {
  record_count: number;
  actions: TicketAction[];
}

/**
 * Ticket action creation data
 */
export interface ActionCreateData {
  note: string;
  outcome?: string;
  timetaken?: number;
  hiddenfromuser?: boolean;
  sendemail?: boolean;
  emailto?: string;
  emailcc?: string;
  actiontype_id?: number;
}

/**
 * Ticket attachment
 */
export interface TicketAttachment {
  id: number;
  ticket_id: number;
  filename: string;
  contenttype?: string;
  filesize?: number;
  datecreated: string;
}

/**
 * Attachment list response
 */
export interface AttachmentListResponse {
  record_count: number;
  attachments: TicketAttachment[];
}

/**
 * Attachment creation data
 */
export interface AttachmentCreateData {
  filename: string;
  data: string; // Base64 encoded
  contenttype?: string;
}
