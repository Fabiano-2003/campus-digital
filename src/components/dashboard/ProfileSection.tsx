import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserStats } from "@/components/ui/user-stats";
import { User, Mail, Phone, MapPin, GraduationCap, Award, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";

export function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar perfil do usuário
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    },
    enabled: !!user
  });

  // Estado do formulário
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    location: '',
    website: '',
    institution: '',
    course: '',
    academic_level: '',
    student_id: '',
    province: ''
  });

  // Atualizar estado quando o perfil for carregado
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: profile.location || '',
        website: profile.website || '',
        institution: profile.institution || '',
        course: profile.course || '',
        academic_level: profile.academic_level || '',
        student_id: profile.student_id || '',
        province: profile.province || ''
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.user_metadata?.full_name || user.email || ''
      }));
    }
  }, [profile, user]);

  // Atualizar/Criar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (profile) {
        // Atualizar perfil existente
        const { data: updated, error } = await supabase
          .from('profiles')
          .update(data)
          .eq('id', user?.id)
          .select()
          .single();
        
        if (error) throw error;
        return updated;
      } else {
        // Criar novo perfil
        const { data: created, error } = await supabase
          .from('profiles')
          .insert({
            id: user?.id,
            ...data
          })
          .select()
          .single();
        
        if (error) throw error;
        return created;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil. Tente novamente.");
    }
  });

  // Buscar estatísticas do usuário
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const [booksUploaded, monographsUploaded, groupsJoined, documentsCreated] = await Promise.all([
        supabase.from('books').select('*', { count: 'exact', head: true }).eq('uploaded_by', user?.id),
        supabase.from('monographs').select('*', { count: 'exact', head: true }).eq('uploaded_by', user?.id),
        supabase.from('group_members').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('generated_documents').select('*', { count: 'exact', head: true }).eq('user_id', user?.id)
      ]);

      return {
        books: booksUploaded.count || 0,
        monographs: monographsUploaded.count || 0,
        groups: groupsJoined.count || 0,
        documents: documentsCreated.count || 0
      };
    },
    enabled: !!user
  });

  const provinces = [
    "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal",
    "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul",
    "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí",
    "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia",
    "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"
  ];

  const academicLevels = [
    "Ensino Médio", "Técnico", "Graduação", "Pós-graduação", "Especialização",
    "Mestrado", "Doutorado", "Pós-doutorado"
  ];

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: profile.location || '',
        website: profile.website || '',
        institution: profile.institution || '',
        course: profile.course || '',
        academic_level: profile.academic_level || '',
        student_id: profile.student_id || '',
        province: profile.province || ''
      });
    }
    setIsEditing(false);
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
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="academic">Dados Acadêmicos</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Perfil do Usuário</CardTitle>
                  <CardDescription>
                    Gerencie suas informações pessoais e de contato
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} size="sm" disabled={updateProfileMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {formData.full_name?.[0] || user?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="full_name">Nome Completo</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio">Biografia</Label>
                          <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            placeholder="Conte um pouco sobre você..."
                            rows={3}
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-2xl font-bold">{formData.full_name || user?.email}</h3>
                        <p className="text-muted-foreground">{user?.email}</p>
                        {formData.bio && (
                          <p className="mt-2 text-sm">{formData.bio}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefone
                    </Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="(11) 99999-9999"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.phone || "Não informado"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Localização
                    </Label>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          placeholder="Cidade"
                          className="flex-1"
                        />
                        <Select value={formData.province} onValueChange={(value) => setFormData({...formData, province: value})}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces.map((province) => (
                              <SelectItem key={province} value={province}>
                                {province}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.location && formData.province 
                          ? `${formData.location}, ${formData.province}`
                          : formData.location || formData.province || "Não informado"
                        }
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="website">Website/LinkedIn</Label>
                    {isEditing ? (
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="https://..."
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.website ? (
                          <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {formData.website}
                          </a>
                        ) : (
                          "Não informado"
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>Dados Acadêmicos</CardTitle>
              <CardDescription>
                Informações sobre sua vida acadêmica e estudos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="institution">Instituição de Ensino</Label>
                    {isEditing ? (
                      <Input
                        id="institution"
                        value={formData.institution}
                        onChange={(e) => setFormData({...formData, institution: e.target.value})}
                        placeholder="Ex: USP, UNICAMP, UFRJ..."
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.institution || "Não informado"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="course">Curso</Label>
                    {isEditing ? (
                      <Input
                        id="course"
                        value={formData.course}
                        onChange={(e) => setFormData({...formData, course: e.target.value})}
                        placeholder="Ex: Engenharia, Medicina, Direito..."
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.course || "Não informado"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="academic_level">Nível Acadêmico</Label>
                    {isEditing ? (
                      <Select value={formData.academic_level} onValueChange={(value) => setFormData({...formData, academic_level: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.academic_level || "Não informado"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="student_id">Número de Matrícula</Label>
                    {isEditing ? (
                      <Input
                        id="student_id"
                        value={formData.student_id}
                        onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                        placeholder="Número da matrícula"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.student_id || "Não informado"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Conquistas e Estatísticas</CardTitle>
              <CardDescription>
                Seu progresso e contribuições na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <UserStats userId={user?.id || ''} className="justify-center" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{userStats?.books || 0}</div>
                  <p className="text-sm text-muted-foreground">Livros Enviados</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{userStats?.monographs || 0}</div>
                  <p className="text-sm text-muted-foreground">Monografias</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{userStats?.groups || 0}</div>
                  <p className="text-sm text-muted-foreground">Grupos Participando</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{userStats?.documents || 0}</div>
                  <p className="text-sm text-muted-foreground">Documentos Criados</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Medalhas e Conquistas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userStats?.books && userStats.books > 0 && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="text-2xl">📚</div>
                      <div>
                        <p className="font-medium">Colaborador</p>
                        <p className="text-sm text-muted-foreground">Enviou seu primeiro livro</p>
                      </div>
                    </div>
                  )}
                  
                  {userStats?.groups && userStats.groups > 0 && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="text-2xl">👥</div>
                      <div>
                        <p className="font-medium">Participativo</p>
                        <p className="text-sm text-muted-foreground">Entrou em um grupo de estudo</p>
                      </div>
                    </div>
                  )}

                  {userStats?.documents && userStats.documents > 0 && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="text-2xl">📄</div>
                      <div>
                        <p className="font-medium">Criativo</p>
                        <p className="text-sm text-muted-foreground">Gerou seu primeiro documento</p>
                      </div>
                    </div>
                  )}

                  {(!userStats?.books && !userStats?.groups && !userStats?.documents) && (
                    <div className="col-span-2 text-center py-6">
                      <Award className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Comece a usar a plataforma para ganhar suas primeiras conquistas!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}