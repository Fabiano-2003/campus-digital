import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, FileText, Download, Eye } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

interface Document {
  id: string;
  title: string;
  document_type: string;
  content: any;
  file_url?: string;
  created_at: string;
}

export default function Documents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorData, setGeneratorData] = useState({
    type: "",
    title: "",
    content: {}
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Erro ao carregar documentos",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDocument = async () => {
    if (!generatorData.type || !generatorData.title) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o tipo e título do documento.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('generated_documents')
        .insert([{
          title: generatorData.title,
          document_type: generatorData.type,
          content: generatorData.content
        }]);

      if (error) throw error;

      toast({
        title: "Documento criado!",
        description: "Seu documento foi gerado com sucesso.",
      });

      setShowGenerator(false);
      setGeneratorData({ type: "", title: "", content: {} });
      fetchDocuments();
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Erro ao criar documento",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('generated_documents')
        .insert([{
          title: file.name,
          document_type: 'upload',
          content: { originalName: file.name, size: file.size },
          file_url: data.publicUrl
        }]);

      if (dbError) throw dbError;

      toast({
        title: "Arquivo enviado!",
        description: "Seu arquivo foi carregado com sucesso.",
      });

      fetchDocuments();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erro no upload",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbNav />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Meus Documentos</h1>
            <p className="text-muted-foreground">
              Gerencie e crie seus documentos acadêmicos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowGenerator(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Gerar Documento
            </Button>
            <div className="relative">
              <input
                type="file"
                onChange={uploadFile}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.txt"
              />
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </div>

        {showGenerator && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Gerador de Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="docType">Tipo de Documento</Label>
                  <Select value={generatorData.type} onValueChange={(value) => setGeneratorData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cv">Currículo</SelectItem>
                      <SelectItem value="carta">Carta Formal</SelectItem>
                      <SelectItem value="certificado">Certificado</SelectItem>
                      <SelectItem value="relatorio">Relatório</SelectItem>
                      <SelectItem value="monografia">Estrutura de Monografia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docTitle">Título do Documento</Label>
                  <Input
                    id="docTitle"
                    placeholder="ex: Currículo - João Silva"
                    value={generatorData.title}
                    onChange={(e) => setGeneratorData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={generateDocument}>
                  Gerar Documento
                </Button>
                <Button variant="outline" onClick={() => setShowGenerator(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {documents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum documento ainda</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro documento ou fazendo upload de um arquivo
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setShowGenerator(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Documento
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    onChange={uploadFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">
                        {doc.document_type} • {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Visualizar
                      </Button>
                      {doc.file_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.file_url} download>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}