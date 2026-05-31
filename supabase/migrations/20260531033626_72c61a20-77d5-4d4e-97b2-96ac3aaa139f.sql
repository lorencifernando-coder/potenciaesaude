
-- 1. Restrict access to google_refresh_token column (sensitive OAuth credential)
-- Admins should not be able to read it directly via PostgREST; only server-side service role
REVOKE SELECT (google_refresh_token) ON public.app_settings FROM authenticated, anon;

-- 2. Remove broad SELECT policy on storage.objects for site-assets bucket.
-- The bucket is public, so direct public URLs continue to work via the storage CDN
-- (RLS is bypassed for public bucket URL access). Dropping this policy prevents
-- clients from listing every file in the bucket via the storage API.
DROP POLICY IF EXISTS "Site assets leitura pública" ON storage.objects;
