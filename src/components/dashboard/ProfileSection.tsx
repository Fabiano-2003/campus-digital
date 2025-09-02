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
import { User, Mail, Phone, MapPin, GraduationCap, Award, Edit, Save, X, Briefcase, FileText, Plus, Trash2, ExternalLink, Github, Linkedin, Globe } from "lucide-react";
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

  // Estado do formulário completo
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
    province: '',
    title: '',
    summary: '',
    skills: [] as string[],
    languages: [] as string[],
    portfolio_url: '',
    linkedin_url: '',
    github_url: '',
    birth_date: '',
    gender: '',
    availability: 'available',
    preferred_work_type: '',
    salary_expectation: '',
    career_interests: [] as string[],
    work_experience: [] as Array<{
      company: string;
      position: string;
      start_date: string;
      end_date?: string;
      description: string;
      current: boolean;
    }>,
    education: [] as Array<{
      institution: string;
      degree: string;
      field: string;
      start_date: string;
      end_date?: string;
      current: boolean;
      description?: string;
    }>,
    certifications: [] as Array<{
      name: string;
      issuer: string;
      date: string;
      expiry_date?: string;
      credential_id?: string;
      url?: string;
    }>,
    projects: [] as Array<{
      name: string;
      description: string;
      technologies: string[];
      start_date: string;
      end_date?: string;
      url?: string;
      github_url?: string;
    }>
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
        province: profile.province || '',
        title: profile.title || '',
        summary: profile.summary || '',
        skills: profile.skills || [],
        languages: profile.languages || [],
        portfolio_url: profile.portfolio_url || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || '',
        availability: profile.availability || 'available',
        preferred_work_type: profile.preferred_work_type || '',
        salary_expectation: profile.salary_expectation || '',
        career_interests: profile.career_interests || [],
        work_experience: (profile.work_experience as any) || [],
        education: (profile.education as any) || [],
        certifications: (profile.certifications as any) || [],
        projects: (profile.projects as any) || []
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

  const genderOptions = ["Masculino", "Feminino", "Não-binário", "Prefiro não informar"];
  const availabilityOptions = ["available", "busy", "unavailable"];
  const workTypeOptions = ["Remoto", "Presencial", "Híbrido", "Freelancer", "CLT", "PJ"];

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
        province: profile.province || '',
        title: profile.title || '',
        summary: profile.summary || '',
        skills: profile.skills || [],
        languages: profile.languages || [],
        portfolio_url: profile.portfolio_url || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || '',
        availability: profile.availability || 'available',
        preferred_work_type: profile.preferred_work_type || '',
        salary_expectation: profile.salary_expectation || '',
        career_interests: profile.career_interests || [],
        work_experience: (profile.work_experience as any) || [],
        education: (profile.education as any) || [],
        certifications: (profile.certifications as any) || [],
        projects: (profile.projects as any) || []
      });
    }
    setIsEditing(false);
  };

  // Helper functions for arrays
  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({...formData, skills: [...formData.skills, skill]});
    }
  };

  const removeSkill = (index: number) => {
    setFormData({...formData, skills: formData.skills.filter((_, i) => i !== index)});
  };

  const addLanguage = (language: string) => {
    if (language && !formData.languages.includes(language)) {
      setFormData({...formData, languages: [...formData.languages, language]});
    }
  };

  const removeLanguage = (index: number) => {
    setFormData({...formData, languages: formData.languages.filter((_, i) => i !== index)});
  };

  const addCareerInterest = (interest: string) => {
    if (interest && !formData.career_interests.includes(interest)) {
      setFormData({...formData, career_interests: [...formData.career_interests, interest]});
    }
  };

  const removeCareerInterest = (index: number) => {
    setFormData({...formData, career_interests: formData.career_interests.filter((_, i) => i !== index)});
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="professional">Profissional</TabsTrigger>
          <TabsTrigger value="experience">Experiência</TabsTrigger>
          <TabsTrigger value="education">Educação</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
        </TabsList>

        <div className="flex justify-end mb-4">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
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

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Suas informações básicas e de contato</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-3xl">
                      {formData.full_name?.[0] || user?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="full_name">Nome Completo</Label>
                        {isEditing ? (
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          />
                        ) : (
                          <p className="text-lg font-semibold">{formData.full_name || user?.email}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="title">Título Profissional</Label>
                        {isEditing ? (
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="Ex: Desenvolvedor Full Stack, Estudante de Medicina..."
                          />
                        ) : (
                          <p className="text-muted-foreground">{formData.title || "Título não informado"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <Label htmlFor="summary">Resumo Profissional</Label>
                  {isEditing ? (
                    <Textarea
                      id="summary"
                      value={formData.summary}
                      onChange={(e) => setFormData({...formData, summary: e.target.value})}
                      placeholder="Escreva um resumo sobre sua experiência e objetivos profissionais..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm mt-1">{formData.summary || "Resumo não informado"}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio">Biografia Pessoal</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Conte um pouco sobre você, seus hobbies, interesses..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm mt-1">{formData.bio || "Biografia não informada"}</p>
                  )}
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
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    {isEditing ? (
                      <Input
                        id="birth_date"
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.birth_date ? new Date(formData.birth_date).toLocaleDateString('pt-BR') : "Não informado"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gender">Gênero</Label>
                    {isEditing ? (
                      <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.gender || "Não informado"}
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
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="portfolio_url" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Portfolio
                    </Label>
                    {isEditing ? (
                      <Input
                        id="portfolio_url"
                        value={formData.portfolio_url}
                        onChange={(e) => setFormData({...formData, portfolio_url: e.target.value})}
                        placeholder="https://meuportfolio.com"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.portfolio_url ? (
                          <a href={formData.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                            {formData.portfolio_url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          "Não informado"
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Label>
                    {isEditing ? (
                      <Input
                        id="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                        placeholder="https://linkedin.com/in/..."
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.linkedin_url ? (
                          <a href={formData.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                            {formData.linkedin_url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          "Não informado"
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="github_url" className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </Label>
                    {isEditing ? (
                      <Input
                        id="github_url"
                        value={formData.github_url}
                        onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                        placeholder="https://github.com/..."
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.github_url ? (
                          <a href={formData.github_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                            {formData.github_url}
                            <ExternalLink className="h-3 w-3" />
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

        <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle>Informações Profissionais</CardTitle>
              <CardDescription>Suas habilidades, idiomas e preferências de trabalho</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Professional Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="availability">Disponibilidade</Label>
                    {isEditing ? (
                      <Select value={formData.availability} onValueChange={(value) => setFormData({...formData, availability: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Disponível</SelectItem>
                          <SelectItem value="busy">Ocupado</SelectItem>
                          <SelectItem value="unavailable">Indisponível</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={formData.availability === 'available' ? 'default' : formData.availability === 'busy' ? 'secondary' : 'destructive'}>
                        {formData.availability === 'available' ? 'Disponível' : 
                         formData.availability === 'busy' ? 'Ocupado' : 'Indisponível'}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="preferred_work_type">Tipo de Trabalho Preferido</Label>
                    {isEditing ? (
                      <Select value={formData.preferred_work_type} onValueChange={(value) => setFormData({...formData, preferred_work_type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {workTypeOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.preferred_work_type || "Não informado"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="salary_expectation">Expectativa Salarial</Label>
                    {isEditing ? (
                      <Input
                        id="salary_expectation"
                        value={formData.salary_expectation}
                        onChange={(e) => setFormData({...formData, salary_expectation: e.target.value})}
                        placeholder="Ex: R$ 5.000 - R$ 8.000"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.salary_expectation || "Não informado"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <Label>Habilidades</Label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite uma habilidade e pressione Enter"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkill(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(index)}
                              className="ml-1 text-xs hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.skills.length > 0 ? (
                        formData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma habilidade cadastrada</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Languages */}
                <div>
                  <Label>Idiomas</Label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite um idioma e pressione Enter"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addLanguage(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.languages.map((language, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {language}
                            <button
                              type="button"
                              onClick={() => removeLanguage(index)}
                              className="ml-1 text-xs hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.languages.length > 0 ? (
                        formData.languages.map((language, index) => (
                          <Badge key={index} variant="outline">{language}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum idioma cadastrado</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Career Interests */}
                <div>
                  <Label>Interesses Profissionais</Label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite um interesse e pressione Enter"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCareerInterest(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.career_interests.map((interest, index) => (
                          <Badge key={index} variant="default" className="flex items-center gap-1">
                            {interest}
                            <button
                              type="button"
                              onClick={() => removeCareerInterest(index)}
                              className="ml-1 text-xs hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.career_interests.length > 0 ? (
                        formData.career_interests.map((interest, index) => (
                          <Badge key={index} variant="default">{interest}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum interesse cadastrado</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle>Experiência Profissional</CardTitle>
              <CardDescription>Seu histórico de trabalho e experiências</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.work_experience.length > 0 ? (
                  formData.work_experience.map((exp, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{exp.position}</h4>
                          <p className="text-muted-foreground">{exp.company}</p>
                          <p className="text-sm text-muted-foreground">
                            {exp.start_date} - {exp.current ? 'Atual' : exp.end_date}
                          </p>
                          <p className="text-sm mt-2">{exp.description}</p>
                        </div>
                        {exp.current && (
                          <Badge variant="default">Atual</Badge>
                        )}
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma experiência profissional cadastrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Educação</CardTitle>
              <CardDescription>Sua formação acadêmica e cursos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Academic Info */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-4">Informações Acadêmicas Atuais</h4>
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
                </Card>

                {/* Additional Education */}
                {formData.education.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Histórico Educacional</h4>
                    {formData.education.map((edu, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{edu.degree} em {edu.field}</h4>
                            <p className="text-muted-foreground">{edu.institution}</p>
                            <p className="text-sm text-muted-foreground">
                              {edu.start_date} - {edu.current ? 'Atual' : edu.end_date}
                            </p>
                            {edu.description && (
                              <p className="text-sm mt-2">{edu.description}</p>
                            )}
                          </div>
                          {edu.current && (
                            <Badge variant="default">Atual</Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {formData.certifications.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Certificações</h4>
                    {formData.certifications.map((cert, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{cert.name}</h4>
                            <p className="text-muted-foreground">{cert.issuer}</p>
                            <p className="text-sm text-muted-foreground">
                              Emitido em: {cert.date}
                              {cert.expiry_date && ` • Expira em: ${cert.expiry_date}`}
                            </p>
                            {cert.credential_id && (
                              <p className="text-xs text-muted-foreground mt-1">
                                ID: {cert.credential_id}
                              </p>
                            )}
                          </div>
                          {cert.url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={cert.url} target="_blank" rel="noopener noreferrer">
                                Ver Certificado
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Projetos</CardTitle>
              <CardDescription>Seus projetos pessoais e profissionais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.projects.length > 0 ? (
                  formData.projects.map((project, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{project.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {project.start_date} - {project.end_date || 'Em andamento'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {project.url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={project.url} target="_blank" rel="noopener noreferrer">
                                  Ver Projeto
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            )}
                            {project.github_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                  <Github className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm">{project.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, techIndex) => (
                            <Badge key={techIndex} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum projeto cadastrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Conquistas e Estatísticas</CardTitle>
              <CardDescription>Seu progresso e contribuições na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="mb-6">
                  <UserStats userId={user?.id || ''} className="justify-center" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{userStats?.books || 0}</div>
                    <p className="text-sm text-muted-foreground">Livros Enviados</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{userStats?.monographs || 0}</div>
                    <p className="text-sm text-muted-foreground">Monografias</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{userStats?.groups || 0}</div>
                    <p className="text-sm text-muted-foreground">Grupos</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{userStats?.documents || 0}</div>
                    <p className="text-sm text-muted-foreground">Documentos</p>
                  </div>
                </div>

                {/* Achievement Badges */}
                <div>
                  <h4 className="font-semibold mb-4">Conquistas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(userStats?.books || 0) >= 5 && (
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Award className="h-8 w-8 text-yellow-500" />
                        <div>
                          <p className="font-medium">Bibliófilo</p>
                          <p className="text-sm text-muted-foreground">Compartilhou 5+ livros</p>
                        </div>
                      </div>
                    )}
                    
                    {(userStats?.monographs || 0) >= 1 && (
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <GraduationCap className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">Acadêmico</p>
                          <p className="text-sm text-muted-foreground">Compartilhou uma monografia</p>
                        </div>
                      </div>
                    )}
                    
                    {(userStats?.groups || 0) >= 3 && (
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <User className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="font-medium">Colaborador</p>
                          <p className="text-sm text-muted-foreground">Participou de 3+ grupos</p>
                        </div>
                      </div>
                    )}
                    
                    {(userStats?.documents || 0) >= 10 && (
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <FileText className="h-8 w-8 text-purple-500" />
                        <div>
                          <p className="font-medium">Produtor</p>
                          <p className="text-sm text-muted-foreground">Gerou 10+ documentos</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}