import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, MessageCircle, Plus, Search, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export function StudyGroups() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form state for creating group
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    subject: "",
    level: "",
    institution: "",
    max_members: 50
  });

  // Buscar grupos de estudo
  const { data: studyGroups, isLoading } = useQuery({
    queryKey: ['study-groups', searchQuery, selectedSubject, selectedLevel],
    queryFn: async () => {
      let query = supabase
        .from('study_groups')
        .select(`
          *,
          group_members(count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (selectedSubject !== "all") {
        query = query.eq('subject', selectedSubject);
      }

      if (selectedLevel !== "all") {
        query = query.eq('level', selectedLevel);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    }
  });

  // Criar grupo de estudo
  const createGroupMutation = useMutation({
    mutationFn: async (groupData: typeof newGroup) => {
      const { data, error } = await supabase
        .from('study_groups')
        .insert({
          ...groupData,
          created_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-groups'] });
      setIsCreating(false);
      setNewGroup({
        name: "",
        description: "",
        subject: "",
        level: "",
        institution: "",
        max_members: 50
      });
      toast.success("Grupo criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar grupo. Tente novamente.");
    }
  });

  // Participar de grupo
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const { data, error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user?.id,
          role: 'member'
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-groups'] });
      toast.success("Você entrou no grupo!");
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error("Você já faz parte deste grupo!");
      } else {
        toast.error("Erro ao entrar no grupo. Tente novamente.");
      }
    }
  });

  const subjects = [
    "Matemática", "Física", "Química", "Biologia", "História", "Geografia",
    "Português", "Literatura", "Filosofia", "Sociologia", "Direito", "Medicina",
    "Engenharia", "Informática", "Administração", "Psicologia", "Pedagogia"
  ];

  const levels = ["Ensino Médio", "Graduação", "Pós-graduação", "Mestrado", "Doutorado"];

  const handleCreateGroup = () => {
    if (!newGroup.name || !newGroup.subject || !newGroup.level) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }
    createGroupMutation.mutate(newGroup);
  };

  const handleJoinGroup = (groupId: string) => {
    joinGroupMutation.mutate(groupId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Grupos de Estudo</CardTitle>
          <CardDescription>
            Encontre e participe de grupos de estudo ou crie o seu próprio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar grupos por nome, matéria ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Matéria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as matérias</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject.toLowerCase()}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level} value={level.toLowerCase()}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Grupo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Criar Novo Grupo de Estudo</DialogTitle>
                  <DialogDescription>
                    Preencha as informações para criar seu grupo de estudo
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Grupo *</Label>
                    <Input
                      id="name"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                      placeholder="Ex: Estudo de Cálculo I"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Matéria *</Label>
                    <Select value={newGroup.subject} onValueChange={(value) => setNewGroup({...newGroup, subject: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a matéria" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject.toLowerCase()}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="level">Nível *</Label>
                    <Select value={newGroup.level} onValueChange={(value) => setNewGroup({...newGroup, level: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level} value={level.toLowerCase()}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="institution">Instituição</Label>
                    <Input
                      id="institution"
                      value={newGroup.institution}
                      onChange={(e) => setNewGroup({...newGroup, institution: e.target.value})}
                      placeholder="Ex: USP, UNICAMP, UFRJ..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                      placeholder="Descreva os objetivos e metodologia do grupo..."
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxMembers">Máximo de Membros</Label>
                    <Input
                      id="maxMembers"
                      type="number"
                      value={newGroup.max_members}
                      onChange={(e) => setNewGroup({...newGroup, max_members: parseInt(e.target.value) || 50})}
                      min="5"
                      max="100"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateGroup} disabled={createGroupMutation.isPending}>
                    Criar Grupo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Groups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studyGroups?.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg line-clamp-2">{group.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {group.institution || "Instituição não informada"}
                  </p>
                </div>

                {group.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {group.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{group.subject}</Badge>
                  <Badge variant="outline">{group.level}</Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {group.group_members?.[0]?.count || 0}/{group.max_members} membros
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(group.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={() => handleJoinGroup(group.id)}
                    disabled={joinGroupMutation.isPending}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Participar
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {studyGroups?.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Nenhum grupo encontrado com os filtros selecionados.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Grupo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}