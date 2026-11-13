# The System

A gamified daily work tracker. Clear quests, earn XP from a judge, level up overall and per parameter, and spend XP to claim boss targets before their deadlines.

Built with Next.js 16, React 19 and MongoDB (Mongoose). Each player brings their own AI API key, which stays in their browser.

## Status

| Phase | Scope | State |
|---|---|---|
| 1 | Foundation: project, theme, app shell, database helper | Done |
| 2 | Accounts: sign up, log in, log out, protected routes | Done |
| 3 | Onboarding: animated setup, eight character classes, AI engine, goals, profile | Done |
| 4 | Quest log: daily quests, side quests, quick notes, due times | Done |
| 5 | XP design: parameters from goals (AI or on-device), edit and regenerate | Done |
| 6 | Judge: scores each completed quest, reasons, overrides, XP ledger | Done |
| 7 | Levels and stats: overall and per-parameter levels, character sheet | Done |
| 8 | Boss targets: deadlines, linked quests, timeline, XP wallet, claims | Done |
| 9 | Urgency: colour shift, countdown banner, stagnation alert | Done |
| 10 | Polish: dashboard overview, empty states, mobile layout, this README | Done |

Each phase is a separate commit on `main`.

## Run it locally

Requires Node.js 20.9 or later and a MongoDB Atlas database (the free M0 tier is enough).

```bash
npm install
cp .env.example .env.local   # then fill in MONGODB_URI and AUTH_SECRET
npm run dev
```

Open http://localhost:3000.

### Set up MongoDB Atlas

1. Create a free cluster at cloud.mongodb.com.
2. Under Database Access, add a user with a password.
3. Under Network Access, allow your IP address (or `0.0.0.0/0` for testing from anywhere).
4. Click Connect, choose "Drivers", and copy the connection string.
5. Put it in `.env.local` as `MONGODB_URI`, replacing `<password>` with your user's password.

### Create the session secret

```bash
openssl rand -base64 32
```

Put the output in `.env.local` as `AUTH_SECRET`. It must be at least 16 characters.

## Environment variables

| Variable | Needed for | Purpose |
|---|---|---|
| `MONGODB_URI` | Everything that saves data | MongoDB Atlas connection string |
| `AUTH_SECRET` | Login | Signs session cookies |

AI API keys are not environment variables. Each player enters their own key during setup, or later on the profile page.

## How the game works

- **Setup.** Name, purpose, class, AI engine, and goals. The key you enter is saved in this browser's local storage only.
- **Quests.** Daily quests and side quests can have a due time. Quick notes are for thoughts and reminders and earn no XP.
- **XP design.** Parameters are built from your goals. With a key, the AI proposes them. Without one, an on-device keyword design is used. You can edit, add, remove, or regenerate them.
- **Judging.** Completing a quest scores it from 0 to 10 on each parameter, with a reason. The AI judges when a key is available for that request. Otherwise the on-device judge does, and says so. Every score can be overridden.
- **XP.** Each parameter's XP = score × weight × 2. Reopening a quest takes its XP back.
- **Levels.** Reaching level L needs 50 × (L−1) × L total XP: level 2 at 100, level 3 at 300, level 5 at 1000. Overall and per-parameter levels use the same curve.
- **Boss targets.** A target has an XP cost and a deadline. Claiming it spends XP from your wallet (total earned minus claimed costs). Levels still count all XP earned.
- **Urgency.** As the nearest open boss deadline approaches, the accent hue moves from blue through purple to red and motion speeds up. A countdown banner shows inside the warning window and when overdue.
- **Stagnation.** If boss targets are open and no XP has been earned for the set number of days, a stagnation alert appears in a dark red tint. It can be dismissed for 24 hours.

## AI providers

| Provider | Model used | Notes |
|---|---|---|
| Gemini | `gemini-2.5-flash` | Recommended to start |
| Claude | `claude-haiku-5-5` | Needs API credit |
| OpenAI | `gpt-4o-mini` | Needs billing set up |

Keys are sent with each request that uses them and are not stored on the server. If a provider call fails, the on-device design or judge is used and the reason is shown.

## Routes

Pages: `/signup`, `/login`, `/onboarding`, `/dashboard`, `/quests`, `/rubric` (XP design), `/stats`, `/targets`, `/profile`.

API: `/api/health`, `/api/auth/{signup,login,logout}`, `/api/player`, `/api/tasks`, `/api/tasks/:id`, `/api/tasks/:id/complete`, `/api/tasks/:id/judgement`, `/api/rubric`, `/api/rubric/design`, `/api/stats`, `/api/targets`, `/api/targets/:id`, `/api/alerts`, `/api/alerts/dismiss`.

## Deployment notes

- **Vercel.** Import the GitHub repo, add `MONGODB_URI` and `AUTH_SECRET` under Environment Variables, and deploy. Next.js needs no extra configuration.
- **Atlas.** For a deployed app, allow Vercel's connections under Network Access. The free tier does not have fixed IP addresses, so `0.0.0.0/0` is the simplest option; use a strong database password.
- **Cookies.** Session cookies are `httpOnly`, `sameSite=lax`, and `secure` in production. Serve the app over HTTPS.
- **Secrets.** Never commit `.env.local`. Rotate `AUTH_SECRET` if it leaks; this signs everyone out.

## Known limits

- The AI provider model names above should be checked against each provider's current model list before relying on them.
- There is no password reset or email verification yet.
- Alerts are computed when pages load. There are no push notifications.
- Deadlines are entered in the browser's local time and stored as UTC.
- The on-device judge and design are keyword-based. They are a fallback, not a substitute for the AI judge.

## Project layout

```
src/
  app/            pages, layouts and API route handlers
  components/     arcade UI, auth, onboarding, avatars, quests, rubric, targets, urgency
  lib/            auth, db models, player, tasks, AI providers, judge, rubric, levels, stats, targets, urgency
  theme/          design tokens: hue, fonts, motion timings
prototype/        approved front-end prototype (reference only)
```

## Theme

Every accent colour comes from one hue, `BASE_HUE` in `src/theme/tokens.js`, and urgency moves it between `URGENCY_HUES` and `STAGNATION_HUE`. Change them and the whole app recolours.
