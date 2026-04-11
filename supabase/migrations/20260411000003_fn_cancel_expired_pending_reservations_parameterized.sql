-- Migration: parameterize grace_minutes in cancel_expired_pending_reservations
--
-- Replaces the hardcoded INTERVAL '20 minutes' with a grace_minutes parameter
-- (default 20) so the TypeScript constant GRACE_PERIOD_MINUTES and the SQL
-- function stay in sync via the RPC call site.
--
-- start_time is stored as TIME NOT NULL in 'HH:MM:SS' format (e.g. '14:00:00').
-- Casting start_time::time gives a PostgreSQL TIME value which can be added to a DATE
-- to produce a TIMESTAMP. Adding the grace period and comparing with NOW()
-- identifies reservations that should be marked as no_show.
--
-- DROP the 0-arg overload first: CREATE OR REPLACE with a new signature creates
-- a NEW overloaded function; it does NOT replace the existing no-arg version.
-- Without this DROP, no-arg callers would still hit the old hardcoded function.
DROP FUNCTION IF EXISTS public.cancel_expired_pending_reservations();

CREATE OR REPLACE FUNCTION public.cancel_expired_pending_reservations(grace_minutes INTEGER DEFAULT 20)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.reservations
  SET status = 'no_show'
  WHERE status = 'pending'
    AND activated_at IS NULL
    AND (date::date + start_time::time + (grace_minutes * INTERVAL '1 minute')) < NOW();

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Restrict execute permission: only service_role (used by the cron route handler) may call this function.
REVOKE EXECUTE ON FUNCTION public.cancel_expired_pending_reservations(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_expired_pending_reservations(INTEGER) TO service_role;
