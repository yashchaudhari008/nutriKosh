# nutriKosh

A multi-user, local-first, installable (PWA) web app to log daily food/protein intake and body weight, with Google sign-in and MongoDB storage.

## Structure

- `frontend/` — React (Vite) + Tailwind, deploys to GitHub Pages.
- `backend/` — Node/Express API + MongoDB (Mongoose), deploys to Render/Railway/Fly.io.

## Setup

```bash
npm run install:all
```

Copy `.env.example` to `.env` in both `frontend/` and `backend/`, and fill in:

- `backend/.env`: `MONGODB_URI`, `GOOGLE_CLIENT_ID`, `JWT_SECRET`, `USDA_API_KEY`, `CLIENT_URL`
- `frontend/.env`: `VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`

## Development

```bash
npm run dev:backend    # http://localhost:5000
npm run dev:frontend   # http://localhost:5173
```

## Bootstrapping the first admin

There's no UI to create the first admin (the admin panel itself requires being an admin). After logging in once, find your `_id` in the `users` collection via MongoDB Atlas and insert a matching document into `admins`:

```js
db.admins.insertOne({
  userId: ObjectId("<your user _id>"),
  email: "<your email>",
  addedAt: new Date(),
  addedBy: null,
});
```

## Current status

Phase 1 (Foundation) is scaffolded: Google OAuth login end-to-end, session JWT, `GET/PATCH /api/me`, `admins` collection + `requireAdmin` middleware. Food/weight tracking, external food lookup, offline sync, and the admin panel land in later phases — see the build plan for details.
