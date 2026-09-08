# Backend Changelog

This documents every change made to this backend during development sessions, beyond the original scaffold. No existing API contract, route, database schema, or business rule was removed or altered in a breaking way — every change below is either a bug fix or an additive enhancement (new fields, new optional query params).

## Critical fix: unhandled promise rejections were crashing the whole server

**Files:** `src/utils/catchAsync.js` (new), `src/controllers/admin.controller.js`, `src/controllers/store.controller.js`, `src/controllers/rating.controller.js`, `src/controllers/auth.controller.js`

Every controller except `register`/`login`/`updatePassword` was a plain `async (req, res) => {...}` with no `try/catch`. In Express 4, an async handler that throws does **not** get forwarded to error-handling middleware automatically. Combined with Node 15+'s default of terminating the process on an unhandled promise rejection, this meant a single bad request — a duplicate email, an invalid `ownerId`, a foreign-key violation, anything that made Sequelize reject — would **crash the entire server for every user**, not just fail that one request. This was reproduced directly: creating a store with an email that already existed took the whole process down.

Fixed by adding a `catchAsync` wrapper (`(fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)`) and wrapping every controller export in it, so failures now reach the error middleware and return a proper HTTP error instead of taking down the process.

## Error middleware now maps Sequelize errors to correct status codes

**File:** `src/middlewares/error.middleware.js`

Previously any thrown error fell through to a generic `500`. Now:
- `SequelizeUniqueConstraintError` (or a raw Postgres `23505`) → `409 Duplicate entry`, with the offending field named.
- `SequelizeValidationError` → `400 Validation Error`, with a `field`/`message` per failed rule.
- `SequelizeForeignKeyConstraintError` → `400 Referenced record does not exist`.
- Everything else still falls back to `500` as before.

## New: live API documentation page

**Files:** `src/public/index.html` (new), `src/app.js`

`GET /` now serves a static documentation page (via `express.static`) instead of a bare JSON welcome message. It lists every endpoint with sample request/response bodies, a live health-check widget, and a "Try it" button that calls `POST /auth/register` for real against the running server. Nothing under `/api/*` changed — this only replaces what `/` itself returns.

## Admin store listing gained sorting, filtering, and a `createdAt` field

**File:** `src/controllers/admin.controller.js` (`listStores`)

`GET /admin/stores` previously always returned every store in a fixed name-ascending order with no way to filter it, unlike the equivalent user listing. It now accepts the same optional query params as `/admin/users`: `?name=`, `?email=`, `?address=` (case-insensitive partial match) and `?sortBy=name|email|address|createdAt&sortOrder=ASC|DESC`. It also now selects `createdAt` (the column already existed on the model; it just wasn't in the `attributes` list before), which the redesigned frontend needed to show "recently added stores." All of this is additive — omitting the new query params reproduces the old behavior exactly.

## `/auth/profile` now includes a Store Owner's managed store

**File:** `src/controllers/auth.controller.js` (`getProfile`)

The profile response previously returned the bare user record. It now also eager-loads `managedStore: { id, name }` when the account owns a store — the same association already used by the admin's `getUser` endpoint. This was needed because the Store Owner dashboard has no other way to discover which store it should query (`/owner/stores/:storeId/ratings` requires an ID the frontend didn't otherwise have). Existing fields on the response are unchanged.

## Admin-created users now enforce the same validation as self-registration

**File:** `src/controllers/admin.controller.js` (`createUser`)

`POST /admin/users` checked the role was valid but skipped the name-length (20–60 chars) and address-length (≤400 chars) rules that `POST /auth/register` already enforced, so an admin could create an account that violated the assignment's own form-validation spec. Both checks were added, returning `400` with the same messages used elsewhere.

## Overall store ratings are now rounded

**Files:** `src/controllers/store.controller.js`, `src/controllers/admin.controller.js` (`listStores`)

`AVG(rating)` from Postgres came back as a long-decimal string (e.g. `"3.0000000000000000"`). Both the public store listing and the admin store listing now wrap it in `ROUND(..., 1)` so the API itself returns a clean one-decimal value instead of relying on the frontend to reformat it.

## Environment & tooling

- Created `.env` from `.env.example` (was missing; the app couldn't start without it). Values point at the local Postgres instance already running on this machine.
- Switched the dev process from `node server.js` to `npm run dev` (nodemon), so future backend edits auto-restart the server instead of needing a manual kill/restart.
