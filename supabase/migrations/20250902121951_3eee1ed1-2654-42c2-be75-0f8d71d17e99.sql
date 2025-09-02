-- Create institutions table
CREATE TABLE public.institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  institution_type TEXT NOT NULL DEFAULT 'university', -- university, college, training_center, technical_school
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Brasil',
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  established_year INTEGER,
  student_count INTEGER,
  faculty_count INTEGER,
  accreditation TEXT[], -- array of accreditations
  programs TEXT[], -- array of programs offered
  facilities TEXT[], -- array of facilities
  rating DECIMAL(3,2) DEFAULT 0.0, -- rating out of 5
  reviews_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  social_media JSONB, -- social media links
  metadata JSONB, -- additional metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

-- Create policies for institutions
CREATE POLICY "Anyone can view institutions" 
ON public.institutions 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create institutions" 
ON public.institutions 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their institutions" 
ON public.institutions 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Create institution reviews table
CREATE TABLE public.institution_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for reviews
ALTER TABLE public.institution_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
CREATE POLICY "Anyone can view reviews" 
ON public.institution_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews" 
ON public.institution_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their reviews" 
ON public.institution_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their reviews" 
ON public.institution_reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_institutions_updated_at
BEFORE UPDATE ON public.institutions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institution_reviews_updated_at
BEFORE UPDATE ON public.institution_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add institutions to realtime
ALTER TABLE public.institutions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.institutions;

ALTER TABLE public.institution_reviews REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.institution_reviews;

-- Insert some sample institutions
INSERT INTO public.institutions (name, description, institution_type, city, state, country, established_year, student_count, programs) VALUES
('Universidade de São Paulo', 'A maior universidade pública do Brasil, reconhecida internacionalmente pela excelência em ensino e pesquisa.', 'university', 'São Paulo', 'SP', 'Brasil', 1934, 90000, ARRAY['Medicina', 'Engenharia', 'Direito', 'Economia', 'Letras', 'Ciências Biológicas']),
('Universidade Federal do Rio de Janeiro', 'Uma das principais universidades federais do Brasil, com forte tradição em pesquisa e inovação.', 'university', 'Rio de Janeiro', 'RJ', 'Brasil', 1792, 67000, ARRAY['Medicina', 'Engenharia', 'Arquitetura', 'Comunicação Social', 'História', 'Filosofia']),
('Instituto Tecnológico de Aeronáutica', 'Referência mundial em engenharia aeronáutica e tecnologia avançada.', 'technical_school', 'São José dos Campos', 'SP', 'Brasil', 1950, 1200, ARRAY['Engenharia Aeronáutica', 'Engenharia Eletrônica', 'Engenharia da Computação', 'Engenharia Mecânica']),
('SENAI - Serviço Nacional de Aprendizagem Industrial', 'Principal instituição de educação profissional e tecnológica do país.', 'training_center', 'São Paulo', 'SP', 'Brasil', 1942, 2500000, ARRAY['Mecânica Industrial', 'Eletrônica', 'Informática', 'Soldagem', 'Automação Industrial']);