# Documentation

This folder contains project documentation.

## Contents

- [routes.md](./routes.md) — TanStack Router file-based routing conventions for the frontend

## Architecture

```
Xenocognition-Simulator/
├── backend/          # SSR server entry, middleware, error handling
│   ├── server.ts     # Main Nitro/Cloudflare server handler
│   ├── start.ts      # TanStack Start instance with error middleware
│   └── lib/          # Server-only utilities
│       ├── error-capture.ts
│       ├── error-page.ts
│       └── lovable-error-reporting.ts (shared with frontend)
├── docs/             # Project documentation (you are here)
├── frontend/         # React/UI application
│   └── src/
│       ├── routes/   # TanStack Router file-based routes
│       ├── components/
│       │   ├── ui/   # shadcn/ui components
│       │   └── xeno/ # Xenocognition-specific components
│       ├── hooks/    # React hooks
│       ├── lib/      # Frontend utilities
│       └── styles.css
└── README.md
```
