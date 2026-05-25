FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json tsconfig.json ./
COPY src ./src
RUN npx tsc

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
