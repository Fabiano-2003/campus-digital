-- Add visibility field to existing tables
ALTER TABLE public.feed_posts 
ADD COLUMN visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'groups', 'institution'));

ALTER TABLE public.videos 
ADD COLUMN visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'groups', 'institution'));

ALTER TABLE public.monographs 
ADD COLUMN visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'groups', 'institution'));

ALTER TABLE public.books 
ADD COLUMN visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'groups', 'institution'));

-- Update RLS policies for public content viewing
DROP POLICY IF EXISTS "Anyone can view feed posts" ON public.feed_posts;
CREATE POLICY "Anyone can view public feed posts" 
ON public.feed_posts 
FOR SELECT 
USING (visibility = 'public' OR (auth.uid() = user_id));

DROP POLICY IF EXISTS "Anyone can view videos" ON public.videos;
CREATE POLICY "Anyone can view public videos" 
ON public.videos 
FOR SELECT 
USING (visibility = 'public' OR (auth.uid() = uploaded_by));

DROP POLICY IF EXISTS "Anyone can view monographs" ON public.monographs;
CREATE POLICY "Anyone can view public monographs" 
ON public.monographs 
FOR SELECT 
USING (visibility = 'public' OR (auth.uid() = uploaded_by));

DROP POLICY IF EXISTS "Anyone can view books" ON public.books;
CREATE POLICY "Anyone can view public books" 
ON public.books 
FOR SELECT 
USING (visibility = 'public' OR (auth.uid() = uploaded_by));