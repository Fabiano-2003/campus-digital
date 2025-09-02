-- Corrigir problemas de segurança detectados pelo linter

-- 1. Corrigir search_path nas funções existentes
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_user_update() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;