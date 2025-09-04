
-- Criar tabela para reuniões dos grupos
CREATE TABLE public.group_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 60, -- duração em minutos
  location TEXT,
  meeting_link TEXT, -- link para reunião online
  meeting_type TEXT DEFAULT 'online' CHECK (meeting_type IN ('online', 'presencial', 'hibrido')),
  max_attendees INTEGER,
  status TEXT DEFAULT 'agendada' CHECK (status IN ('agendada', 'cancelada', 'concluida')),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para participantes das reuniões
CREATE TABLE public.meeting_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES public.group_meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'talvez', 'nao_vai')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(meeting_id, user_id)
);

-- Criar índices
CREATE INDEX idx_group_meetings_group_id ON public.group_meetings(group_id);
CREATE INDEX idx_group_meetings_date ON public.group_meetings(meeting_date);
CREATE INDEX idx_meeting_attendees_meeting_id ON public.meeting_attendees(meeting_id);
CREATE INDEX idx_meeting_attendees_user_id ON public.meeting_attendees(user_id);

-- RLS
ALTER TABLE public.group_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendees ENABLE ROW LEVEL SECURITY;

-- Políticas para group_meetings
CREATE POLICY "Group members can view meetings" ON public.group_meetings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_meetings.group_id 
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can create meetings" ON public.group_meetings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_meetings.group_id 
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
  );

CREATE POLICY "Meeting creators and admins can update meetings" ON public.group_meetings
  FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_meetings.group_id 
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
  );

-- Políticas para meeting_attendees
CREATE POLICY "Users can view attendees of meetings they can see" ON public.meeting_attendees
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_meetings gm
      JOIN public.group_members gmem ON gmem.group_id = gm.group_id
      WHERE gm.id = meeting_attendees.meeting_id 
      AND gmem.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own attendance" ON public.meeting_attendees
  FOR ALL
  USING (user_id = auth.uid());

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_group_meetings_updated_at BEFORE UPDATE ON public.group_meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
