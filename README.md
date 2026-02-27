# Geo-Sync

Realtime map collaboration app where one user (Tracker) shares live map movement and other users (Tracked) follow in the same room.

## Tech Stack

- Frontend: React + Vite + React Leaflet + Socket.IO Client
- Backend: Node.js + Express + Socket.IO
- Deployment: Vercel (client) + Render (server)

## Features

- Room-based map sync using Socket.IO
- Role-based behavior:
	- `tracker`: broadcasts map position
	- `tracked`: receives and follows tracker position
- One-tracker-per-room protection
- Tracker disconnect handling (`Tracker Left` state)
- Throttled + precision-controlled coordinate updates for smoother sync

## Project Structure

```text
Geo-Sync/
	client/   # React app (Vite)
	server/   # Express + Socket.IO server
```

## Local Setup

### 1) Prerequisites

- Node.js 18+
- npm

### 2) Install dependencies

From project root:

```bash
cd server
npm install

cd ../client
npm install
```

### 3) Environment variables

Create `client/.env`:

```env
VITE_SOCKET_URL=http://localhost:5000
VITE_MAP_PROVIDER=leaflet
```

### 4) Run locally

Start server (Terminal 1):

```bash
cd server
npm run dev
```

Start client (Terminal 2):

```bash
cd client
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

## How It Works

1. User enters `roomId` + role (`tracker` or `tracked`).
2. Client emits `join_session`.
3. Server accepts join and emits `join_accepted`.
4. Tracker emits `map_move` updates.
5. Server relays updates as `sync_map` to others in same room.
6. Tracked client sets map view from incoming data.

### Important socket events

- `join_session`
- `join_accepted`
- `tracker_taken`
- `map_move`
- `sync_map`
- `tracker_disconnected`
- `connection_status`

## Deploy Backend on Render

Create a new **Web Service** from this repo with:

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `node src/server.js`
- Environment: Node

After deploy, copy your Render backend URL (example: `https://your-api.onrender.com`).

## Deploy Frontend on Vercel

Create a new project from this repo with:

- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`

Add environment variables in Vercel Project Settings:

```env
VITE_SOCKET_URL=https://geo-sync.onrender.com
VITE_MAP_PROVIDER=leaflet
```

Redeploy after adding variables.

## Production Notes

- Current server CORS is open (`origin: "*"`). For production, restrict to your Vercel domain.
- Render free tier can sleep; first socket connection may be slow after inactivity.

## Scripts

### Client

- `npm run dev` - start Vite dev server
- `npm run build` - build production frontend
- `npm run preview` - preview build locally

### Server

- `npm run dev` - start server with nodemon

## Live URLs

Add your deployed URLs here:

- Frontend (Vercel): `https://geo-sync-gray.vercel.app/`
- Backend (Render): `https://geo-sync.onrender.com`

