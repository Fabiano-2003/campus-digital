
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Users, Video, Plus, Edit, Trash2, UserCheck, UserX, UserQuestion } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";

interface GroupMeeting {
  id: string;
  title: string;
  description: string;
  meeting_date: string;
  duration: number;
  location: string;
  meeting_link: string;
  meeting_type: 'online' | 'presencial' | 'hibrido';
  max_attendees: number;
  status: 'agendada' | 'cancelada' | 'concluida';
  created_by: string;
  created_at: string;
  creator_profile?: {
    full_name: string;
  };
  attendees_count?: number;
  user_attendance?: {
    status: 'confirmado' | 'talvez' | 'nao_vai';
  } | null;
}

interface MeetingAttendee {
  id: string;
  status: 'confirmado' | 'talvez' | 'nao_vai';
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
}

interface GroupMeetingsProps {
  groupId: string;
  userRole: string | null;
  isMember: boolean;
}

export function GroupMeetings({ groupId, userRole, isMember }: GroupMeetingsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<GroupMeeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<GroupMeeting | null>(null);
  const [attendees, setAttendees] = useState<MeetingAttendee[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAttendeesDialog, setShowAttendeesDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    meeting_date: "",
    meeting_time: "",
    duration: 60,
    location: "",
    meeting_link: "",
    meeting_type: "online" as const,
    max_attendees: 50
  });

  useEffect(() => {
    if (isMember) {
      fetchMeetings();
    }
  }, [groupId, isMember]);

  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from('group_meetings')
        .select(`
          *,
          creator_profile:created_by!inner(full_name),
          attendees_count:meeting_attendees(count),
          user_attendance:meeting_attendees!left(status)
        `)
        .eq('group_id', groupId)
        .eq('user_attendance.user_id', user?.id)
        .order('meeting_date', { ascending: true });

      if (error) throw error;

      const processedMeetings = data?.map(meeting => ({
        ...meeting,
        creator_profile: meeting.creator_profile[0],
        attendees_count: meeting.attendees_count?.[0]?.count || 0,
        user_attendance: meeting.user_attendance?.[0] || null
      })) || [];

      setMeetings(processedMeetings);
    } catch (error: any) {
      console.error('Error fetching meetings:', error);
      toast({
        title: "Erro ao carregar reuniões",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async (meetingId: string) => {
    try {
      const { data, error } = await supabase
        .from('meeting_attendees')
        .select(`
          *,
          profiles!inner(
            full_name,
            avatar_url
          )
        `)
        .eq('meeting_id', meetingId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setAttendees(data || []);
    } catch (error: any) {
      console.error('Error fetching attendees:', error);
      toast({
        title: "Erro ao carregar participantes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createMeeting = async () => {
    if (!newMeeting.title || !newMeeting.meeting_date || !newMeeting.meeting_time) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, data e horário da reunião.",
        variant: "destructive",
      });
      return;
    }

    try {
      const meetingDateTime = new Date(`${newMeeting.meeting_date}T${newMeeting.meeting_time}`);

      const { data, error } = await supabase
        .from('group_meetings')
        .insert({
          group_id: groupId,
          title: newMeeting.title,
          description: newMeeting.description,
          meeting_date: meetingDateTime.toISOString(),
          duration: newMeeting.duration,
          location: newMeeting.location,
          meeting_link: newMeeting.meeting_link,
          meeting_type: newMeeting.meeting_type,
          max_attendees: newMeeting.max_attendees,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Automatically add creator as attendee
      await supabase
        .from('meeting_attendees')
        .insert({
          meeting_id: data.id,
          user_id: user?.id,
          status: 'confirmado'
        });

      setShowCreateDialog(false);
      setNewMeeting({
        title: "",
        description: "",
        meeting_date: "",
        meeting_time: "",
        duration: 60,
        location: "",
        meeting_link: "",
        meeting_type: "online",
        max_attendees: 50
      });
      fetchMeetings();
      toast({
        title: "Reunião agendada!",
        description: "A reunião foi criada com sucesso.",
      });
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Erro ao criar reunião",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateAttendance = async (meetingId: string, status: 'confirmado' | 'talvez' | 'nao_vai') => {
    try {
      const { error } = await supabase
        .from('meeting_attendees')
        .upsert({
          meeting_id: meetingId,
          user_id: user?.id,
          status: status
        });

      if (error) throw error;
      fetchMeetings();
      toast({
        title: "Presença atualizada",
        description: "Sua resposta foi registrada com sucesso.",
      });
    } catch (error: any) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Erro ao atualizar presença",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const showMeetingAttendees = (meeting: GroupMeeting) => {
    setSelectedMeeting(meeting);
    fetchAttendees(meeting.id);
    setShowAttendeesDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'agendada': 'default',
      'cancelada': 'destructive',
      'concluida': 'secondary'
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const getAttendanceIcon = (status?: string) => {
    switch (status) {
      case 'confirmado': return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'nao_vai': return <UserX className="h-4 w-4 text-red-600" />;
      case 'talvez': return <UserQuestion className="h-4 w-4 text-yellow-600" />;
      default: return <UserQuestion className="h-4 w-4 text-gray-400" />;
    }
  };

  if (!isMember) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">
          Participe do grupo para ver e agendar reuniões
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-32 bg-muted rounded"></div>
      ))}
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reuniões do Grupo</h3>
        {(userRole === 'admin' || userRole === 'member') && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agendar Reunião
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Agendar Nova Reunião</DialogTitle>
                <DialogDescription>
                  Crie uma reunião para os membros do grupo
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título da Reunião *</Label>
                  <Input
                    id="title"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                    placeholder="Ex: Revisão para prova de Cálculo"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Data *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newMeeting.meeting_date}
                      onChange={(e) => setNewMeeting({...newMeeting, meeting_date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Horário *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newMeeting.meeting_time}
                      onChange={(e) => setNewMeeting({...newMeeting, meeting_time: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo de Reunião</Label>
                    <Select value={newMeeting.meeting_type} onValueChange={(value: any) => setNewMeeting({...newMeeting, meeting_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="hibrido">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duração (minutos)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newMeeting.duration}
                      onChange={(e) => setNewMeeting({...newMeeting, duration: parseInt(e.target.value) || 60})}
                      min="15"
                      max="480"
                    />
                  </div>
                </div>

                {newMeeting.meeting_type !== 'online' && (
                  <div className="grid gap-2">
                    <Label htmlFor="location">Local</Label>
                    <Input
                      id="location"
                      value={newMeeting.location}
                      onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})}
                      placeholder="Ex: Biblioteca Central, Sala 201"
                    />
                  </div>
                )}

                {newMeeting.meeting_type !== 'presencial' && (
                  <div className="grid gap-2">
                    <Label htmlFor="link">Link da Reunião</Label>
                    <Input
                      id="link"
                      value={newMeeting.meeting_link}
                      onChange={(e) => setNewMeeting({...newMeeting, meeting_link: e.target.value})}
                      placeholder="Ex: https://meet.google.com/abc-defg-hij"
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                    placeholder="Descreva o objetivo e agenda da reunião..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="maxAttendees">Máximo de Participantes</Label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    value={newMeeting.max_attendees}
                    onChange={(e) => setNewMeeting({...newMeeting, max_attendees: parseInt(e.target.value) || 50})}
                    min="5"
                    max="200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={createMeeting}>
                  Agendar Reunião
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {meetings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhuma reunião agendada ainda
            </p>
          </div>
        ) : (
          meetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{meeting.title}</h4>
                        {getStatusBadge(meeting.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Criado por {meeting.creator_profile?.full_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getAttendanceIcon(meeting.user_attendance?.status)}
                      <Badge variant="outline" className="text-xs">
                        {meeting.meeting_type}
                      </Badge>
                    </div>
                  </div>

                  {meeting.description && (
                    <p className="text-sm text-gray-700 line-clamp-2">{meeting.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(meeting.meeting_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(meeting.meeting_date), "HH:mm")} ({meeting.duration}min)</span>
                    </div>
                    {meeting.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{meeting.location}</span>
                      </div>
                    )}
                    {meeting.meeting_link && (
                      <div className="flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        <a 
                          href={meeting.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                        >
                          Link da reunião
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showMeetingAttendees(meeting)}
                      className="flex items-center gap-1"
                    >
                      <Users className="h-3 w-3" />
                      {meeting.attendees_count} participantes
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant={meeting.user_attendance?.status === 'confirmado' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateAttendance(meeting.id, 'confirmado')}
                      >
                        <UserCheck className="h-3 w-3 mr-1" />
                        Vou
                      </Button>
                      <Button
                        variant={meeting.user_attendance?.status === 'talvez' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateAttendance(meeting.id, 'talvez')}
                      >
                        <UserQuestion className="h-3 w-3 mr-1" />
                        Talvez
                      </Button>
                      <Button
                        variant={meeting.user_attendance?.status === 'nao_vai' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => updateAttendance(meeting.id, 'nao_vai')}
                      >
                        <UserX className="h-3 w-3 mr-1" />
                        Não vou
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog para mostrar participantes */}
      <Dialog open={showAttendeesDialog} onOpenChange={setShowAttendeesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Participantes da Reunião</DialogTitle>
            <DialogDescription>
              {selectedMeeting?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {attendees.map((attendee) => (
              <div key={attendee.id} className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {attendee.profiles.full_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{attendee.profiles.full_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getAttendanceIcon(attendee.status)}
                  <Badge variant="outline" className="text-xs">
                    {attendee.status === 'confirmado' ? 'Confirmado' :
                     attendee.status === 'talvez' ? 'Talvez' : 'Não vai'}
                  </Badge>
                </div>
              </div>
            ))}
            {attendees.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Nenhum participante ainda
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
