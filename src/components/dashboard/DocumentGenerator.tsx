import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Plus, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export function DocumentGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form state for document generation
  const [documentData, setDocumentData] = useState({
    title: "",
    content: {},
    document_type: ""
  });

  // Buscar documentos do usuário
  const { data: userDocuments, isLoading } = useQuery({
    queryKey: ['user-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Gerar documento
  const generateDocumentMutation = useMutation({
    mutationFn: async (docData: any) => {
      const { data, error } = await supabase
        .from('generated_documents')
        .insert({
          ...docData,
          user_id: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-documents'] });
      setIsGenerating(false);
      setDocumentData({ title: "", content: {}, document_type: "" });
      toast.success("Documento gerado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao gerar documento. Tente novamente.");
    }
  });

  const documentTemplates = [
    {
      id: "curriculum",
      name: "Currículo Profissional",
      description: "Modelo moderno e profissional para currículos",
      icon: "👤",
      fields: ["nome", "email", "telefone", "endereco", "objetivo", "experiencia", "educacao", "habilidades"]
    },
    {
      id: "cover_letter",
      name: "Carta de Apresentação",
      description: "Para candidaturas a vagas e estágios",
      icon: "✉️",
      fields: ["nome", "empresa", "cargo", "motivacao", "qualificacoes"]
    },
    {
      id: "internship_report",
      name: "Relatório de Estágio",
      description: "Estrutura completa seguindo padrões ABNT",
      icon: "📊",
      fields: ["titulo", "instituicao", "supervisor", "periodo", "atividades", "conclusoes"]
    },
    {
      id: "research_project",
      name: "Projeto de Pesquisa",
      description: "Template acadêmico para projetos de pesquisa",
      icon: "🔬",
      fields: ["titulo", "objetivos", "justificativa", "metodologia", "cronograma", "bibliografia"]
    },
    {
      id: "academic_article",
      name: "Artigo Científico",
      description: "Formatação ABNT para artigos acadêmicos",
      icon: "📝",
      fields: ["titulo", "autores", "resumo", "palavras_chave", "introducao", "metodologia", "resultados", "conclusao"]
    },
    {
      id: "formal_letter",
      name: "Carta Formal",
      description: "Para comunicações oficiais e institucionais",
      icon: "📄",
      fields: ["destinatario", "assunto", "introducao", "desenvolvimento", "conclusao"]
    }
  ];

  const handleStartGeneration = (templateId: string) => {
    const template = documentTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setDocumentData({
        title: "",
        content: {},
        document_type: template.id
      });
      setIsGenerating(true);
    }
  };

  const handleGenerateDocument = () => {
    if (!documentData.title || !selectedTemplate) {
      toast.error("Preencha pelo menos o título do documento!");
      return;
    }

    const template = documentTemplates.find(t => t.id === selectedTemplate);
    generateDocumentMutation.mutate({
      ...documentData,
      title: documentData.title,
      document_type: template?.name || selectedTemplate
    });
  };

  const updateDocumentField = (field: string, value: string) => {
    setDocumentData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
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
          <CardTitle>Gerador de Documentos</CardTitle>
          <CardDescription>
            Crie documentos profissionais e acadêmicos com nossos templates inteligentes
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">{template.icon}</div>
                  <h3 className="font-medium text-lg">{template.name}</h3>
                  <p className="text-muted-foreground text-sm">{template.description}</p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {template.fields.slice(0, 3).map((field) => (
                    <Badge key={field} variant="outline" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                  {template.fields.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.fields.length - 3}
                    </Badge>
                  )}
                </div>

                <Button 
                  className="w-full"
                  onClick={() => handleStartGeneration(template.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Usar Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Meus Documentos</CardTitle>
          <CardDescription>
            Documentos que você criou usando nossos templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userDocuments && userDocuments.length > 0 ? (
            <div className="space-y-4">
              {userDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{doc.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {doc.document_type} • {formatDistanceToNow(new Date(doc.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Você ainda não criou nenhum documento. Escolha um template acima para começar!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Generation Dialog */}
      <Dialog open={isGenerating} onOpenChange={setIsGenerating}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Gerar Documento: {documentTemplates.find(t => t.id === selectedTemplate)?.name}
            </DialogTitle>
            <DialogDescription>
              Preencha os campos para gerar seu documento personalizado
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="doc-title">Título do Documento *</Label>
              <Input
                id="doc-title"
                value={documentData.title}
                onChange={(e) => setDocumentData({...documentData, title: e.target.value})}
                placeholder="Ex: Meu Currículo Profissional"
              />
            </div>

            {selectedTemplate && documentTemplates.find(t => t.id === selectedTemplate)?.fields.map((field) => (
              <div key={field} className="grid gap-2">
                <Label htmlFor={field} className="capitalize">
                  {field.replace('_', ' ')}
                </Label>
                {field.includes('descricao') || field.includes('objetivo') || field.includes('experiencia') ? (
                  <Textarea
                    id={field}
                    rows={3}
                    onChange={(e) => updateDocumentField(field, e.target.value)}
                    placeholder={`Descreva seu ${field.replace('_', ' ')}...`}
                  />
                ) : (
                  <Input
                    id={field}
                    onChange={(e) => updateDocumentField(field, e.target.value)}
                    placeholder={`Digite seu ${field.replace('_', ' ')}...`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsGenerating(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleGenerateDocument}
              disabled={generateDocumentMutation.isPending}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {generateDocumentMutation.isPending ? "Gerando..." : "Gerar Documento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}