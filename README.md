# ApplyFlow Frontend

Summary
-------

Lightweight Next.js (App Router) frontend for ApplyFlow — focused on authentication, dashboard, and AI-assist features. This README is written without decorative icons and uses a plain console-like presentation for quick developer onboarding.

Quick Start
-----------

1. Install dependencies

```bash
npm install
```

2. Local development

```bash
npm run dev
# open http://localhost:3000
```

3. Build for production

```bash
npm run build
npm run start
```

Environment variables
---------------------

Required (set in your environment or Vercel project):

- `NEXT_PUBLIC_API_BASE_URL` — API base URL used by the frontend
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth client id

Optional:

- `NEXT_PUBLIC_API_URL` — legacy fallback for API base URL

Notes on secrets
----------------

Do not commit `.env` files or credentials. This repository now ignores `.env*`, `*.pem`, and other sensitive artifacts via `.gitignore`.

Repository layout (high level)
-----------------------------

- `src/app` — Next.js App Router pages and layouts
- `src/components` — UI components
- `src/lib` — `api.ts` axios client and helpers
- `src/store` — Zustand stores (auth)
- `src/services` — API service wrappers

Common tasks
------------

- Lint:

```bash
npm run lint
```

- Test (if present):

```bash
npm test
```

Deployment notes
----------------

This project is typically deployed to Vercel. Make sure the required environment variables are configured in the Vercel dashboard and that your Google OAuth client includes the production domain in Authorized JavaScript origins.

Security guidance
-----------------

- Do not store refresh tokens in client-side accessible storage. Prefer HttpOnly cookies set by the backend for production.
- Avoid writing credentials into JavaScript-accessible cookies. The repo now avoids client-side cookie writes for auth tokens.

Troubleshooting
---------------

- If Google sign-in fails in production but works locally, check:
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` value in Vercel
  - Google Cloud Console Authorized Origins
  - CSP or iframe restrictions introduced by the hosting environment

Contact
-------

For repository-level questions, open an issue or reach out to the maintainer.
