CREATE TABLE IF NOT EXISTS public.activation_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT activation_tokens_profile_id_key UNIQUE (profile_id)
);

CREATE TRIGGER activation_tokens_updated_at
  BEFORE UPDATE ON public.activation_tokens
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.activation_tokens ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.activation_tokens IS 'One active account activation link per imported member profile.';
COMMENT ON COLUMN public.activation_tokens.token_hash IS 'SHA-256 hash of the activation token sent in the URL.';
COMMENT ON COLUMN public.activation_tokens.expires_at IS 'Activation links expire 24 hours after generation.';
COMMENT ON COLUMN public.activation_tokens.used_at IS 'Timestamp when the activation link was consumed successfully.';
