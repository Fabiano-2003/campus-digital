-- Criar bucket para documentos se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas de storage para documentos
CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Criar tabela para conversas privadas
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

-- Criar tabela para mensagens privadas
CREATE TABLE IF NOT EXISTS public.private_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para conversas
CREATE POLICY "Users can view their conversations" 
ON public.conversations 
FOR SELECT 
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Políticas RLS para mensagens privadas
CREATE POLICY "Users can view their private messages" 
ON public.private_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  )
);

CREATE POLICY "Users can send private messages" 
ON public.private_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_private_messages_conversation ON public.private_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_created_at ON public.private_messages(created_at DESC);

-- Configurar real-time para as novas tabelas
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.private_messages REPLICA IDENTITY FULL;

-- Adicionar à publicação real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_messages;

-- Trigger para atualizar updated_at em conversas
CREATE TRIGGER update_conversations_updated_at 
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();