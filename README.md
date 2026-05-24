# ApplyFlow AI Frontend

ApplyFlow AI is a job application management platform with AI-driven tools for outreach, ATS analysis, and pipeline tracking. This repository contains the Next.js frontend for the dashboard, automation workflows, and analytics views.

## Highlights

- Dashboard with analytics, charts, and recent activity
- AI email generator with Gmail-style compose UI
- Applications tracker with status updates
- Companies, resumes, ATS analyzer, and settings pages
- Modern UI with Tailwind CSS, Recharts, and Framer Motion

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Recharts
- Framer Motion
- Zustand

## Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000

## Environment Variables

Create a `.env.local` file in the project root. Example:

```bash
NEXT_PUBLIC_API_BASE_URL="https://api.yourdomain.com"
```

If your backend uses additional keys, add them here. Do not commit `.env.local`.

## Scripts

- `npm run dev` - Start the dev server
- `npm run build` - Build for production
- `npm run start` - Run the production build
- `npm run lint` - Run lint

## Deployment

Deploy on Vercel:

1. Import the GitHub repo
2. Set the environment variables from `.env.local`
3. Deploy

## Project Structure

```text
src/
  app/                 # App Router pages and layouts
  components/          # UI and layout components
  services/            # API clients
  store/               # Zustand state
  lib/                 # Utilities
```

## License

MIT
