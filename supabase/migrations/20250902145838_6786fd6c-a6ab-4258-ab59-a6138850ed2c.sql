-- Fix security warnings by setting search_path for helper functions
CREATE OR REPLACE FUNCTION public.get_follower_count(
  _target_type public.follow_target_type,
  _target_id UUID
)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.follows
  WHERE target_type = _target_type 
    AND target_id = _target_id 
    AND status = 'accepted';
$$;

CREATE OR REPLACE FUNCTION public.get_following_count(_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.follows
  WHERE follower_id = _user_id 
    AND status = 'accepted';
$$;

CREATE OR REPLACE FUNCTION public.is_following(
  _follower_id UUID,
  _target_type public.follow_target_type,
  _target_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.follows
    WHERE follower_id = _follower_id
      AND target_type = _target_type
      AND target_id = _target_id
      AND status = 'accepted'
  );
$$;