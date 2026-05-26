# Containers, Dockerfiles, Oh My!

You probably already know what a container is. This section is less about the concept and more about *how these specific Dockerfiles work* and why they're written the way they are — then getting them running locally before we hand them off to Kubernetes.

## Multi-Stage Builds

Both Dockerfiles use **multi-stage builds**. This is the production pattern for compiled languages (including TypeScript) and build-step-heavy frontends.

A Dockerfile can contain multiple `FROM` statements. Each one starts a fresh stage with its own filesystem. You can copy specific files *out of* earlier stages into later ones. The final image only contains what the last stage has — all the build tools, compilers, devDependencies, and source files from earlier stages are discarded.

Why it matters:
- **Smaller images** — the Angular CLI, TypeScript compiler, and all devDependencies are hundreds of megabytes. None of that belongs in the image you deploy.
- **No source code in production** — the TypeScript source stays in the build stage. What ships is compiled JavaScript and static files.
- **Reproducible builds** — `npm ci` (not `npm install`) is used throughout, which installs the exact versions in `package-lock.json`.

---

## The API Dockerfile

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci
```

**Stage 1 — `deps`**: installs all npm packages including devDependencies. This stage exists purely to produce a `node_modules` directory that the next stage can copy from. Separating it means Docker can cache this layer and skip re-running `npm ci` when only source files change.

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json tsconfig.json ./
COPY src ./src
RUN npx tsc
```

**Stage 2 — `builder`**: compiles TypeScript to JavaScript. A few things worth noting:

- `COPY --from=deps` pulls the `node_modules` directory from stage 1 — it doesn't re-run `npm ci`
- `npx tsc` compiles the source according to `tsconfig.json`. The output lands in `/app/dist`.
- The `dev` script uses `tsx` for hot-reloading during development, but `tsx` is a devDependency and won't exist in the final image. `tsc` + `node` is the right production path.

```dockerfile
FROM node:22-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

ENV PORT=3000
ENV DB_PATH=/data/catalog.db

VOLUME ["/data"]
EXPOSE 3000

CMD ["node", "dist/src/index.js"]
```

**Stage 3 — `production`**: the image you actually run. Key decisions:

- `npm ci --omit=dev` installs only runtime dependencies — Express, cors. No TypeScript, no tsx, no type definitions.
- `COPY --from=builder /app/dist ./dist` pulls only the compiled JavaScript from stage 2. The TypeScript source never touches this stage.
- `DB_PATH=/data/catalog.db` — the SQLite database lives in a mounted volume, not inside the container. **Containers are ephemeral** — anything written to the container's own filesystem disappears when the container is removed. Data you care about must live outside the container on a mounted volume.
- `VOLUME ["/data"]` declares `/data` as a mount point. Docker and Kubernetes both understand this as "external storage goes here."
- `CMD ["node", "dist/src/index.js"]` runs the compiled entry point directly with Node.

---

## The Frontend Dockerfile

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
```

Same two-stage pattern. `npm run build` runs `ng build`, which produces a fully optimised, minified, tree-shaken set of static files in `dist/frontend/browser/`. That directory contains HTML, CSS, and JavaScript — nothing that requires Node.js to serve.

```dockerfile
FROM nginx:alpine AS production
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

ENV API_URL=http://catalog-api:3000

EXPOSE 80
```

**Stage 3** is where this differs from the API: the final image has **no Node.js**. It's purely nginx serving static files. This is the right shape for a compiled frontend — the Angular app runs in the user's browser, not on the server.

`API_URL` is the address of the API service. nginx will forward all `/api/` requests there. The value will be different in every environment — local Docker, Kubernetes, etc. — so it's an environment variable injected at container startup rather than baked into the image.

### The nginx Configuration

The nginx config lives in `nginx.conf.template` rather than `nginx.conf`. The nginx Docker image automatically processes files in `/etc/nginx/templates/` with `envsubst` before starting, replacing environment variable references with their values.

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $$uri $$uri/ /index.html;
    }

    location /api/ {
        proxy_pass ${API_URL};
        proxy_set_header Host $$host;
        proxy_set_header X-Real-IP $$remote_addr;
        proxy_set_header X-Forwarded-For $$proxy_add_x_forwarded_for;
    }
}
```

Two things worth understanding here:

**`try_files $uri $uri/ /index.html`** — Angular is a single-page application. There is only one real HTML file: `index.html`. When the router navigates to `/catalog` or `/admin`, Angular handles that in JavaScript — nginx never needs to find a `/catalog/index.html` file. But if someone refreshes the page or pastes a deep link into the browser, the request goes to nginx first. Without this directive, nginx would return a 404 for anything that isn't a real file. `try_files` tells nginx: try the exact path, then try it as a directory, and if neither exists, serve `index.html` and let Angular sort it out.

