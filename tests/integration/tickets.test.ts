/**
 * Tickets integration tests
 */

import { describe, it, expect } from 'vitest';
import { HaloPsaClient } from '../../src/client.js';

describe('TicketsResource', () => {
  const createClient = () =>
    new HaloPsaClient({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      tenant: 'testcompany',
    });

  describe('list', () => {
    it('should list tickets', async () => {
      const client = createClient();
      const response = await client.tickets.list();

      expect(response.record_count).toBe(75);
      expect(response.tickets).toHaveLength(2);
      expect(response.tickets[0]?.summary).toBe('Network connectivity issue');
    });

    it('should support pagination parameters', async () => {
      const client = createClient();
      const response = await client.tickets.list({ pageNo: 2, pageSize: 50 });

      expect(response.tickets).toHaveLength(1);
      expect(response.tickets[0]?.summary).toBe('Printer not working');
    });

    // Regression: a page_size-only call (no page_no) was sent as
    // pageinate=true&page_size=100 with no page_no -- HaloPSA silently
    // ignored page_size on that implicit first page and fell back to its
    // own default (50), leaving a hole between it and an explicit
    // page_no=2 request. Every list() call must send page_no explicitly.
    it('sends an explicit page_no so HaloPSA honors page_size on the first page', async () => {
      const { server } = await import('../mocks/server.js');
      const { http, HttpResponse } = await import('msw');
      let capturedParams: URLSearchParams | undefined;
      server.use(
        http.get('https://testcompany.halopsa.com/api/Tickets', ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ record_count: 385, tickets: [] });
        })
      );

      const client = createClient();
      await client.tickets.list({ pageSize: 100 });

      expect(capturedParams?.get('page_size')).toBe('100');
      expect(capturedParams?.get('page_no')).toBe('1');
      expect(capturedParams?.get('pageinate')).toBe('true');
    });

    // Regression: dateoccurred_start/dateoccurred_end are not real HaloPSA
    // query parameters -- sent literally, the API accepted and silently
    // ignored them with no filtering applied and no error. HaloPSA expects
    // datesearch=<field> plus startdate/enddate instead.
    it('translates dateoccurred_start/dateoccurred_end into datesearch+startdate+enddate', async () => {
      const { server } = await import('../mocks/server.js');
      const { http, HttpResponse } = await import('msw');
      let capturedParams: URLSearchParams | undefined;
      server.use(
        http.get('https://testcompany.halopsa.com/api/Tickets', ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ record_count: 0, tickets: [] });
        })
      );

      const client = createClient();
      await client.tickets.list({
        dateoccurred_start: '2025-08-01T00:00:00Z',
        dateoccurred_end: '2026-05-01T00:00:00Z',
      });

      expect(capturedParams?.get('datesearch')).toBe('dateoccured');
      expect(capturedParams?.get('startdate')).toBe('2025-08-01T00:00:00Z');
      expect(capturedParams?.get('enddate')).toBe('2026-05-01T00:00:00Z');
      expect(capturedParams?.has('dateoccurred_start')).toBe(false);
      expect(capturedParams?.has('dateoccurred_end')).toBe(false);
    });

    it('leaves other filters untouched when no date range is given', async () => {
      const { server } = await import('../mocks/server.js');
      const { http, HttpResponse } = await import('msw');
      let capturedParams: URLSearchParams | undefined;
      server.use(
        http.get('https://testcompany.halopsa.com/api/Tickets', ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ record_count: 0, tickets: [] });
        })
      );

      const client = createClient();
      await client.tickets.list({ client_id: 467 });

      expect(capturedParams?.get('client_id')).toBe('467');
      expect(capturedParams?.has('datesearch')).toBe(false);
    });
  });

  describe('listAll', () => {
    it('should iterate all tickets', async () => {
      const client = createClient();
      const tickets = await client.tickets.listAll().toArray();

      // First page has 2, second page has 1
      expect(tickets.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('get', () => {
    it('should get a single ticket', async () => {
      const client = createClient();
      const ticket = await client.tickets.get(1);

      expect(ticket.id).toBe(1);
      expect(ticket.summary).toBe('Network connectivity issue');
      expect(ticket.client_name).toBe('Acme Corp');
    });

    it('should throw for non-existent ticket', async () => {
      const client = createClient();

      await expect(client.tickets.get(999)).rejects.toThrow('Ticket 999 not found');
    });

    it('should handle bare ticket object response (real HaloPSA API shape)', async () => {
      const { server } = await import('../mocks/server.js');
      const { http, HttpResponse } = await import('msw');
      server.use(
        http.get('https://testcompany.halopsa.com/api/Tickets/42', () =>
          HttpResponse.json({
            id: 42,
            summary: 'Bare object',
            details: '',
            client_id: 1,
            tickettype_id: 1,
            status_id: 1,
            priority_id: 1,
            dateoccurred: '2026-05-01T00:00:00Z',
            datecreated: '2026-05-01T00:00:00Z',
          })
        )
      );

      const client = createClient();
      const ticket = await client.tickets.get(42);
      expect(ticket.id).toBe(42);
      expect(ticket.summary).toBe('Bare object');
    });
  });

  describe('create', () => {
    it('should create a ticket', async () => {
      const client = createClient();
      const ticket = await client.tickets.create({
        summary: 'New test ticket',
        details: 'Test ticket details',
        client_id: 1,
        tickettype_id: 1,
      });

      expect(ticket.id).toBe(100);
      expect(ticket.summary).toBe('New test ticket');
    });
  });

  describe('update', () => {
    it('should update a ticket', async () => {
      const client = createClient();
      const ticket = await client.tickets.update(1, {
        status_id: 2,
      });

      expect(ticket).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete a ticket', async () => {
      const client = createClient();

      await expect(client.tickets.delete(1)).resolves.not.toThrow();
    });
  });

  describe('actions', () => {
    it('should list ticket actions', async () => {
      const client = createClient();
      const response = await client.tickets.actions(1);

      expect(response.record_count).toBe(2);
      expect(response.actions).toHaveLength(2);
      expect(response.actions[0]?.note).toBe('Investigating the issue');
    });
  });

  describe('attachments', () => {
    it('should list ticket attachments', async () => {
      const client = createClient();
      const response = await client.tickets.attachments(1);

      expect(response.record_count).toBe(1);
      expect(response.attachments).toHaveLength(1);
      expect(response.attachments[0]?.filename).toBe('screenshot.png');
    });
  });
});
