/**
 * Appointments integration tests
 */

import { describe, it, expect } from 'vitest';
import { HaloPsaClient } from '../../src/client.js';

describe('AppointmentsResource', () => {
  const createClient = () =>
    new HaloPsaClient({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      tenant: 'testcompany',
    });

  describe('list', () => {
    it('should list appointments', async () => {
      const { server } = await import('../mocks/server.js');
      const { http, HttpResponse } = await import('msw');
      server.use(
        http.get('https://testcompany.halopsa.com/api/Appointment', () =>
          HttpResponse.json({
            record_count: 1,
            appointments: [
              {
                id: 1,
                subject: 'Site visit',
                startdate: '2026-02-01T10:00:00Z',
                enddate: '2026-02-01T11:00:00Z',
                allday: false,
              },
            ],
          })
        )
      );

      const client = createClient();
      const response = await client.appointments.list();

      expect(response.record_count).toBe(1);
      expect(response.appointments[0]?.subject).toBe('Site visit');
    });

    // Regression: startdate_start/startdate_end are not real HaloPSA query
    // parameters -- sent literally, the API accepted and silently ignored
    // them with no filtering applied and no error. HaloPSA expects
    // start_date/end_date instead (confirmed against the live
    // /api/swagger/v2/swagger.json spec) -- unlike Tickets, no datesearch
    // selector is involved at all.
    it('translates startdate_start/startdate_end into start_date/end_date', async () => {
      const { server } = await import('../mocks/server.js');
      const { http, HttpResponse } = await import('msw');
      let capturedParams: URLSearchParams | undefined;
      server.use(
        http.get('https://testcompany.halopsa.com/api/Appointment', ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ record_count: 0, appointments: [] });
        })
      );

      const client = createClient();
      await client.appointments.list({
        startdate_start: '2025-08-01T00:00:00Z',
        startdate_end: '2026-05-01T00:00:00Z',
      });

      expect(capturedParams?.get('start_date')).toBe('2025-08-01T00:00:00Z');
      expect(capturedParams?.get('end_date')).toBe('2026-05-01T00:00:00Z');
      expect(capturedParams?.has('startdate_start')).toBe(false);
      expect(capturedParams?.has('startdate_end')).toBe(false);
      expect(capturedParams?.has('datesearch')).toBe(false);
    });

    it('leaves other filters untouched when no date range is given', async () => {
      const { server } = await import('../mocks/server.js');
      const { http, HttpResponse } = await import('msw');
      let capturedParams: URLSearchParams | undefined;
      server.use(
        http.get('https://testcompany.halopsa.com/api/Appointment', ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ record_count: 0, appointments: [] });
        })
      );

      const client = createClient();
      await client.appointments.list({ client_id: 467 });

      expect(capturedParams?.get('client_id')).toBe('467');
      expect(capturedParams?.has('start_date')).toBe(false);
      expect(capturedParams?.has('end_date')).toBe(false);
    });

    // Same shared-helper fix as Tickets: page_size alone (no page_no) was
    // silently ignored by HaloPSA on the implicit first page.
    it('sends an explicit page_no so HaloPSA honors page_size on the first page', async () => {
      const { server } = await import('../mocks/server.js');
      const { http, HttpResponse } = await import('msw');
      let capturedParams: URLSearchParams | undefined;
      server.use(
        http.get('https://testcompany.halopsa.com/api/Appointment', ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ record_count: 0, appointments: [] });
        })
      );

      const client = createClient();
      await client.appointments.list({ pageSize: 100 });

      expect(capturedParams?.get('page_size')).toBe('100');
      expect(capturedParams?.get('page_no')).toBe('1');
    });
  });

  describe('get', () => {
    it('should get a single appointment', async () => {
      const { server } = await import('../mocks/server.js');
      const { http, HttpResponse } = await import('msw');
      server.use(
        http.get('https://testcompany.halopsa.com/api/Appointment/1', () =>
          HttpResponse.json({
            id: 1,
            subject: 'Site visit',
            startdate: '2026-02-01T10:00:00Z',
            enddate: '2026-02-01T11:00:00Z',
            allday: false,
          })
        )
      );

      const client = createClient();
      const appointment = await client.appointments.get(1);

      expect(appointment.id).toBe(1);
      expect(appointment.subject).toBe('Site visit');
    });
  });
});
