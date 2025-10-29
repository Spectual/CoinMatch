# CoinMatch API Interface Specification

This document summarizes the backend interfaces required by the CoinMatch frontend (located in `app/`). Each section lists the route, purpose, payload schema, relevant UI touch points, and implementation remarks.

## Authentication

### POST `/api/login`
- **Purpose**: Authenticate museum staff via institutional credentials and issue a session token.
- **Request Body**
  ```json
  {
    "email": "name@harvard.edu",
    "password": "string"
  }
  ```
- **Response 200**
  ```json
  {
    "token": "jwt-string",
    "user": {
      "name": "Dr. Laure Marest",
      "email": "name@harvard.edu",
      "role": "curator"
    }
  }
  ```
- **Errors**: `401 Unauthorized` for invalid credentials.
- **Used by**: `LoginPage.tsx` (sign-in form) and `AuthContext` (storage of token + curator metadata).
- **Notes**: Token must be stored client-side (localStorage) and attached as `Authorization: Bearer <token>` on subsequent requests.

### POST `/api/logout` *(optional)*
- **Purpose**: Invalidate an active session token server-side.
- **Request Body**: empty.
- **Response 204**
- **Used by**: TopBar logout action. If omitted, client simply clears stored token.

## Coin Registry

### GET `/api/museum-coins`
- **Purpose**: Fetch the Dewing collection records marked as missing/displaced.
- **Response 200**
  ```json
  [
    {
      "coin_id": "uuid",
      "mint": "Tarentum",
      "authority": "Pyrrhus of Epirus",
      "date_range": "circa 281–272 BC",
      "denomination": "Didrachm",
      "metal": "AR (Silver)",
      "weight": 7.62,
      "diameter": 21.3,
      "die_axis": "6h",
      "obverse_description": "...",
      "reverse_description": "...",
      "obverse_inscription": "",
      "reverse_inscription": "ΤΑΡΑΣ",
      "reference_list": "Vlasto 807; HGC 1, 839",
      "catalog_number": "HAM Dewing 4224",
      "source_database": "Dewing Catalogue",
      "provenance_text": "Recorded missing since ...",
      "previous_owners": "Henry P. Kendall; Walter E. Dewing",
      "auction_history": [{
        "house": "CNG",
        "sale": "Triton XXVII",
        "date": "2024-01-15",
        "lot": "112",
        "price_realized": "$1,440"
      }],
      "estimate_value": "$1,200–$1,500",
      "sale_price": "",
      "obverse_image_url": "https://...",
      "reverse_image_url": "https://...",
      "lot_description_raw": "...",
      "lot_description_EN": "...",
      "created_at": "2024-01-10T09:00:00Z",
      "updated_at": "2024-03-02T14:22:00Z",
      "source_type": "museum"
    }
  ]
  ```
- **Used by**: Missing Coins page (table rendering and filters), Coin Detail page (metadata), Dashboard stats.
- **Notes**: Provide pagination or cursor support if the dataset grows large. Include `ETag` headers for caching.

### GET `/api/museum-coins/{coin_id}`
- **Purpose**: Fetch a single record with full metadata (same schema as list entry).
- **Used by**: Coin Detail page, Comparison view, Search linking.

## Search & Retrieval

### POST `/api/search/image`
- **Purpose**: Return candidate auction records ranked by image similarity.
- **Request Body (multipart)**
  - `museum_coin_id` (string, optional) – tie to a specific record.
  - `obverse` (file) and `reverse` (file) – uploaded photographs.
- **Response 200**
  ```json
  [
    {
      "id": "cand-901",
      "museumCoinId": "coin-4224",
      "similarityScore": 0.87,
      "listingReference": "CNG Triton XXVII, Lot 112",
      "saleDate": "2024-01-15",
      "estimate_value": "$1,200–$1,500",
      "sale_price": "$1,440",
      "listing_url": "https://...",
      "metadata": { ... coin metadata schema ... }
    }
  ]
  ```
- **Used by**: Coin Detail (“Run Image Match”), Search Results page (view toggle, min-score filter), Comparison view.
- **Notes**: Accept optional `top_k` query param. Embed subset of metadata in response to avoid extra lookups.

### POST `/api/search/text`
- **Purpose**: Return candidate auction records ranked by text similarity.
- **Request Body**
  ```json
  {
    "query": "Tarentum didrachm Taras dolphin",
    "museum_coin_id": "coin-4224" // optional
  }
  ```
- **Response**: identical schema to `/api/search/image`.
- **Used by**: Coin Detail (“Run Text Match”), Search page text mode.

## Match Management

### POST `/api/match/save`
- **Purpose**: Persist user decisions against candidate matches.
- **Request Body**
  ```json
  {
    "museum_coin_id": "coin-4224",
    "candidate_id": "cand-901",
    "decision": "confirmed", // confirmed | rejected | pending
    "notes": "Die axis and reverse legend align."
  }
  ```
- **Response 201**
  ```json
  {
    "id": "match-1201",
    "coinId": "coin-4224",
    "candidateId": "cand-901",
    "similarityScore": 0.87,
    "status": "confirmed",
    "savedAt": "2024-04-09T15:33:00Z",
    "source": "CNG Triton XXVII"
  }
  ```
- **Used by**: Comparison view (Confirm / Reject / Save buttons).
- **Notes**: Accept `PATCH /api/match/{id}` for status updates and notes revision.

### GET `/api/match/history`
- **Purpose**: List matches saved by the current user (or entire research group).
- **Query Params**: `status`, `coin_id`, `limit`, `offset`.
- **Response 200**
  ```json
  {
    "items": [
      {
        "id": "match-1001",
        "coinId": "coin-4224",
        "candidateId": "cand-901",
        "similarityScore": 0.87,
        "status": "confirmed",
        "savedAt": "2024-03-12T15:45:00Z",
        "notes": "Reverse die matches Dewing plate 4224.",
        "candidateTitle": "CNG Triton XXVII · Lot 112",
        "museumCoinTitle": "Tarentum · Didrachm (AR)"
      }
    ],
    "total": 128
  }
  ```
- **Used by**: Dashboard (latest activity), Match History page tables.

## Auxiliary

### GET `/api/user/profile`
- **Purpose**: Fetch curator name, role, and notification counts on app load.
- **Response 200**
  ```json
  {
    "name": "Dr. Laure Marest",
    "email": "laure_marest@harvard.edu",
    "role": "Curator",
    "notifications": 2
  }
  ```
- **Used by**: TopBar (profile info & badges).

### POST `/api/notifications/read`
- **Purpose**: Mark alerts as read.
- **Request Body**: `{ "ids": ["notif-1", "notif-2"] }`
- **Used by**: Future enhancement for the TopBar notification bell.

## Implementation Guidance
- All endpoints should require `Authorization: Bearer` tokens except `/api/login`.
- Prefer JSON responses; for large payloads (e.g., coin registry) support pagination and conditional GET.
- Frontend expects ISO-8601 timestamps and floats for numeric measurements.
- For search endpoints, include both the raw metadata and high-level summary fields (`listingReference`, `similarityScore`) used by list cards.
- Standardize error payloads as `{ "error": "message", "details": {...} }` so UI can display meaningful feedback.

This specification will evolve as integration proceeds; keep the document updated when contracts change.
