ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS auth_email text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS active_from timestamptz,
  ADD COLUMN IF NOT EXISTS psw_changed timestamptz,
  ADD COLUMN IF NOT EXISTS phone text;
