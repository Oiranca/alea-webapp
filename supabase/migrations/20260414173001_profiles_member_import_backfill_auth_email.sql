UPDATE public.profiles
SET auth_email = normalized.next_auth_email
FROM (
  SELECT
    ranked.id,
    CASE
      WHEN ranked.duplicate_rank = 1 THEN ranked.base_auth_email
      ELSE regexp_replace(
        ranked.base_auth_email,
        '@',
        '+legacy' || ranked.duplicate_rank::text || '@'
      )
    END AS next_auth_email
  FROM (
    SELECT
      profiles.id,
      COALESCE(
        NULLIF(LOWER(BTRIM(auth_users.email)), ''),
        NULLIF(LOWER(BTRIM(profiles.auth_email)), ''),
        NULLIF(LOWER(BTRIM(profiles.email)), ''),
        'legacy-' || REPLACE(profiles.id::text, '-', '') || '@members.alea.internal'
      ) AS base_auth_email,
      ROW_NUMBER() OVER (
        PARTITION BY COALESCE(
          NULLIF(LOWER(BTRIM(auth_users.email)), ''),
          NULLIF(LOWER(BTRIM(profiles.auth_email)), ''),
          NULLIF(LOWER(BTRIM(profiles.email)), ''),
          'legacy-' || REPLACE(profiles.id::text, '-', '') || '@members.alea.internal'
        )
        ORDER BY profiles.id
      ) AS duplicate_rank
    FROM public.profiles AS profiles
    LEFT JOIN auth.users AS auth_users
      ON auth_users.id = profiles.id
  ) AS ranked
) AS normalized
WHERE public.profiles.id = normalized.id
  AND (
    public.profiles.auth_email IS NULL
    OR BTRIM(public.profiles.auth_email) = ''
    OR public.profiles.auth_email <> normalized.next_auth_email
  );
