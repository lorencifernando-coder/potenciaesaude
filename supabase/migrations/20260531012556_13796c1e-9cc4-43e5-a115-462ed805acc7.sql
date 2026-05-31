
REVOKE EXECUTE ON FUNCTION public.auto_grant_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_grant_admin() TO service_role;
