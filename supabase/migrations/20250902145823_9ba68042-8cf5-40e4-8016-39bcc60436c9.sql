-- Create enums for follow system
CREATE TYPE public.follow_target_type AS ENUM ('user', 'group', 'page', 'entity');
CREATE TYPE public.follow_level AS ENUM ('public', 'member', 'moderator', 'admin', 'owner');
CREATE TYPE public.follow_status AS ENUM ('pending', 'accepted', 'blocked');

-- Create follows table
CREATE TABLE public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type public.follow_target_type NOT NULL,
  target_id UUID NOT NULL,
  follow_level public.follow_level NOT NULL DEFAULT 'public',
  status public.follow_status NOT NULL DEFAULT 'accepted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure a user can only follow a target once
  UNIQUE(follower_id, target_type, target_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows
CREATE POLICY "Users can view follows they created"
ON public.follows
FOR SELECT
USING (auth.uid() = follower_id);

CREATE POLICY "Users can view follows targeting them"
ON public.follows
FOR SELECT
USING (
  (target_type = 'user' AND auth.uid() = target_id) OR
  (target_type = 'group' AND EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = target_id AND user_id = auth.uid()
  )) OR
  (target_type IN ('page', 'entity') AND status = 'accepted')
);

CREATE POLICY "Users can create follows"
ON public.follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can update their follows"
ON public.follows
FOR UPDATE
USING (auth.uid() = follower_id);

CREATE POLICY "Users can delete their follows"
ON public.follows
FOR DELETE
USING (auth.uid() = follower_id);

-- Target owners can update follow status
CREATE POLICY "Target owners can manage follows"
ON public.follows
FOR UPDATE
USING (
  (target_type = 'user' AND auth.uid() = target_id) OR
  (target_type = 'group' AND EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = target_id AND user_id = auth.uid() AND role IN ('admin', 'moderator')
  ))
);

-- Add updated_at trigger
CREATE TRIGGER update_follows_updated_at
BEFORE UPDATE ON public.follows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function to get follower count
CREATE OR REPLACE FUNCTION public.get_follower_count(
  _target_type public.follow_target_type,
  _target_id UUID
)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.follows
  WHERE target_type = _target_type 
    AND target_id = _target_id 
    AND status = 'accepted';
$$;

-- Helper function to get following count for a user
CREATE OR REPLACE FUNCTION public.get_following_count(_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.follows
  WHERE follower_id = _user_id 
    AND status = 'accepted';
$$;

-- Helper function to check if user is following a target
CREATE OR REPLACE FUNCTION public.is_following(
  _follower_id UUID,
  _target_type public.follow_target_type,
  _target_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
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