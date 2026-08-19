# NOTE: the *runtime* image is intentionally old (nginx:1.21.0) and ships an
# outdated axios dependency (0.21.1) in the built JS bundle, so this image
# carries real, known CVEs for security-tool testing purposes. The builder
# stage below is not part of the shipped image (only its /app/dist output is
# copied out), so it uses a current Node to actually be able to run the
# build - Vite 6 requires a newer Node than node:18.0.0 provides.
# Do not use this Dockerfile as a template for production images.

# ---- Build stage ----
FROM node:20-alpine AS builder
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
