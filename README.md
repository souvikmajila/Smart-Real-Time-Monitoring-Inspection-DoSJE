# Smart Real-Time Monitoring & Inspection — DoSJE

A working prototype for the SIH problem statement "Smart Real-Time Monitoring & Inspection Mobile App"
(Ministry of Social Justice and Empowerment). Built as a web app (React) + Node/Express + Socket.io
backend so it runs anywhere with Node installed — no external services or paid APIs required.

## What's implemented

| Required feature | Where it lives |
|---|---|
| Live CCTV feed integration | `CCTV Feeds` page — grid of live/offline camera tiles (swap in real RTSP/HLS URLs) |
| Random VC connectivity | `Video Call` page — Admin/PMU can trigger a surprise session with a randomly picked institute, broadcast live via WebSocket |
| Real-time monitoring dashboard | `Dashboard` page — live attendance pings + AI anomaly alerts streamed over Socket.io |
| Mobile-based inspection module | `Inspections` page — inspector's assigned list; works fine on a phone browser too |
| Random assignment of inspection duties | `Random Assignment` page — one click randomly pairs an institute with an inspector |
| Geo-tagged inspection reports + evidence | `Submit Report` page — captures browser GPS location, lets inspector upload photos/videos |
| AI-based anomaly & attendance analytics | `Analytics` page — live charts (Recharts) of attendance trend and anomaly types; a simple heuristic flags institutes when inspection compliance score < 40 |

Real-time "AI" bits (attendance pings, anomaly detection) are simulated server-side every ~6s so the
dashboard has live data to demo without needing real CCTV/IoT hardware wired in — the hooks are all in
`backend/server.js` (`simulateLiveData`) and are easy to replace with real camera/analytics pipelines.

## Project structure

```
sih-monitoring-app/
├── backend/           Node + Express + Socket.io API (JSON file DB via lowdb — zero setup)
│   ├── server.js
│   ├── seed.js        Demo institutes, users, CCTV feeds
│   └── package.json
└── frontend/          React + Vite + Tailwind SPA
    ├── src/
    └── package.json
```

## Running it in VS Code

You need **Node.js 18+** installed. Open two terminals in VS Code (`` Ctrl+` ``, then split).

**Terminal 1 — backend:**
```bash
cd backend
npm install
npm start
```
Runs on `http://localhost:4000`. On first run it creates `backend/db.json` from `seed.js` automatically.

**Terminal 2 — frontend:**
```bash
cd frontend
npm install
npm run dev
```
Opens on `http://localhost:5173`.

Then visit `http://localhost:5173` in your browser — the login page has demo-account buttons for
Admin, PMU, and two Inspector accounts (click to autofill credentials).

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin (DoSJE HQ) | admin@dosje.gov.in | admin123 |
| PMU Team | pmu1@dosje.gov.in | pmu123 |
| Inspector | inspector1@dosje.gov.in | insp123 |
| Inspector 2 | inspector2@dosje.gov.in | insp123 |

## Suggested demo flow for judges

1. Log in as **Admin** → show the live Dashboard (attendance pings + anomaly alerts streaming in).
2. Go to **Random Assignment** → click "Run Random Assignment" to show AI-based duty allocation.
3. Go to **Video Call** → trigger a random VC session (simulates surprise connectivity check).
4. Log out, log in as **Inspector 1** → open **Inspections**, submit a geo-tagged report with a photo
   and a low compliance score to trigger an anomaly flag.
5. Log back in as Admin → **Analytics** page updates live with the new data point and anomaly.

## Extending toward production

- Swap `backend/seed.js` mock camera URLs for real RTSP/HLS feeds from on-site CCTV (via a media server
  like MediaMTX or a cloud provider).
- Replace the simulated VC session with a real WebRTC/Jitsi/Twilio Video room.
- Swap lowdb (JSON file) for PostgreSQL/MongoDB for multi-user production use.
- Replace the compliance-score heuristic in `server.js` with a real ML anomaly-detection model.
- Add push notifications (FCM) for inspectors when a duty is randomly assigned.
