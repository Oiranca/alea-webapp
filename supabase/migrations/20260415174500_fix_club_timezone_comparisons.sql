-- Migration: create database-backed time helper for service_role callers
-- Project rule: keep exactly one SQL statement per migration file.

CREATE OR REPLACE FUNCTION public.get_database_time()
RETURNS timestamptz
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT now();
$$;
