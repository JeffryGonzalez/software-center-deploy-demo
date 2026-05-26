# Infrastructure

## Backend for Frontend (BFF)

A Backend for Frontend is a server-side component that sits between the browser and your backend services. Rather than having the browser make requests directly to multiple APIs, it makes requests to one place — the BFF — which handles routing, aggregation, and (when needed) auth concerns.

For this workshop, our BFF is a .NET 10 minimal API using **YARP** (Yet Another Reverse Proxy), a Microsoft library that makes it straightforward to build a reverse proxy with a simple JSON configuration.

### Why a BFF here?

A few practical reasons:

- **Single origin** — the browser only ever talks to one host. No CORS configuration anywhere.
- **Routing seam** — `/api/**` goes one place, everything else goes another. This is a common real-world pattern worth seeing.
- **Future extensibility** — if you needed to add auth, token management, or request transformation, the BFF is the natural place. The seam already exists.

### How YARP is configured

YARP is configured in `appsettings.json` with two concepts: **routes** (URL matching rules) and **clusters** (upstream destinations).

```json
"ReverseProxy": {
  "Routes": {
    "api": {
      "ClusterId": "api",
      "Order": 1,
      "Match": { "Path": "/api/{**catch-all}" }
    },
    "frontend": {
      "ClusterId": "frontend",
      "Order": 2,
      "Match": { "Path": "{**catch-all}" }
    }
  },
  "Clusters": {
    "api":      { "Destinations": { "primary": { "Address": "http://catalog-api:3000" } } },
    "frontend": { "Destinations": { "primary": { "Address": "http://catalog-frontend" } } }
  }
}
```

Routes are evaluated in `Order` — lower number wins. The `/api/**` route has order 1, so it takes priority over the catch-all at order 2. The `{**catch-all}` on routes is YARP syntax for "match the rest of the path and forward it."

In `appsettings.Development.json`, only the cluster destinations are overridden — the routes stay the same, but the targets point to the local processes:

```json
"Clusters": {
  "api":      { "Destinations": { "primary": { "Address": "http://localhost:3000" } } },
  "frontend": { "Destinations": { "primary": { "Address": "http://localhost:4200" } } }
}
```

.NET's configuration system merges these on top of the base `appsettings.json` when `ASPNETCORE_ENVIRONMENT=Development`, so in code you just call `builder.Configuration.GetSection("ReverseProxy")` and YARP gets the right config for the environment automatically.

In Kubernetes, the service names `catalog-api` and `catalog-frontend` resolve to the ClusterIP of the corresponding Services. The default `appsettings.json` values already match the k8s Service names, so no environment-specific overrides are needed in the manifests.

---

## Database

The API uses SQLite via Node.js's built-in `node:sqlite` module — no driver to install, no separate process to run. The database file path is controlled by the `DB_PATH` environment variable (default: `/data/catalog.db`).

### SQLite in a container

Containers are ephemeral by design — anything written to the container's own filesystem is gone when the container is removed. The database file needs to live on a **volume** that persists independently of the container lifecycle.

In Docker Compose, a named volume handles this:
```yaml
volumes:
  - catalog-data:/data
```

In Kubernetes, a **PersistentVolumeClaim** (PVC) does the same job — it's a request for storage that the cluster provisions and keeps alive independently of the pod. The `k8s/api.yaml` manifest includes the PVC alongside the Deployment.

### SQLite and replicas

One important constraint: SQLite uses file locking, which means only one writer at a time — and file locks don't work across nodes. The API Deployment is set to `replicas: 1` for this reason. With more than one replica, two pods would compete for the same file.

If you needed horizontal scaling, Postgres would be the right move. For this workshop, a single replica with SQLite is entirely sufficient.

---

## Auth (not in scope for this workshop)

The Angular app ships with an auth store and route guards already wired — the scaffolding is there. If you were to add auth, the natural approach is OAuth2/OIDC with the BFF holding the tokens (the BFF pattern is specifically designed for this — it can act as a confidential client, keeping client secrets off the browser).

The most straightforward implementation would be ASP.NET Core's built-in OpenID Connect middleware in the BFF, with cookie-based sessions toward the browser and bearer tokens toward the backend API. YARP can be configured to forward or attach tokens to proxied requests.

That's a topic for another day.
