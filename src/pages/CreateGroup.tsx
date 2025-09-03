
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Users, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { useAuth } from "@/hooks/useAuth";

export default function CreateGroup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    level: "",
    institution: "",
    max_members: 50
  });

  const subjects = [
    "Matemática", "Física", "Química", "Biologia", "História", "Geografia",
    "Português", "Literatura", "Filosofia", "Sociologia", "Direito", "Medicina",
    "Engenharia", "Informática", "Administração", "Psicologia", "Pedagogia"
  ];

  const levels = [
    { value: "ensino-medio", label: "Ensino Médio" },
    { value: "tecnico", label: "Técnico" },
    { value: "graduacao", label: "Graduação" },
    { value: "pos-graduacao", label: "Pós-graduação" },
    { value: "mestrado", label: "Mestrado" },
    { value: "doutorado", label: "Doutorado" }
  ];

  const institutions = [
    { value: "usp", label: "Universidade de São Paulo (USP)" },
    { value: "unicamp", label: "Universidade Estadual de Campinas (UNICAMP)" },
    { value: "ufrj", label: "Universidade Federal do Rio de Janeiro (UFRJ)" },
    { value: "ufmg", label: "Universidade Federal de Minas Gerais (UFMG)" },
    { value: "ufsc", label: "Universidade Federal de Santa Catarina (UFSC)" },
    { value: "puc-sp", label: "Pontifícia Universidade Católica de São Paulo (PUC-SP)" },
    { value: "puc-rio", label: "Pontifícia Universidade Católica do Rio de Janeiro (PUC-Rio)" },
    { value: "ita", label: "Instituto Tecnológico de Aeronáutica (ITA)" },
    { value: "ime", label: "Instituto Militar de Engenharia (IME)" },
    { value: "outras", label: "Outras Instituições" }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome do grupo é obrigatório";
    } else if (formData.name.length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!formData.subject) {
      newErrors.subject = "Matéria é obrigatória";
    }

    if (!formData.level) {
      newErrors.level = "Nível acadêmico é obrigatório";
    }

    if (formData.max_members < 5 || formData.max_members > 200) {
      newErrors.max_members = "Número de membros deve estar entre 5 e 200";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Descrição não pode ter mais de 500 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para criar um grupo.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Erro na validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Criar o grupo
      const { data: newGroup, error: groupError } = await supabase
        .from('study_groups')
        .insert([{
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          subject: formData.subject,
          level: formData.level,
          institution: formData.institution || null,
          max_members: formData.max_members,
          created_by: user.id,
          is_active: true
        }])
        .select()
        .single();

      if (groupError) throw groupError;

      // Adicionar o criador como admin do grupo
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{
          group_id: newGroup.id,
          user_id: user.id,
          role: 'admin'
        }]);

      if (memberError) throw memberError;

      toast({
        title: "Grupo criado com sucesso!",
        description: "Seu grupo de estudo foi criado e você foi adicionado como administrador.",
      });

      navigate(`/groups/${newGroup.id}`);
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast({
        title: "Erro ao criar grupo",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbNav />
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate('/groups')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Criar Grupo de Estudo</h1>
              <p className="text-muted-foreground">
                Conecte-se com outros estudantes da sua área
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Informações do Grupo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    Nome do Grupo *
                    {formData.name.length >= 3 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </Label>
                  <Input
                    id="name"
                    placeholder="ex: Grupo de Cálculo I - Turma 2024"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.name.length}/100 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição do Grupo</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva os objetivos, metodologia e atividades do grupo..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={errors.description ? "border-red-500" : ""}
                    rows={4}
                    maxLength={500}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/500 caracteres
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Matéria *</Label>
                    <Select 
                      value={formData.subject} 
                      onValueChange={(value) => handleInputChange('subject', value)}
                    >
                      <SelectTrigger className={errors.subject ? "border-red-500" : ""}>
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
                    {errors.subject && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Nível Acadêmico *</Label>
                    <Select 
                      value={formData.level} 
                      onValueChange={(value) => handleInputChange('level', value)}
                    >
                      <SelectTrigger className={errors.level ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.level && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.level}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution">Instituição</Label>
                    <Select 
                      value={formData.institution} 
                      onValueChange={(value) => handleInputChange('institution', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a instituição (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {institutions.map((institution) => (
                          <SelectItem key={institution.value} value={institution.value}>
                            {institution.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxMembers">Máximo de Membros</Label>
                    <Input
                      id="maxMembers"
                      type="number"
                      min="5"
                      max="200"
                      value={formData.max_members}
                      onChange={(e) => handleInputChange('max_members', parseInt(e.target.value) || 50)}
                      className={errors.max_members ? "border-red-500" : ""}
                    />
                    {errors.max_members && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.max_members}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Recomendado: 10-30 membros para melhor interação
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/groups')} 
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || !formData.name || !formData.subject || !formData.level} 
                    className="flex-1 bg-gradient-to-r from-primary to-secondary"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Criando...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Criar Grupo
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="mt-6 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">Prévia do Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {formData.name || "Nome do grupo aparecerá aqui"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {formData.description || "Descrição do grupo aparecerá aqui"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {formData.subject && (
                    <Badge variant="secondary">{formData.subject}</Badge>
                  )}
                  {formData.level && (
                    <Badge variant="outline">
                      {levels.find(l => l.value === formData.level)?.label}
                    </Badge>
                  )}
                  {formData.institution && formData.institution !== "outras" && (
                    <Badge variant="outline">
                      {institutions.find(i => i.value === formData.institution)?.label}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Máximo: {formData.max_members} membros
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
