
-- Criar tabelas para livros e documentos
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  cover_url TEXT,
  category TEXT NOT NULL,
  institution TEXT,
  subject TEXT,
  file_size BIGINT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Criar tabela para monografias
CREATE TABLE public.monographs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  abstract TEXT,
  file_url TEXT NOT NULL,
  category TEXT NOT NULL,
  institution TEXT NOT NULL,
  course TEXT,
  advisor TEXT,
  publication_year INTEGER,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Criar tabela para grupos de estudo
CREATE TABLE public.study_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  level TEXT NOT NULL,
  institution TEXT,
  max_members INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Criar tabela para membros dos grupos
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Criar tabela para mensagens dos grupos
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para documentos gerados
CREATE TABLE public.generated_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  content JSONB,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para posts do feed
CREATE TABLE public.feed_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'text',
  metadata JSONB,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para likes em posts
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Criar tabela para comentários em posts
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monographs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para books (todos podem ver, só donos podem modificar)
CREATE POLICY "Anyone can view books" ON public.books FOR SELECT USING (true);
CREATE POLICY "Users can upload books" ON public.books FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users can update their books" ON public.books FOR UPDATE USING (auth.uid() = uploaded_by);
CREATE POLICY "Users can delete their books" ON public.books FOR DELETE USING (auth.uid() = uploaded_by);

-- Políticas RLS para monographs
CREATE POLICY "Anyone can view monographs" ON public.monographs FOR SELECT USING (true);
CREATE POLICY "Users can upload monographs" ON public.monographs FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users can update their monographs" ON public.monographs FOR UPDATE USING (auth.uid() = uploaded_by);
CREATE POLICY "Users can delete their monographs" ON public.monographs FOR DELETE USING (auth.uid() = uploaded_by);

-- Políticas RLS para study_groups
CREATE POLICY "Anyone can view study groups" ON public.study_groups FOR SELECT USING (true);
CREATE POLICY "Users can create study groups" ON public.study_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Group creators can update their groups" ON public.study_groups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Group creators can delete their groups" ON public.study_groups FOR DELETE USING (auth.uid() = created_by);

-- Políticas RLS para group_members
CREATE POLICY "Anyone can view group members" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para group_messages
CREATE POLICY "Group members can view messages" ON public.group_messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = group_messages.group_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Group members can send messages" ON public.group_messages 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = group_messages.group_id AND user_id = auth.uid()
    )
  );

-- Políticas RLS para generated_documents
CREATE POLICY "Users can view their documents" ON public.generated_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create documents" ON public.generated_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their documents" ON public.generated_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their documents" ON public.generated_documents FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para feed_posts
CREATE POLICY "Anyone can view feed posts" ON public.feed_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.feed_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their posts" ON public.feed_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their posts" ON public.feed_posts FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para post_likes
CREATE POLICY "Anyone can view post likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their likes" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para post_comments
CREATE POLICY "Anyone can view comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their comments" ON public.post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their comments" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX idx_books_category ON public.books(category);
CREATE INDEX idx_books_subject ON public.books(subject);
CREATE INDEX idx_monographs_category ON public.monographs(category);
CREATE INDEX idx_monographs_institution ON public.monographs(institution);
CREATE INDEX idx_study_groups_subject ON public.study_groups(subject);
CREATE INDEX idx_group_messages_group_id ON public.group_messages(group_id);
CREATE INDEX idx_feed_posts_created_at ON public.feed_posts(created_at DESC);

-- Triggers para atualizar campos updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_monographs_updated_at BEFORE UPDATE ON public.monographs
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON public.study_groups
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_generated_documents_updated_at BEFORE UPDATE ON public.generated_documents
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_feed_posts_updated_at BEFORE UPDATE ON public.feed_posts
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
