# Poké Mart

A small full-stack webshop for buying Pokémon. Built as a demo/test app — not a real store.

- **Backend**: Node.js + Express + TypeScript, SQLite (via `better-sqlite3`) for products, cart and orders.
- **Frontend**: React + TypeScript + Vite, served in production via nginx.
- **Containers**: one Dockerfile per service, wired together with `docker-compose.yml`.

## Features

- Product grid seeded with ~16 Pokémon, each with a type, price, description and sprite.
- Product detail page with quantity selector and "Add to cart".
- Session-based cart (a `sessionId` cookie identifies the cart, no login required) stored in SQLite.
- Checkout flow that totals the cart, creates an order row, and clears the cart.

## Project structure

```
pokemon-webshop/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── server.ts        entrypoint, session cookie, route mounting
│   │   ├── db.ts             SQLite connection + schema
│   │   ├── seed.ts           seeds products on first boot
│   │   └── routes/
│   │       ├── products.ts
│   │       ├── cart.ts
│   │       └── imageProxy.ts
│   └── data/                 SQLite file lives here (gitignored)
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── pages/            Home, ProductDetail, Cart
        ├── components/       Navbar, ProductCard
        └── api.ts            axios client for the backend API
```

## Running locally without Docker

```bash
# terminal 1
cd backend
npm install
npm run dev        # http://localhost:4000

# terminal 2
cd frontend
npm install
npm run dev         # http://localhost:3000
```

## Running with Docker Compose

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api (health check at `/api/health`)

The SQLite database persists in a named volume (`backend-data`) so cart/orders survive container restarts. Delete it with `docker compose down -v` to reset the shop.

## Security testing notes (intentional CVEs)

This repo intentionally pins some old, vulnerable dependencies and base images so it can be
used as a fixture for testing security scanners (e.g. Aikido's CVE exploitability / container
reachability analysis). **Do not reuse these Dockerfiles or dependency pins for anything real.**

| Location | Package/Image | Version | Known issue | Reachable at runtime? |
|---|---|---|---|---|
| `backend` | `lodash` | 4.17.15 | Prototype pollution / command injection (CVE-2020-8203, CVE-2021-23337; fixed in 4.17.19 / 4.17.21) | **Yes** — `routes/cart.ts` calls `merge({}, defaults, req.body.customization)` with unvalidated client input on `POST /api/cart`. |
| `backend` | `axios` | 0.21.1 | ReDoS (CVE-2021-3749; fixed in 0.21.2) | **Yes** — `routes/imageProxy.ts` uses it on every request to `GET /api/image-proxy`, which also forwards a fully attacker-controlled URL server-side (SSRF), since it isn't allowlisted and axios 0.x follows redirects by default. |
| `backend` (devDependency) | `minimist` | 1.2.5 | Prototype pollution (CVE-2021-44906; fixed in 1.2.6) | **No** — pinned as a direct devDependency but never imported by app code; not present in the runtime image's execution path. |
| `frontend` | `axios` | 0.21.1 | Same as above (CVE-2021-3749) | **Yes** — used for every API call in `src/api.ts`, shipped in the built JS bundle served by nginx. |
| `backend`, `frontend` (build stage) | `node` base image | `18.0.0` | Multiple OS-level CVEs (Debian package versions frozen at Apr 2022) | Yes, image-level (OS packages present in the running container). |
| `frontend` (serve stage) | `nginx` base image | `1.21.0` | Multiple OS-level CVEs (Debian package versions frozen at May 2021) | Yes, image-level. |

To reset for normal development, bump these to current versions and swap the base images for
`node:lts` / `nginx:stable` (or alpine variants).
