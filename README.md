# The System

A gamified daily work tracker. Clear quests, earn XP from an AI judge, and spend it on the life targets you care about.

Built with Next.js and MongoDB. Each player brings their own LLM API key.

## Status

| Phase | Scope | State |
|---|---|---|
| 1 | Foundation: project, theme, app shell, database helper | Done |
| 2 | Accounts: sign up, log in, log out, protected routes | Done |
| 3 | Onboarding | Planned |
| 4–10 | Quests, XP, judge, levels, boss targets, urgency, polish | Planned |

## Run it locally

Requires Node.js 20.9 or later.

```bash
npm install
cp .env.example .env.local   # fill in values when a phase needs them
npm run dev
```

Open http://localhost:3000.

- `/` sends you to the dashboard, or to login if you are logged out.
- `/signup` creates an account; `/login` signs in; `/dashboard` is protected.
- `/api/health` returns the app and database status as JSON.

## Environment variables

See `.env.example`. Values go in `.env.local`, which git ignores.

| Variable | Needed from | Purpose |
|---|---|---|
| `MONGODB_URI` | Phase 2 | MongoDB Atlas connection string |
| `AUTH_SECRET` | Phase 2 | Signs login sessions |

## Project layout

```
src/
  app/            routes and API handlers
  components/     arcade UI components
  theme/          design tokens: hue, fonts, motion timings
  lib/db/         MongoDB connection
prototype/        approved front-end prototype (reference only)
```

## Theme

Every accent colour comes from one hue, `BASE_HUE` in `src/theme/tokens.js`. Change it and the whole app recolours. Motion timings live in the same file.
