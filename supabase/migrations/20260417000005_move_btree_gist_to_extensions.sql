-- Move btree_gist from public to extensions schema
-- (Supabase linter: extension_in_public)
--
-- WARNING: applies briefly during constraint rebuild with no overlap protection.
-- Run during a low-traffic window. The ADD CONSTRAINT at the end re-validates
-- the full reservations table and will block concurrent writes briefly.

-- 1. Drop exclusion constraint that depends on btree_gist
ALTER TABLE "public"."reservations"
  DROP CONSTRAINT IF EXISTS "reservations_no_active_overlap";

-- 2. Move extension to extensions schema
DROP EXTENSION IF EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "btree_gist" WITH SCHEMA "extensions";

-- 3. Recreate exclusion constraint (btree_gist ops are now in extensions schema)
ALTER TABLE "public"."reservations"
  ADD CONSTRAINT "reservations_no_active_overlap"
  EXCLUDE USING "gist" (
    "table_id" WITH =,
    "tsrange"(("date" + "start_time"), ("date" + "end_time"), '[)'::"text") WITH &&
  ) WHERE (("status" = 'active'::"public"."reservation_status"));
