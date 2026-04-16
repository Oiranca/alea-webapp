CREATE OR REPLACE FUNCTION public.mark_no_show_reservations(
  reference_time timestamptz DEFAULT now(),
  club_timezone text DEFAULT 'Atlantic/Canary'
)
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
    AND ((date::timestamp + end_time::time) AT TIME ZONE club_timezone) < reference_time;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;
