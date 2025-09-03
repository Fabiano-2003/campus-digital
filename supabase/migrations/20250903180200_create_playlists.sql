
-- Create playlists table
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create playlist_items table
CREATE TABLE public.playlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('video', 'book', 'monograph')),
  item_id UUID NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teacher_courses table
CREATE TABLE public.teacher_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  level TEXT NOT NULL,
  institution TEXT,
  cover_url TEXT,
  is_active BOOLEAN DEFAULT true,
  max_students INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_enrollments table
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES teacher_courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, student_id)
);

-- Create course_content table
CREATE TABLE public.course_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES teacher_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'reading', 'assignment', 'quiz')),
  content_url TEXT,
  content_text TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_content ENABLE ROW LEVEL SECURITY;

-- Policies for playlists
CREATE POLICY "Users can view their own playlists" 
ON public.playlists FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public playlists" 
ON public.playlists FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create their own playlists" 
ON public.playlists FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" 
ON public.playlists FOR UPDATE 
USING (auth.uid() = user_id);

-- Policies for playlist_items
CREATE POLICY "Users can manage their playlist items" 
ON public.playlist_items FOR ALL 
USING (playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid()));

-- Policies for teacher_courses
CREATE POLICY "Anyone can view active courses" 
ON public.teacher_courses FOR SELECT 
USING (is_active = true);

CREATE POLICY "Teachers can create courses" 
ON public.teacher_courses FOR INSERT 
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their courses" 
ON public.teacher_courses FOR UPDATE 
USING (auth.uid() = teacher_id);

-- Policies for course_enrollments
CREATE POLICY "Students can view their enrollments" 
ON public.course_enrollments FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view course enrollments" 
ON public.course_enrollments FOR SELECT 
USING (course_id IN (SELECT id FROM teacher_courses WHERE teacher_id = auth.uid()));

CREATE POLICY "Students can enroll in courses" 
ON public.course_enrollments FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- Policies for course_content
CREATE POLICY "Enrolled students can view course content" 
ON public.course_content FOR SELECT 
USING (
  course_id IN (
    SELECT course_id FROM course_enrollments 
    WHERE student_id = auth.uid() AND status = 'accepted'
  )
);

CREATE POLICY "Teachers can manage their course content" 
ON public.course_content FOR ALL 
USING (course_id IN (SELECT id FROM teacher_courses WHERE teacher_id = auth.uid()));
