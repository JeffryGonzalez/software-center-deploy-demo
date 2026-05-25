FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

ENV API_URL=http://catalog-api:3000

EXPOSE 80
