# Server API

This directory contains the backend server code for the TripNest app.

## Setup

Ensure `FIREBASE_SERVICE_ACCOUNT_BASE64` is set in `.env` (see root `.env.example`).

## Running the server

```bash
npx ts-node server/api.ts
```

Or build and run:

```bash
npm run build
node dist/server/api.js
```

## API endpoints

- `POST /api/trips` - Create a trip (admin operation)
  - Request body: `{ title: string, userId: string, description?: string }`
- `GET /api/trips/:userId` - Fetch all trips for a user
- `DELETE /api/trips/:tripId` - Delete a trip (admin operation)

## Example usage

```bash
# Create a trip
curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -d '{"title":"Paris 2025","userId":"user-123","description":"Summer vacation"}'

# Get trips for a user
curl http://localhost:3000/api/trips/user-123

# Delete a trip
curl -X DELETE http://localhost:3000/api/trips/trip-doc-id
```

The admin SDK allows these operations without authentication checks (use with caution in production — add proper auth middleware).
