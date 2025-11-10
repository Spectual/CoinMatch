## CoinMatch Data Model

### Tables

- **users**
  - `id` (PK, int)
  - `email` (unique, text)
  - `name` (text)
  - `password_hash` (text)
  - `created_at` (timestamp)

- **session_tokens**
  - `id` (PK, text)
  - `user_id` (FK → users.id)
  - `created_at` (timestamp)
  - `expires_at` (timestamp)

- **museum_coins**
  - `coin_id` (PK, text)
  - `mint`, `authority`, `date_range`, `denomination`, `metal`
  - `weight`, `diameter`, `die_axis`
  - `obverse_description`, `reverse_description`, `obverse_inscription`, `reverse_inscription`
  - `monograms`, `reference_list`, `catalog_number`, `source_database`
  - `provenance_text`, `previous_owners`, `auction_history`
  - `estimate_value`, `sale_price`
  - `obverse_image_key`, `reverse_image_key`
  - `lot_description_raw`, `lot_description_en`
  - `created_at`, `updated_at`
  - `source_type`

- **online_coins**
  - `id` (PK, text)
  - `museum_coin_id` (nullable FK → museum_coins.coin_id)
  - `similarity_score`
  - All canonical coin fields mirrored from `docs/coin_metadata.md` (`mint`, `authority`, `denomination`, `metal`, measurements, inscriptions, descriptions, images, etc.)
  - `listing_reference`, `sale_date`, `estimate_value`, `sale_price`, `listing_url`
  - `metadata_json` (raw listing payload kept for provenance)
  - `fetched_at`
  - `source_name`

- **matches**
  - `id` (PK, int)
  - `museum_coin_id` (FK → museum_coins.coin_id)
  - `candidate_id` (nullable FK → online_coins.id)
  - `similarity_score`
  - `status` (`Pending`, `Accepted`, `Rejected`)
  - `notes`
  - `source`
  - `saved_at`
  - `decided_by` (FK → users.id)
  - Unique constraint on (`museum_coin_id`, `candidate_id`)

- **search_jobs**
  - `id` (PK, text)
  - `job_type` (`image` or `text`)
  - `museum_coin_id` (nullable text)
  - `query_text`
  - `obverse_key`, `reverse_key`
  - `status`
  - `created_by` (FK → users.id)
  - `created_at`, `completed_at`
  - `result_summary`

### Matching Workflow
1. Museum & online coins arrive via sync (`/api/admin/sync`) or manual upload (`POST /api/museum-coins`, `POST /api/online-coins`). Images should be referenced by publicly reachable URLs (e.g. files served by Vite under `app/public/`).
2. Matching job (`/api/admin/match`) performs a lightweight pre-filter using shared attributes (mint, denomination, metal, authority) and updates/creates `matches` with heuristic similarity scores. If an online record already carries a `similarity_score`, it is treated as a seed value and overwritten by the heuristic on recompute.
3. Curators review pending matches in the UI and set status to `Accepted`, `Rejected`, or keep `Pending`. Accepted matches no longer appear in suggestion lists but remain in history.



