/**
 * Resource write-path response shape tests.
 *
 * HaloPSA returns created/updated entities in three shapes depending on
 * endpoint and version: enveloped ({ actions: [{...}] }), bare object
 * ({ id: 1, ... }), or bare array ([{ id: 1, ... }]). Every create/update
 * path must accept all three — see halopsa-mcp#76.
 */

import { describe, it, expect, vi } from 'vitest';
import type { HttpClient } from '../../src/http.js';
import { ActionsResource } from '../../src/resources/actions.js';
import { AgentsResource } from '../../src/resources/agents.js';
import { AppointmentsResource } from '../../src/resources/appointments.js';
import { AssetsResource } from '../../src/resources/assets.js';
import { ClientsResource } from '../../src/resources/clients.js';
import { ContactsResource } from '../../src/resources/contacts.js';
import { ContractsResource } from '../../src/resources/contracts.js';
import { InvoicesResource } from '../../src/resources/invoices.js';
import { ItemsResource } from '../../src/resources/items.js';
import { OpportunitiesResource } from '../../src/resources/opportunities.js';
import { ProjectsResource } from '../../src/resources/projects.js';
import { QuotesResource } from '../../src/resources/quotes.js';
import {
  KnowledgeBaseResource,
  RecurringInvoicesResource,
  SoftwareLicencesResource,
} from '../../src/resources/reference.js';
import { SitesResource } from '../../src/resources/sites.js';
import { SuppliersResource } from '../../src/resources/suppliers.js';
import { TeamsResource } from '../../src/resources/teams.js';
import { TicketsResource } from '../../src/resources/tickets.js';

const entity = { id: 42, name: 'test-entity' };
const data = {} as never;

const mockHttpClient = (response: unknown): HttpClient =>
  ({ request: vi.fn().mockResolvedValue(response) }) as unknown as HttpClient;

interface WriteCase {
  name: string;
  listKey: string;
  invoke: (httpClient: HttpClient) => Promise<unknown>;
}

