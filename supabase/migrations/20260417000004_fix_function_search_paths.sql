-- Fix mutable search_path warnings (Supabase linter: function_search_path_mutable)
-- Both functions use fully-qualified references so empty search_path is safe.

CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Fix public_bucket_allows_listing: drop broad SELECT policy on table-qr-codes.
-- Public buckets serve objects by URL without a policy; this policy only enabled
-- unauthenticated listing of all keys in the bucket.
DROP POLICY IF EXISTS "qr_codes_public_read" ON "storage"."objects";
