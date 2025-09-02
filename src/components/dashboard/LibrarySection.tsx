import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Download, Eye, Star, Upload, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function LibrarySection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Buscar livros
  const { data: books, isLoading: booksLoading } = useQuery({
    queryKey: ['books', searchQuery, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`);
      }

      if (selectedCategory !== "all") {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    }
  });

  // Buscar monografias
  const { data: monographs, isLoading: monographsLoading } = useQuery({
    queryKey: ['monographs', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('monographs')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    }
  });

  const categories = [
    { value: "all", label: "Todas" },
    { value: "matematica", label: "Matemática" },
    { value: "fisica", label: "Física" },
    { value: "quimica", label: "Química" },
    { value: "biologia", label: "Biologia" },
    { value: "historia", label: "História" },
    { value: "portugues", label: "Português" },
    { value: "filosofia", label: "Filosofia" },
    { value: "sociologia", label: "Sociologia" },
    { value: "direito", label: "Direito" },
    { value: "medicina", label: "Medicina" },
    { value: "engenharia", label: "Engenharia" },
    { value: "informatica", label: "Informática" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Biblioteca Acadêmica</CardTitle>
          <CardDescription>
            Explore livros, apostilas e monografias de diversas áreas do conhecimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, autor ou disciplina..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Enviar Material
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="books" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="books">Livros & Apostilas</TabsTrigger>
          <TabsTrigger value="monographs">Monografias & TCCs</TabsTrigger>
          <TabsTrigger value="templates">Modelos de Documentos</TabsTrigger>
        </TabsList>

        {/* Books Tab */}
        <TabsContent value="books">
          {booksLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books?.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-lg line-clamp-2">{book.title}</h3>
                        <p className="text-muted-foreground">por {book.author}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {book.institution || "Instituição não informada"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{book.category}</Badge>
                        {book.subject && (
                          <Badge variant="outline">{book.subject}</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {book.download_count}
                        </span>
                        <span>
                          {formatDistanceToNow(new Date(book.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Monographs Tab */}
        <TabsContent value="monographs">
          {monographsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {monographs?.map((monograph) => (
                <Card key={monograph.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="w-24 h-32 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-medium text-xl">{monograph.title}</h3>
                          <p className="text-muted-foreground">por {monograph.author}</p>
                          <p className="text-sm text-muted-foreground">
                            {monograph.institution} • {monograph.course}
                          </p>
                          {monograph.advisor && (
                            <p className="text-sm text-muted-foreground">
                              Orientador: {monograph.advisor}
                            </p>
                          )}
                        </div>

                        {monograph.abstract && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {monograph.abstract}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{monograph.category}</Badge>
                          {monograph.publication_year && (
                            <Badge variant="outline">{monograph.publication_year}</Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {monograph.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {monograph.likes}
                            </span>
                            <span>
                              {formatDistanceToNow(new Date(monograph.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </Button>
                            <Button size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Baixar PDF
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Currículo Acadêmico", description: "Modelo profissional para currículos", icon: "📄" },
              { name: "Carta de Apresentação", description: "Para candidaturas e estágios", icon: "✉️" },
              { name: "Relatório de Estágio", description: "Estrutura completa ABNT", icon: "📊" },
              { name: "Projeto de Pesquisa", description: "Template para projetos acadêmicos", icon: "🔬" },
              { name: "Artigo Científico", description: "Formatação ABNT completa", icon: "📝" },
              { name: "Monografia/TCC", description: "Estrutura completa para trabalhos", icon: "🎓" },
            ].map((template) => (
              <Card key={template.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{template.icon}</div>
                  <h3 className="font-medium text-lg mb-2">{template.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{template.description}</p>
                  <Button variant="outline" className="w-full">
                    Usar Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}