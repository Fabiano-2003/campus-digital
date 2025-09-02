-- Verificar se todas as tabelas necessárias existem e criar triggers que podem estar faltando

-- Criar função para atualizar updated_at se não existir
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para updated_at em todas as tabelas que precisam
DO $$
BEGIN
    -- Trigger para books
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_books_updated_at') THEN
        CREATE TRIGGER update_books_updated_at 
        BEFORE UPDATE ON public.books
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Trigger para monographs
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_monographs_updated_at') THEN
        CREATE TRIGGER update_monographs_updated_at 
        BEFORE UPDATE ON public.monographs
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Trigger para study_groups
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_study_groups_updated_at') THEN
        CREATE TRIGGER update_study_groups_updated_at 
        BEFORE UPDATE ON public.study_groups
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Trigger para generated_documents
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_generated_documents_updated_at') THEN
        CREATE TRIGGER update_generated_documents_updated_at 
        BEFORE UPDATE ON public.generated_documents
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Trigger para feed_posts
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_feed_posts_updated_at') THEN
        CREATE TRIGGER update_feed_posts_updated_at 
        BEFORE UPDATE ON public.feed_posts
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Trigger para post_comments
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_post_comments_updated_at') THEN
        CREATE TRIGGER update_post_comments_updated_at 
        BEFORE UPDATE ON public.post_comments
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Inserir dados de exemplo para teste
INSERT INTO public.books (title, author, category, subject, description, institution) VALUES
('Cálculo I - Fundamentos', 'Maria Silva', 'matematica', 'Cálculo', 'Livro introdutório de cálculo diferencial e integral', 'USP'),
('Introdução à Programação', 'João Santos', 'informatica', 'Programação', 'Conceitos básicos de programação em Python', 'UNICAMP'),
('Química Orgânica Básica', 'Ana Costa', 'quimica', 'Química Orgânica', 'Fundamentos da química orgânica', 'UFRJ')
ON CONFLICT DO NOTHING;

INSERT INTO public.study_groups (name, description, subject, level, institution) VALUES
('Grupo de Estudo - Cálculo I', 'Grupo para estudar cálculo diferencial e integral', 'Matemática', 'Graduação', 'USP'),
('Python para Iniciantes', 'Aprendendo programação Python do zero', 'Programação', 'Graduação', 'UNICAMP'),
('Química Orgânica Avançada', 'Discussões sobre química orgânica avançada', 'Química', 'Pós-graduação', 'UFRJ')
ON CONFLICT DO NOTHING;

-- Verificar e criar índices se não existirem
DO $$
BEGIN
    -- Índices para melhor performance
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_books_category') THEN
        CREATE INDEX idx_books_category ON public.books(category);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_books_subject') THEN
        CREATE INDEX idx_books_subject ON public.books(subject);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_monographs_category') THEN
        CREATE INDEX idx_monographs_category ON public.monographs(category);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_study_groups_subject') THEN
        CREATE INDEX idx_study_groups_subject ON public.study_groups(subject);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_group_messages_group_id') THEN
        CREATE INDEX idx_group_messages_group_id ON public.group_messages(group_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_feed_posts_created_at') THEN
        CREATE INDEX idx_feed_posts_created_at ON public.feed_posts(created_at DESC);
    END IF;
END $$;