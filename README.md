# DocShelf frontend

DocShelf's member-facing web application, built with Ionic Angular, standalone
components, TanStack Query, signals, and Tailwind CSS. The app is backed by the
DocShelf API; no mock data or simulated persistence remains.

## Architecture

```text
src/app/
├── app.config.ts                 # providers and QueryClient defaults
├── app.routes.ts                 # lazy route composition
├── shell/                        # authenticated application shell
├── features/
│   └── <feature>/
│       ├── components/           # routed and feature-owned UI
│       ├── api.ts                # HttpClient request boundary
│       ├── queries.ts            # query keys and reusable options
│       ├── types.ts              # feature-owned contracts
│       └── utils.ts              # feature-only transformations
└── shared/                       # cross-feature response/error utilities
```

TanStack Query owns API-backed state. Signals are reserved for client-owned
filters, forms, dialogs, selections, and derived presentation state.

## Local development

Run the API on port `7000`, then:

```bash
npm ci
npm start
```

Development builds call `http://127.0.0.1:7000/api` directly. The proxy in
`proxy.conf.json` points to the same backend for relative `/api` requests. Open
`http://localhost:4200`.

## Authentication and file access

- The access token is stored under `docshelf:access-token`.
- The HTTP interceptor sends it as `x-access-token`.
- Protected routes restore the current member with `GET /api/auth/me`.
- Submitting the document form first stages its bytes with `POST /api/files`,
  then sends the returned temporary URL and metadata to `POST /api/documents`.
  The API promotes the staged file to S3 and stores the permanent URL.
- Document bytes are never read from a stored public URL. The frontend requests
  `/api/documents/:id/access-url`, caches the returned presigned URL, and refreshes
  it five minutes before its two-hour expiry.
- Version downloads use the same endpoint with a `versionId`.

## Validation

```bash
npm run typecheck
npm run build
```

## Capacitor

```bash
npm run build
npm run cap:sync
```

Use `npm run cap:add:android` or `npm run cap:add:ios` once for a new native
workspace.
