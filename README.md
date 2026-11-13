# The System

A gamified daily work tracker. Clear quests, earn XP from an LLM judge, and spend it on the life targets you care about.

## Status

Front-end prototype only. There is no backend, no login and no real LLM call yet. The judge and the boss-target planner are simulated in the browser so the look and flow can be reviewed.

## Run the prototype

```bash
npx serve prototype
```

Then open the address it prints (usually http://localhost:3000). You can also open `prototype/index.html` directly in a browser.

## What the prototype shows

- Onboarding: player name, purpose, avatar, API key step, XP rules
- Dashboard: today's quests, side quests, quick notes, boss targets with a timeline
- Urgency theme: dark blue by default, shifting through purple to red as a due time approaches
- Stagnation alert: orange-red tint when no XP has gone toward a boss target for a while
- Prototype controls: sliders to preview the urgency and stagnation states

## Planned stack

Next.js and MongoDB, with each player bringing their own LLM API key.
