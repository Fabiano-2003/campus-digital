import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Users, MessageCircle, Calendar } from "lucide-react";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  level: string;
  institution: string;
  max_members: number;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
}

export default function Groups() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          group_members(count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const groupsWithCounts = data?.map(group => ({
        ...group,
        member_count: group.group_members?.[0]?.count || 0
      })) || [];

      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Erro ao carregar grupos",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert([{
          group_id: groupId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          role: 'member'
        }]);

      if (error) throw error;

      toast({
        title: "Entrou no grupo!",
        description: "Você agora faz parte deste grupo de estudo.",
      });

      fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Erro ao entrar no grupo",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded-full w-16"></div>
                    <div className="h-6 bg-muted rounded-full w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Grupos de Estudo</h1>
            <p className="text-muted-foreground">
              Conecte-se com outros estudantes e aprenda em grupo
            </p>
          </div>
          <Button onClick={() => navigate('/create-group')} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Criar Grupo
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar grupos por nome, matéria ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredGroups.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum grupo encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Tente usar outros termos de busca" : "Seja o primeiro a criar um grupo de estudo!"}
              </p>
              <Button onClick={() => navigate('/create-group')}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Grupo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{group.name}</CardTitle>
                      <p className="text-muted-foreground mb-4">
                        {group.description || "Grupo de estudo colaborativo"}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">{group.subject}</Badge>
                        <Badge variant="outline">{group.level}</Badge>
                        {group.institution && (
                          <Badge variant="outline">{group.institution}</Badge>
                        )}
                      </div>
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {group.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{group.member_count || 0}/{group.max_members} membros</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Criado em {new Date(group.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/groups/${group.id}`)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Ver Grupo
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => joinGroup(group.id)}
                        disabled={group.member_count >= group.max_members}
                      >
                        Participar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}