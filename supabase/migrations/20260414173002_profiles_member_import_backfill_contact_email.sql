UPDATE public.profiles
SET email = auth_email
WHERE (email IS NULL OR BTRIM(email) = '')
  AND auth_email IS NOT NULL
  AND BTRIM(auth_email) <> '';
