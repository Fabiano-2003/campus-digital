import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { supabase } from "@/integrations/supabase/client";
import { Search, BookOpen, Download, Eye, Upload, Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  subject: string;
  institution: string;
  file_url?: string;
  cover_url?: string;
  download_count: number;
  created_at: string;
}

interface Monograph {
  id: string;
  title: string;
  author: string;
  abstract: string;
  category: string;
  institution: string;
  course: string;
  advisor: string;
  publication_year: number;
  views: number;
  likes: number;
  file_url: string;
  created_at: string;
}

export default function Library() {
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [monographs, setMonographs] = useState<Monograph[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'books' | 'monographs'>('books');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchMonographs();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchMonographs = async () => {
    try {
      const { data, error } = await supabase
        .from('monographs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMonographs(data || []);
    } catch (error) {
      console.error('Error fetching monographs:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementDownload = async (bookId: string) => {
    try {
      const { error } = await supabase
        .from('books')
        .update({ download_count: books.find(b => b.id === bookId)?.download_count + 1 || 1 })
        .eq('id', bookId);

      if (error) throw error;
      fetchBooks();
    } catch (error) {
      console.error('Error updating download count:', error);
    }
  };

  const incrementView = async (monographId: string) => {
    try {
      const { error } = await supabase
        .from('monographs')
        .update({ views: monographs.find(m => m.id === monographId)?.views + 1 || 1 })
        .eq('id', monographId);

      if (error) throw error;
      fetchMonographs();
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>, type: 'book' | 'monograph') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      if (type === 'book') {
        const { error } = await supabase
          .from('books')
          .insert([{
            title: file.name.replace(/\.[^/.]+$/, ""),
            author: "Autor Desconhecido",
            description: "Livro enviado pelo usuário",
            category: "geral",
            subject: "Diversos",
            institution: "N/A",
            file_url: data.publicUrl
          }]);

        if (error) throw error;
        fetchBooks();
      } else {
        const { error } = await supabase
          .from('monographs')
          .insert([{
            title: file.name.replace(/\.[^/.]+$/, ""),
            author: "Autor Desconhecido",
            abstract: "Monografia enviada pelo usuário",
            category: "geral",
            institution: "N/A",
            course: "N/A",
            advisor: "N/A",
            publication_year: new Date().getFullYear(),
            file_url: data.publicUrl
          }]);

        if (error) throw error;
        fetchMonographs();
      }

      toast({
        title: "Arquivo enviado!",
        description: `${type === 'book' ? 'Livro' : 'Monografia'} enviado com sucesso.`,
      });

      setShowUpload(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erro no upload",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMonographs = monographs.filter(monograph =>
    monograph.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    monograph.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    monograph.course.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-bold">Biblioteca Acadêmica</h1>
            <p className="text-muted-foreground">
              Explore livros, monografias e recursos educacionais
            </p>
          </div>
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Plus className="h-4 w-4 mr-2" />
            Contribuir
          </Button>
        </div>

        {showUpload && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Contribuir com a Biblioteca</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => uploadFile(e, 'book')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.doc,.docx,.epub"
                  />
                  <Button variant="outline" className="w-full h-16">
                    <Upload className="h-6 w-6 mr-2" />
                    Enviar Livro
                  </Button>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => uploadFile(e, 'monograph')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.doc,.docx"
                  />
                  <Button variant="outline" className="w-full h-16">
                    <Upload className="h-6 w-6 mr-2" />
                    Enviar Monografia
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'books' ? 'default' : 'outline'}
            onClick={() => setActiveTab('books')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Livros ({books.length})
          </Button>
          <Button
            variant={activeTab === 'monographs' ? 'default' : 'outline'}
            onClick={() => setActiveTab('monographs')}
          >
            📄 Monografias ({monographs.length})
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Pesquisar ${activeTab === 'books' ? 'livros' : 'monografias'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid gap-6">
          {activeTab === 'books' ? (
            filteredBooks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum livro encontrado</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Tente usar outros termos de busca" : "Seja o primeiro a contribuir!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredBooks.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{book.title}</CardTitle>
                        <p className="text-muted-foreground mb-4">
                          por {book.author} • {book.institution}
                        </p>
                        <p className="text-sm mb-4">{book.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{book.subject}</Badge>
                          <Badge variant="outline">{book.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {book.download_count} downloads • {new Date(book.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        {book.file_url && (
                          <Button 
                            size="sm"
                            asChild
                            onClick={() => incrementDownload(book.id)}
                          >
                            <a href={book.file_url} download>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          ) : (
            filteredMonographs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma monografia encontrada</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Tente usar outros termos de busca" : "Seja o primeiro a contribuir!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredMonographs.map((monograph) => (
                <Card key={monograph.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{monograph.title}</CardTitle>
                        <p className="text-muted-foreground mb-4">
                          por {monograph.author} • {monograph.institution}
                        </p>
                        <p className="text-sm mb-4">{monograph.abstract}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="secondary">{monograph.course}</Badge>
                          <Badge variant="outline">{monograph.category}</Badge>
                          <Badge variant="outline">{monograph.publication_year}</Badge>
                        </div>
                        {monograph.advisor && (
                          <p className="text-sm text-muted-foreground">
                            Orientador: {monograph.advisor}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {monograph.views} visualizações • {monograph.likes} curtidas
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => incrementView(monograph.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Visualizar
                        </Button>
                        <Button size="sm" asChild>
                          <a href={monograph.file_url} download>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          )}
        </div>
      </div>
    </AppLayout>
  );
}