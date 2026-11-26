import { expect, it, vi } from 'vitest';
import { StatusesResource } from '../../src/resources/reference.js';
import type { HttpClient } from '../../src/http.js';

it('requests the selected status page using Halo pagination', async () => {
  const request = vi.fn().mockResolvedValue({ statuses: [], record_count: 0 });
  const statuses = new StatusesResource({ request } as unknown as HttpClient);

  await statuses.list({ pageSize: 10, count: false });
  await statuses.list({ pageSize: 10, pageNo: 2 });
  await statuses.list();

  expect(request.mock.calls).toEqual([
    ['/Status', { params: { page_size: 10, page_no: 1, pageinate: true, count: false } }],
    ['/Status', { params: { page_size: 10, page_no: 2, pageinate: true } }],
    ['/Status', { params: undefined }],
  ]);
});
