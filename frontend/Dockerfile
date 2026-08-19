# NOTE: pinned to intentionally old base images (node:18.0.0, nginx:1.21.0)
# plus an outdated axios dependency (0.21.1) so this image carries real,
# known CVEs for security-tool testing purposes. Do not use this Dockerfile
# as a template for production images.

# ---- Build stage ----
FROM node:18.0.0 AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL=http://localhost:4000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Serve stage ----
FROM nginx:1.21.0
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
