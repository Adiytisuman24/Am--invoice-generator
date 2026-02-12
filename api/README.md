# API README

This folder contains the serverless API handler used by the frontend.

Files

- `index.js` — ESM serverless handler that accepts JSON payloads with the shape `{ table, action, ... }` and performs `select|insert|update|delete` on whitelisted tables.
- `local-server.js` — small local HTTP server to run the handler for development.

Required environment variables

- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` — database connection credentials.

Local development

1. Copy `.env.example` to `.env` and fill credentials.
2. Start the local API:

```bash
npm run start-api
```

3. Run the test request:

```bash
npm run test-api
```

API usage

POST JSON to the API root (in Vercel this is `/api`) with payload examples:

- Select (single): `{ "table": "company_settings", "action": "select", "single": true }`
- Insert: `{ "table": "quotations", "action": "insert", "data": { ... } }`

Responses follow the shape: `{ data: ..., error: null }` or `{ data: null, error: "..." }`.

Vercel notes

- `vercel.json` routes `/api/*` to `api/index.js` as a Node function.
- Set DB env vars in your Vercel dashboard before deploying.
