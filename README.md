# node-halopsa

Comprehensive, fully-typed Node.js/TypeScript library for the HaloPSA API.

## Features

- **Complete API coverage** - All documented HaloPSA endpoints are implemented
- **Full TypeScript support** - Complete type definitions for all requests, responses, and entities
- **OAuth 2.0 Client Credentials** - Automatic token acquisition, caching, and refresh
- **Multi-tenant support** - Handle company-specific subdomains
- **Automatic pagination** - Iterator patterns for seamless multi-page retrieval
- **Rate limit handling** - Built-in request throttling (500 req/3min) with HTTP 429 backoff
- **Zero live API testing** - Full test suite with mocked HTTP responses

## Installation

```bash
npm install node-halopsa
```

## Quick Start

```typescript
import { HaloPsaClient } from 'node-halopsa';

const client = new HaloPsaClient({
  clientId: process.env.HALOPSA_CLIENT_ID!,
  clientSecret: process.env.HALOPSA_CLIENT_SECRET!,
  tenant: 'yourcompany', // Results in https://yourcompany.halopsa.com
});

// List open tickets
const tickets = await client.tickets.list({ open_only: true });

// Get a specific ticket
const ticket = await client.tickets.get(123);

// Create a new ticket
const newTicket = await client.tickets.create({
  summary: 'Network connectivity issue',
  details: 'User cannot access shared drives',
  client_id: 1,
  tickettype_id: 1,
});
```

## Configuration

```typescript
const client = new HaloPsaClient({
  // Required
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',

  tenant: 'yourcompany',                        // Uses https://yourcompany.halopsa.com
  // For a custom domain, replace the tenant line with the instance URL:
  // baseUrl: 'https://helpdesk.example.com',

  // Optional
  tenantId: 'specific-tenant-id',              // For multi-tenant applications
  scope: 'all',                                 // OAuth scope (default: 'all')

  // Rate limiting (optional)
  rateLimit: {
    enabled: true,                              // default: true
    maxRequests: 500,                           // default: 500
    windowMs: 180000,                           // default: 180000 (3 minutes)
    throttleThreshold: 0.8,                     // default: 0.8 (80%)
    retryAfterMs: 5000,                         // default: 5000
    maxRetries: 3,                              // default: 3
  },
});
```

Use the instance URL for `baseUrl`. The SDK appends `/api` for resource requests and `/auth/token` for authentication. If both options are supplied, `baseUrl` takes precedence.

## Resources

### Tickets

```typescript
// List tickets with filtering
const tickets = await client.tickets.list({
  client_id: 123,
  status_id: 1,
  open_only: true,
  pageSize: 50,
});

// Auto-paginate all tickets
for await (const ticket of client.tickets.listAll()) {
  console.log(ticket.summary);
}

// Collect all into array
const allTickets = await client.tickets.listAll().toArray();

// Get, create, update, delete
const ticket = await client.tickets.get(1);
const newTicket = await client.tickets.create({ ... });
await client.tickets.update(1, { status_id: 2 });
await client.tickets.delete(1);

// Ticket actions
const actions = await client.tickets.actions(1);
await client.tickets.addAction(1, { note: 'Working on it', timetaken: 15 });

// Attachments
const attachments = await client.tickets.attachments(1);
await client.tickets.addAttachment(1, { filename: 'log.txt', data: '...' });
```

### Clients (Companies)

```typescript
const clients = await client.clients.list();
const acme = await client.clients.get(1);
const newClient = await client.clients.create({ name: 'New Corp' });
await client.clients.update(1, { notes: 'Updated' });
await client.clients.delete(1);
```

### Sites

```typescript
const sites = await client.sites.list({ client_id: 1 });
const site = await client.sites.get(1);
const newSite = await client.sites.create({
  name: 'Headquarters',
  client_id: 1,
  addressline1: '123 Main St',
});
```

### Assets (Configuration Items)

```typescript
const assets = await client.assets.list({ client_id: 1 });
const asset = await client.assets.get(1);
const newAsset = await client.assets.create({
  assettype_id: 1,
  client_id: 1,
  key_field: 'LAPTOP-001',
});

// Asset types
const types = await client.assetTypes.list();
const laptopType = await client.assetTypes.get(1);
```

