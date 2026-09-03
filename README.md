# Basera CRM — Frontend (POC)

React + Redux Toolkit frontend for the AI Calling & CRM Lead Automation POC described in
`Detailed_AI_Calling_CRM_POC_SOW.docx`. Built with plain JSX (not TypeScript) per request, running
entirely on **dummy data** so it can be reviewed and clicked through before the Django/DRF backend
and Exotel/ElevenLabs/WhatsApp integrations are live.

## Stack

- React 18 + Vite
- Redux Toolkit + React Redux (state)
- React Router (routing)
- Tailwind CSS (styling)
- lucide-react (icons)

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. `npm run build` produces a static production build in `dist/`.

## Structure

```
src/
├── data/dummyData.js      # all mock leads, calls, follow-ups, WhatsApp messages
├── store/                 # Redux Toolkit slices (leads, calls, followups, whatsapp, ui) + store.js
├── components/
│   ├── layout/             # Sidebar, Topbar, AppLayout
│   ├── ui/                 # StatusBadge and other shared primitives
│   └── dashboard/          # KpiCard, CallVolumeChart
├── pages/
│   ├── Dashboard.jsx
│   ├── leads/               # LeadsList, LeadDetail, NewLead
│   ├── calls/                # CallsList, CallDetail
│   ├── Followups.jsx
│   ├── WhatsAppPage.jsx
│   └── Settings.jsx
└── utils/format.js         # currency, date and duration formatting helpers
```

## Pages implemented

- **Dashboard** — KPIs, 7-day call volume, pending follow-ups, recent calls, agent workload.
- **Leads** — search/filter list, detail view (status, agent assignment, call history, WhatsApp
  activity, follow-ups), manual "new lead" form.
- **Calls** — list with recording/status, detail view with full transcript and structured AI
  summary (requirement, budget, location, interest level, key points, suggested action).
- **Follow-ups** — due list with complete / snooze actions.
- **WhatsApp** — message history with delivery status, filterable, resend on failure.
- **Settings** — workspace/provider info, agent roster, AI qualification flow steps.

## Swapping in the real API

All server interaction currently happens against `src/data/dummyData.js`, shaped to mirror the
planned REST endpoints (`/api/v1/leads/`, `/api/v1/calls/`, `/api/v1/followups/`,
`/api/v1/whatsapp/`, `/api/v1/dashboard/summary/`). To connect the real backend:

1. Replace the static imports in each slice's `initialState` with `createAsyncThunk` calls against
   the API client.
2. Add a `src/lib/api.js` HTTP client (fetch/axios) with base URL from an env var and auth header
   handling.
3. Keep the slice action names and selectors the same — components only depend on those, not on
   where the data comes from.

## Note on scope

This mirrors the POC's core workflow (incoming call → AI conversation → lead → summary → WhatsApp
follow-up → human handover) as a reviewable frontend. Property inventory, buyer/seller management,
and payment tracking are out of scope, matching the SOW.
