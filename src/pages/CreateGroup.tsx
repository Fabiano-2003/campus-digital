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
import { ArrowLeft, Users, BookOpen } from "lucide-react";

export default function CreateGroup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    level: "",
    institution: "",
    maxMembers: 50
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('study_groups')
        .insert([{
          name: formData.name,
          description: formData.description,
          subject: formData.subject,
          level: formData.level,
          institution: formData.institution,
          max_members: formData.maxMembers
        }]);

      if (error) throw error;

      toast({
        title: "Grupo criado com sucesso!",
        description: "Seu grupo de estudo foi criado e está disponível para outros estudantes.",
      });

      navigate('/groups');
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Erro ao criar grupo",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate(-1)}>
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
                <Users className="h-5 w-5" />
                Informações do Grupo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Grupo *</Label>
                  <Input
                    id="name"
                    placeholder="ex: Grupo de Cálculo I - 2024"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva os objetivos e atividades do grupo..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Matéria *</Label>
                    <Input
                      id="subject"
                      placeholder="ex: Cálculo, Programação, Química"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Nível *</Label>
                    <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medio">Ensino Médio</SelectItem>
                        <SelectItem value="tecnico">Técnico</SelectItem>
                        <SelectItem value="graduacao">Graduação</SelectItem>
                        <SelectItem value="pos-graduacao">Pós-graduação</SelectItem>
                        <SelectItem value="mestrado">Mestrado</SelectItem>
                        <SelectItem value="doutorado">Doutorado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution">Instituição</Label>
                    <Select value={formData.institution} onValueChange={(value) => setFormData(prev => ({ ...prev, institution: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a instituição" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usp">USP</SelectItem>
                        <SelectItem value="unicamp">UNICAMP</SelectItem>
                        <SelectItem value="ufrj">UFRJ</SelectItem>
                        <SelectItem value="ufmg">UFMG</SelectItem>
                        <SelectItem value="puc">PUC</SelectItem>
                        <SelectItem value="ufsc">UFSC</SelectItem>
                        <SelectItem value="outros">Outras</SelectItem>
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
                      value={formData.maxMembers}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || 50 }))}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Criando..." : "Criar Grupo"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}