### Contacts (Users)

```typescript
const contacts = await client.contacts.list({ client_id: 1 });
const contact = await client.contacts.get(1);
const newContact = await client.contacts.create({
  name: 'John Smith',
  emailaddress: 'john@example.com',
  client_id: 1,
});
```

### Items (Products/Services)

```typescript
const items = await client.items.list();
const item = await client.items.get(1);
const newItem = await client.items.create({
  name: 'Hourly Support',
  type: 'service',
  unitprice: 150,
});
```

### Contracts

```typescript
const contracts = await client.contracts.list({ client_id: 1 });
const contract = await client.contracts.get(1);
```

### Invoices

```typescript
const invoices = await client.invoices.list();
const invoice = await client.invoices.get(1);
const newInvoice = await client.invoices.create({
  client_id: 1,
  invoicedate: '2026-02-01',
  lines: [{ item_id: 1, quantity: 2, unitprice: 100 }],
});
await client.invoices.send(1);
```

### Quotes

```typescript
const quotes = await client.quotes.list();
const quote = await client.quotes.get(1);
await client.quotes.send(1);
const invoiceResult = await client.quotes.convertToInvoice(1);
```

### Projects

```typescript
const projects = await client.projects.list({ client_id: 1 });
const project = await client.projects.get(1);
const tasks = await client.projects.tasks(1);
```

### Agents (Technicians)

```typescript
const agents = await client.agents.list();
const agent = await client.agents.get(1);
const me = await client.agents.me(); // Current authenticated agent
```

### Reference Data

```typescript
// Ticket types
const ticketTypes = await client.ticketTypes.list();
const incidentType = await client.ticketTypes.get(1);

// Statuses
const statuses = await client.statuses.list();
const newStatus = await client.statuses.get(1);

// Priorities
const priorities = await client.priorities.list();

// Categories
const categories = await client.categories.list();

// SLAs
const slas = await client.slas.list();

// Custom fields
const customFields = await client.customFields.list();

// User roles
const roles = await client.userRoles.list();
```

### Knowledge Base

```typescript
const articles = await client.knowledgeBase.list();
const article = await client.knowledgeBase.get(1);
await client.knowledgeBase.create({
  title: 'How to Reset Password',
  content: 'Step by step guide...',
});
```

### Reports

```typescript
const reports = await client.reports.list();
const report = await client.reports.get(1);
const result = await client.reports.run(1, { startDate: '2026-01-01' });
```

## Error Handling

```typescript
import {
  HaloPsaError,
  HaloPsaAuthenticationError,
  HaloPsaForbiddenError,
  HaloPsaNotFoundError,
  HaloPsaValidationError,
  HaloPsaRateLimitError,
  HaloPsaServerError,
} from 'node-halopsa';

try {
  await client.tickets.get(999);
} catch (error) {
  if (error instanceof HaloPsaNotFoundError) {
    console.log('Ticket not found');
  } else if (error instanceof HaloPsaAuthenticationError) {
    console.log('Authentication failed');
  } else if (error instanceof HaloPsaForbiddenError) {
    console.log('Access denied');
  } else if (error instanceof HaloPsaValidationError) {
    console.log('Validation errors:', error.errors);
  } else if (error instanceof HaloPsaRateLimitError) {
    console.log('Rate limited, retry after:', error.retryAfter);
  } else if (error instanceof HaloPsaServerError) {
    console.log('Server error:', error.statusCode);
  }
}
```

## Rate Limiting

The library automatically handles HaloPSA's rate limit (500 requests per 3-minute rolling window):

- Proactive throttling starts at 80% (400 requests)
- Automatic retry with exponential backoff on HTTP 429
- Respects `Retry-After` header when present

You can monitor the current rate limit status:

```typescript
const status = client.getRateLimitStatus();
console.log(`Remaining: ${status.remaining}, Rate: ${status.rate}`);
```

## TypeScript

All types are fully exported:

```typescript
import type {
  Ticket,
  TicketCreateData,
  TicketListParams,
  Client,
  Site,
  Asset,
  Contact,
  // ... and many more
} from 'node-halopsa';
```

## Requirements

- Node.js >= 18.0.0

## License

Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
