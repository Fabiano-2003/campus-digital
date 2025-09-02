import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FollowFeed } from "@/components/follow/FollowFeed";
import { SuggestedFollows } from "@/components/follow/SuggestedFollows";
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
    <div className="space-y-8 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Livros</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.books || 0}</div>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +20% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monografias</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10">
              <FileText className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.monographs || 0}</div>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +15% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Grupos Ativos</CardTitle>
            <div className="p-2 rounded-lg bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.groups || 0}</div>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Posts no Feed</CardTitle>
            <div className="p-2 rounded-lg bg-info/10">
              <TrendingUp className="h-5 w-5 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.posts || 0}</div>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +25% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Books */}
        <Card className="hover-lift bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Últimos Livros Adicionados</CardTitle>
                <CardDescription>
                  Confira os livros mais recentes na plataforma
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBooks?.map((book) => (
                <div key={book.id} className="group p-4 rounded-lg border border-border/50 hover:border-primary/20 hover:bg-muted/30 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{book.title}</h4>
                      <p className="text-sm text-muted-foreground">por {book.author}</p>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">{book.category}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {book.download_count} downloads
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground ml-4 flex flex-col items-end gap-1">
                      <Eye className="h-3 w-3 text-primary" />
                      <span>
                        {formatDistanceToNow(new Date(book.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                <BookOpen className="h-4 w-4 mr-2" />
                Ver Todos os Livros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Study Groups */}
        <Card className="hover-lift bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-lg">Grupos de Estudo Ativos</CardTitle>
                <CardDescription>
                  Grupos com mais atividade recente
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeGroups?.map((group) => (
                <div key={group.id} className="group p-4 rounded-lg border border-border/50 hover:border-secondary/20 hover:bg-muted/30 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-foreground group-hover:text-secondary transition-colors">{group.name}</h4>
                      <p className="text-sm text-muted-foreground">{group.subject}</p>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">{group.level}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {group.group_members?.[0]?.count || 0} membros
                        </span>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="group-hover:scale-105 transition-transform">
                      Participar
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                <Users className="h-4 w-4 mr-2" />
                Ver Todos os Grupos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
        
      {/* Follow Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FollowFeed />
        </div>
        <div>
          <SuggestedFollows />
        </div>
      </div>
    </div>
  );
}