const cases: WriteCase[] = [
  { name: 'actions.create', listKey: 'actions', invoke: (hc) => new ActionsResource(hc).create(data) },
  { name: 'actions.update', listKey: 'actions', invoke: (hc) => new ActionsResource(hc).update(1, data) },
  { name: 'agents.me', listKey: 'agents', invoke: (hc) => new AgentsResource(hc).me() },
  { name: 'agents.create', listKey: 'agents', invoke: (hc) => new AgentsResource(hc).create(data) },
  { name: 'agents.update', listKey: 'agents', invoke: (hc) => new AgentsResource(hc).update(1, data) },
  { name: 'appointments.create', listKey: 'appointments', invoke: (hc) => new AppointmentsResource(hc).create(data) },
  { name: 'appointments.update', listKey: 'appointments', invoke: (hc) => new AppointmentsResource(hc).update(1, data) },
  { name: 'assets.create', listKey: 'assets', invoke: (hc) => new AssetsResource(hc).create(data) },
  { name: 'assets.update', listKey: 'assets', invoke: (hc) => new AssetsResource(hc).update(1, data) },
  { name: 'clients.create', listKey: 'clients', invoke: (hc) => new ClientsResource(hc).create(data) },
  { name: 'clients.update', listKey: 'clients', invoke: (hc) => new ClientsResource(hc).update(1, data) },
  { name: 'contacts.create', listKey: 'users', invoke: (hc) => new ContactsResource(hc).create(data) },
  { name: 'contacts.update', listKey: 'users', invoke: (hc) => new ContactsResource(hc).update(1, data) },
  { name: 'contracts.create', listKey: 'contracts', invoke: (hc) => new ContractsResource(hc).create(data) },
  { name: 'contracts.update', listKey: 'contracts', invoke: (hc) => new ContractsResource(hc).update(1, data) },
  { name: 'invoices.create', listKey: 'invoices', invoke: (hc) => new InvoicesResource(hc).create(data) },
  { name: 'invoices.update', listKey: 'invoices', invoke: (hc) => new InvoicesResource(hc).update(1, data) },
  { name: 'items.create', listKey: 'items', invoke: (hc) => new ItemsResource(hc).create(data) },
  { name: 'items.update', listKey: 'items', invoke: (hc) => new ItemsResource(hc).update(1, data) },
  { name: 'opportunities.create', listKey: 'opportunities', invoke: (hc) => new OpportunitiesResource(hc).create(data) },
  { name: 'opportunities.update', listKey: 'opportunities', invoke: (hc) => new OpportunitiesResource(hc).update(1, data) },
  { name: 'projects.create', listKey: 'projects', invoke: (hc) => new ProjectsResource(hc).create(data) },
  { name: 'projects.update', listKey: 'projects', invoke: (hc) => new ProjectsResource(hc).update(1, data) },
  { name: 'quotes.create', listKey: 'quotations', invoke: (hc) => new QuotesResource(hc).create(data) },
  { name: 'quotes.update', listKey: 'quotations', invoke: (hc) => new QuotesResource(hc).update(1, data) },
  { name: 'knowledgeBase.create', listKey: 'articles', invoke: (hc) => new KnowledgeBaseResource(hc).create(data) },
  { name: 'knowledgeBase.update', listKey: 'articles', invoke: (hc) => new KnowledgeBaseResource(hc).update(1, data) },
  { name: 'recurringInvoices.create', listKey: 'recurring_invoices', invoke: (hc) => new RecurringInvoicesResource(hc).create(data) },
  { name: 'recurringInvoices.update', listKey: 'recurring_invoices', invoke: (hc) => new RecurringInvoicesResource(hc).update(1, data) },
  { name: 'softwareLicences.create', listKey: 'software_licences', invoke: (hc) => new SoftwareLicencesResource(hc).create(data) },
  { name: 'softwareLicences.update', listKey: 'software_licences', invoke: (hc) => new SoftwareLicencesResource(hc).update(1, data) },
  { name: 'sites.create', listKey: 'sites', invoke: (hc) => new SitesResource(hc).create(data) },
  { name: 'sites.update', listKey: 'sites', invoke: (hc) => new SitesResource(hc).update(1, data) },
  { name: 'suppliers.create', listKey: 'suppliers', invoke: (hc) => new SuppliersResource(hc).create(data) },
  { name: 'suppliers.update', listKey: 'suppliers', invoke: (hc) => new SuppliersResource(hc).update(1, data) },
  { name: 'teams.create', listKey: 'teams', invoke: (hc) => new TeamsResource(hc).create(data) },
  { name: 'teams.update', listKey: 'teams', invoke: (hc) => new TeamsResource(hc).update(1, data) },
  { name: 'tickets.create', listKey: 'tickets', invoke: (hc) => new TicketsResource(hc).create(data) },
  { name: 'tickets.update', listKey: 'tickets', invoke: (hc) => new TicketsResource(hc).update(1, data) },
  { name: 'tickets.addAction', listKey: 'actions', invoke: (hc) => new TicketsResource(hc).addAction(1, data) },
  { name: 'tickets.addAttachment', listKey: 'attachments', invoke: (hc) => new TicketsResource(hc).addAttachment(1, data) },
];

describe.each(cases)('$name', ({ listKey, invoke }) => {
  it('unwraps an enveloped response', async () => {
    const result = await invoke(mockHttpClient({ [listKey]: [entity] }));
    expect(result).toEqual(entity);
  });

  it('accepts a bare object response', async () => {
    const result = await invoke(mockHttpClient(entity));
    expect(result).toEqual(entity);
  });

  it('accepts a bare array response', async () => {
    const result = await invoke(mockHttpClient([entity]));
    expect(result).toEqual(entity);
  });

  it('throws when the response contains no entity', async () => {
    await expect(invoke(mockHttpClient({ [listKey]: [] }))).rejects.toThrow();
  });
});
