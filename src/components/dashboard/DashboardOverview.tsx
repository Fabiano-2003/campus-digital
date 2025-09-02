import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, FileText, TrendingUp, Download, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function DashboardOverview() {
  // Buscar estatísticas gerais
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [booksCount, monographsCount, groupsCount, postsCount] = await Promise.all([
        supabase.from('books').select('*', { count: 'exact', head: true }),
        supabase.from('monographs').select('*', { count: 'exact', head: true }),
        supabase.from('study_groups').select('*', { count: 'exact', head: true }),
        supabase.from('feed_posts').select('*', { count: 'exact', head: true })
      ]);

      return {
        books: booksCount.count || 0,
        monographs: monographsCount.count || 0,
        groups: groupsCount.count || 0,
        posts: postsCount.count || 0
      };
    }
  });

  // Buscar livros recentes
  const { data: recentBooks } = useQuery({
    queryKey: ['recent-books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar grupos ativos
  const { data: activeGroups } = useQuery({
    queryKey: ['active-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          group_members(count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Livros</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.books || 0}</div>
            <p className="text-xs text-muted-foreground">
              +20% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monografias</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.monographs || 0}</div>
            <p className="text-xs text-muted-foreground">
              +15% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grupos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.groups || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts no Feed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.posts || 0}</div>
            <p className="text-xs text-muted-foreground">
              +25% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Books */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Livros Adicionados</CardTitle>
            <CardDescription>
              Confira os livros mais recentes na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBooks?.map((book) => (
                <div key={book.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{book.title}</h4>
                    <p className="text-sm text-muted-foreground">por {book.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{book.category}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {book.download_count}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(book.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Ver Todos os Livros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Study Groups */}
        <Card>
          <CardHeader>
            <CardTitle>Grupos de Estudo Ativos</CardTitle>
            <CardDescription>
              Grupos com mais atividade recente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeGroups?.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{group.name}</h4>
                    <p className="text-sm text-muted-foreground">{group.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{group.level}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {group.group_members?.[0]?.count || 0} membros
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Participar
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Ver Todos os Grupos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}