-- Add comprehensive profile fields for CV and professional information
ALTER TABLE public.profiles 
ADD COLUMN title TEXT,
ADD COLUMN summary TEXT,
ADD COLUMN skills TEXT[],
ADD COLUMN languages TEXT[],
ADD COLUMN certifications JSONB DEFAULT '[]'::jsonb,
ADD COLUMN work_experience JSONB DEFAULT '[]'::jsonb,
ADD COLUMN education JSONB DEFAULT '[]'::jsonb,
ADD COLUMN projects JSONB DEFAULT '[]'::jsonb,
ADD COLUMN achievements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN cv_file_url TEXT,
ADD COLUMN portfolio_url TEXT,
ADD COLUMN linkedin_url TEXT,
ADD COLUMN github_url TEXT,
ADD COLUMN birth_date DATE,
ADD COLUMN gender TEXT,
ADD COLUMN availability TEXT DEFAULT 'available',
ADD COLUMN preferred_work_type TEXT,
ADD COLUMN salary_expectation TEXT,
ADD COLUMN career_interests TEXT[];

-- Add indexes for better performance
CREATE INDEX idx_profiles_skills ON public.profiles USING GIN(skills);
CREATE INDEX idx_profiles_career_interests ON public.profiles USING GIN(career_interests);
CREATE INDEX idx_profiles_availability ON public.profiles(availability);

-- Update the updated_at trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();