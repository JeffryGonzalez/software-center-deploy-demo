# The Application

The Software Center is a two-tier application: an Express API backed by SQLite, and an Angular frontend. A .NET BFF (Backend for Frontend) sits in front of both and is the single entry point — in development, in Docker Compose, and in Kubernetes.

```
Browser
  └── BFF (YARP reverse proxy)
        ├── /api/**  →  Express API  (SQLite)
        └── /**      →  Angular frontend
```

## Prerequisites

All required tools are pre-installed on your workshop VM:

- Node.js 22
- .NET 10 SDK
- Angular CLI (`ng`)
- Docker

## Running the App Locally

There are two ways to run during development. Both are valid; they're useful in different situations.

### Mode 1 — Direct (three separate processes)

The simplest way to get started. Each piece runs independently.

```bash
# Terminal 1 — API (with hot reload)
cd api
npm install
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
ng serve
```

Open http://localhost:4200.

In this mode, Angular's dev server uses `proxy.conf.json` to forward `/api/**` requests to the Express API at port 3000. You're not running the BFF at all — Angular's built-in proxy fills that role during development.

This is good for: working on the Angular app or the API in isolation, fast iteration when you don't need the full stack.

### Mode 2 — Through the BFF (three terminals, one entry point)

Runs all three pieces with the BFF as the single entry point at port 1337, which is how the app works in production.

```bash
# Terminal 1 — API
cd api && npm run dev

# Terminal 2 — Frontend (plain ng serve, no proxy needed)
cd frontend && ng serve

# Terminal 3 — BFF
cd bff && dotnet run
```

Open http://localhost:1337.

In this mode, `ng serve` still runs on port 4200, but you never visit it directly. YARP in the BFF receives all traffic at 1337 and routes:
- `/api/**` → Express API at port 3000
- `/**` → Angular dev server at port 4200

The `proxy.conf.json` in the Angular project is inactive in this mode — it only fires for requests that arrive directly at port 4200, which none do.

This is good for: testing the full request path, demoing the BFF routing, or catching issues that only appear when everything is wired together.

### Mode 3 — Docker Compose (everything containerized)

Build and run all three services as containers:

```bash
docker compose up --build
```

Open http://localhost:1337.

This is the closest to production. See the [Containers guide](./20-containers.md) for more on how the images are built.

## Project Structure

```
software-center/
├── api/          Express API (Node.js + SQLite)
├── bff/          Backend for Frontend (.NET 10 + YARP)
├── frontend/     Angular 21 app
├── k8s/          Kubernetes manifests
└── guide/        This workshop guide
```

### API (`/api`)

Express 4 with SQLite via Node's built-in `node:sqlite` module (no ORM, no extra driver). Auto-seeds the database on first start.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Readiness check |
| GET | `/api/vendors` | List all vendors |
| POST | `/api/vendors` | Create a vendor |
| GET | `/api/vendors/:id/items` | List items for a vendor |
| POST | `/api/vendors/:id/items` | Add an item to a vendor |
| GET | `/api/catalog` | Flattened catalog (vendor + items joined) |

### BFF (`/bff`)

A .NET 10 minimal API with [YARP](https://microsoft.github.io/reverse-proxy/) (Yet Another Reverse Proxy). The entire application is `Program.cs` — 10 lines. All routing configuration is in `appsettings.json`, with the development destinations overridden in `appsettings.Development.json`.

The `launchSettings.json` sets the dev port to 1337, so `dotnet run` always starts on the right port without any flags.

### Frontend (`/frontend`)

Angular 21 with NgRx Signals for state management, Tailwind CSS + DaisyUI for styling, and MSW (Mock Service Worker) for API mocking in development. MSW is disabled in production builds.
