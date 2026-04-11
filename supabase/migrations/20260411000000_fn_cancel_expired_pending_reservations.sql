-- Migration: add function to cancel pending reservations not activated within 20 minutes
--
-- start_time is stored as VARCHAR in 'HH:MM' format (e.g. '14:00').
-- Casting 'HH:MM'::time gives a PostgreSQL TIME value which can be added to a DATE
-- to produce a TIMESTAMP. Adding the 20-minute grace period and comparing with NOW()
-- identifies reservations that should be marked as no_show.

CREATE OR REPLACE FUNCTION public.cancel_expired_pending_reservations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.reservations
  SET status = 'no_show'
  WHERE status = 'pending'
    AND activated_at IS NULL
    AND (date::date + start_time::time + INTERVAL '20 minutes') < NOW();

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;
