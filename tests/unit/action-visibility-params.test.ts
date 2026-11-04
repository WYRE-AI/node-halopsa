/**
 * WYREAI-502: GET /Actions visibility filters must reach HaloPSA verbatim so
 * callers can explicitly request private (hiddenfromuser) notes.
 */
import { describe, it, expect, vi } from 'vitest';
import type { HttpClient } from '../../src/http.js';
import { ActionsResource } from '../../src/resources/actions.js';
import { TicketsResource } from '../../src/resources/tickets.js';

const mockHttpClient = () =>
  ({ request: vi.fn().mockResolvedValue({ record_count: 0, actions: [] }) }) as unknown as HttpClient & {
    request: ReturnType<typeof vi.fn>;
  };

describe('ActionListParams visibility filters', () => {
  it('passes excludeprivate=false and other filters through unchanged', async () => {
    const hc = mockHttpClient();
    await new ActionsResource(hc).list({
      ticket_id: 7,
      excludeprivate: false,
      excludesys: true,
      excludehiddenfrominternalit: false,
      agentonly: false,
      conversationonly: false,
      includehtmlnote: true,
    });
    expect(hc.request).toHaveBeenCalledWith('/Actions', {
      params: {
        ticket_id: 7,
        excludeprivate: false,
        excludesys: true,
        excludehiddenfrominternalit: false,
        agentonly: false,
        conversationonly: false,
        includehtmlnote: true,
      },
    });
  });

  it('passes excludeprivate=true to request only public actions', async () => {
    const hc = mockHttpClient();
    await new ActionsResource(hc).list({ ticket_id: 7, excludeprivate: true });
    expect(hc.request.mock.calls[0][1].params).toEqual({ ticket_id: 7, excludeprivate: true });
  });

  it('omits unset filters', async () => {
    const hc = mockHttpClient();
    await new ActionsResource(hc).list({ ticket_id: 7 });
    expect(hc.request.mock.calls[0][1].params).toEqual({ ticket_id: 7 });
  });

  it('keeps visibility filters alongside pagination', async () => {
    const hc = mockHttpClient();
    await new ActionsResource(hc).list({ ticket_id: 7, excludeprivate: false, pageSize: 10 });
    expect(hc.request.mock.calls[0][1].params).toMatchObject({
      ticket_id: 7,
      excludeprivate: false,
      page_size: 10,
      page_no: 1,
      pageinate: true,
    });
  });
});

describe('TicketsResource ActionListParams', () => {
  it('passes visibility filters through tickets.actions()', async () => {
    const hc = mockHttpClient();
    await new TicketsResource(hc).actions(7, { excludeprivate: false, excludesys: true });
    expect(hc.request.mock.calls[0][1].params).toEqual({ excludeprivate: false, excludesys: true });
  });
});
