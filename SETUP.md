# GrowWell Marketing — Setup Guide

## Step 1: Install Node.js
Go to https://nodejs.org and download the **LTS** version. Install it.

## Step 2: Install dependencies
Open Terminal, navigate to this folder, and run:
```
cd /Users/taylormartin/growwell-app
npm install
```

## Step 3: Run the app locally
```
npm run dev
```
Then open http://localhost:3000 in your browser.

---

## Step 4: Connect Supabase (for live database)
1. Go to https://supabase.com and create a free project
2. In your Supabase project → SQL Editor → paste the contents of `supabase_schema.sql` and run it
3. Copy `.env.local.example` to `.env.local`
4. Fill in your Supabase URL and Anon Key (found in Supabase → Settings → API)
5. Restart the dev server: `npm run dev`

## Step 5: Deploy to production
The easiest way is Vercel:
1. Go to https://vercel.com and connect your GitHub account
2. Push this folder to a GitHub repo
3. Import it in Vercel — it auto-detects Next.js
4. Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel → Environment Variables
5. Deploy — your team will get a live URL

---

## What's built so far
- **Dashboard** — MRR, active clients, deadline alerts, team workload
- **CRM** — Pipeline view + list view, client profiles, package tracking
- **Project Tracker** — Deadlines, status pipeline, team assignments, checklists
- **Scripts** — Content script writer with platform-specific tips
- **Team** — Member profiles, workload view, role-based (videographer/editor/salesman)
- **Schedule** — Placeholder (Phase 2)

## Phase 2 (next build)
- Social media scheduler (Instagram, Facebook, TikTok API)
- File upload hub (client assets, footage, deliverables)
- Authentication (login for each team member)
- Notifications (deadline alerts, approval requests)