**`$$uri` vs `${API_URL}`** — `envsubst` replaces both `$VAR` and `${VAR}` forms. nginx also uses `$variable` syntax for its own variables. If the template contained `$uri` and `$host`, `envsubst` would replace them with empty strings (those environment variables don't exist). The `$$` is an escape sequence: `envsubst` converts `$$uri` → `$uri` in the output. So `${API_URL}` gets substituted with the environment variable, and `$$uri` becomes the nginx variable `$uri`.

---

## Building Images Locally

From the repo root:

```bash
# Build the API image and tag it as catalog-api
docker build -t catalog-api ./api

# Build the frontend image and tag it as catalog-frontend
docker build -t catalog-frontend ./frontend
```

The first build will take a few minutes — it's downloading base images and installing packages. Subsequent builds are much faster because Docker caches layers that haven't changed.

Verify the images exist:

```bash
docker images | grep catalog
```

---

## Running Containers Individually

### API

```bash
docker run -d \
  --name catalog-api \
  -p 3000:3000 \
  -v catalog-data:/data \
  catalog-api
```

- `-d` — detached (runs in the background)
- `--name catalog-api` — gives the container a name so you can reference it later
- `-p 3000:3000` — maps port 3000 on your machine to port 3000 in the container
- `-v catalog-data:/data` — mounts a named volume called `catalog-data` at `/data` inside the container; Docker creates the volume if it doesn't exist; the database persists across container restarts

Check it's running:

```bash
curl http://localhost:3000/api/vendors
```

### Frontend

When running the frontend container independently (not through Compose), the API is running on your host machine, not inside the same Docker network. Docker provides a special hostname for this:

```bash
docker run -d \
  --name catalog-frontend \
  -p 8080:80 \
  -e API_URL=http://host.docker.internal:3000 \
  catalog-frontend
```

`host.docker.internal` resolves to your host machine from inside a container. This is a Docker Desktop feature on Mac and Windows. On Linux you may need to add `--add-host=host.docker.internal:host-gateway`.

Open http://localhost:8080.

### Cleaning up

```bash
docker stop catalog-api catalog-frontend
docker rm catalog-api catalog-frontend
```

The `catalog-data` volume persists after the containers are removed. To also remove it:

```bash
docker volume rm catalog-data
```

---

## Running Both Together with Docker Compose

Wiring containers up individually and managing environment variables by hand doesn't scale. Docker Compose describes your whole application stack in a single file.

The `docker-compose.yml` at the repo root defines both services. Start everything with:

```bash
docker compose up --build
```

`--build` rebuilds images before starting. Use it whenever you've changed application code. If nothing has changed, omit it and Compose will use the cached images.

When both services are running:
- App → http://localhost:8080
- API directly → http://localhost:3000/api/vendors

### How the services find each other

Docker Compose creates a private network for the services defined in the file. Services can reach each other using their **service name** as a hostname. That's why the `API_URL` in `docker-compose.yml` is `http://api:3000` — the frontend's nginx container resolves `api` to the IP address of the API container on the Compose network.

This is also exactly how it works in Kubernetes: services find each other by name. The names are different, but the concept is identical.

### Useful Compose commands

```bash
# Start in the background
docker compose up -d --build

# Follow logs from all services
docker compose logs -f

# Follow logs from one service
docker compose logs -f api

# Stop everything (volumes are preserved)
docker compose down

# Stop everything and wipe the database volume
docker compose down -v

# Open a shell in the running API container
docker compose exec api sh

# Rebuild and restart a single service
docker compose up -d --build api
```

### Checking what's actually running

```bash
# Running containers
docker ps

# Resource usage
docker stats

# Inspect the generated nginx config (after envsubst processing)
docker compose exec frontend cat /etc/nginx/conf.d/default.conf
```

That last command is useful for verifying that `API_URL` was substituted correctly and the nginx variables (`$uri`, `$host`) survived intact.

---

## What's Next

Docker Compose is the right tool for local development and testing. It's not what runs in production.

In production — and for the Kubernetes section of this workshop — you push these images to a registry (Docker Hub) and reference them in Kubernetes manifests. Kubernetes takes over the job Compose does locally: starting containers, injecting environment variables, mounting volumes, and networking services together. The difference is that Kubernetes does this across a cluster of machines, with health checks, automatic restarts, rolling updates, and resource management built in.

Image publishing is covered in [CI/CD](./60-ci-cd.md). The Kubernetes manifests that consume those images are in [Orchestration with Kubernetes](./50-k8s.md).

---

> **Footnote — building for a specific CPU architecture.** Docker images are architecture-specific. An image built on an Apple Silicon Mac (`arm64`) won't run on a Windows/Linux `amd64` host without emulation, and vice versa. If you're on a Mac and pushing images that will run on an `amd64` cluster (or on the Windows box we'll use during the demo), build explicitly for the target platform: `docker build --platform=linux/amd64 -t myimage .`, or use `docker buildx build --platform=linux/amd64,linux/arm64 --push -t myimage .` to publish a multi-arch manifest. Symptom when you forget: the image pulls fine but the container exits immediately with `exec format error`.
