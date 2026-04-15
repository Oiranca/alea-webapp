CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, auth_email, member_number, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email,
    'M-' || UPPER(RIGHT(REPLACE(NEW.id::text, '-', ''), 12)),
    'member'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;
