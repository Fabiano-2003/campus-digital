import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Send, Globe, Users, Lock, Building } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export function AcademicFeed() {
  const [newPost, setNewPost] = useState("");
  const [postVisibility, setPostVisibility] = useState("public");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar posts do feed
  const { data: posts, isLoading } = useQuery({
    queryKey: ['feed-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feed_posts')
        .select(`
          *,
          post_likes(count),
          post_comments(count)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    }
  });

  // Criar novo post
  const createPostMutation = useMutation({
    mutationFn: async ({ content, visibility }: { content: string; visibility: string }) => {
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          content,
          user_id: user?.id,
          post_type: 'text',
          visibility
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
      setNewPost("");
      toast.success("Post criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar post. Tente novamente.");
    }
  });

  // Curtir post
  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data, error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user?.id
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
    }
  });

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    createPostMutation.mutate({ content: newPost, visibility: postVisibility });
  };

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId);
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
      <Card>
        <CardHeader>
          <CardTitle>Feed Estudantil</CardTitle>
          <CardDescription>
            Compartilhe conhecimento e conecte-se com outros estudantes
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Create New Post */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar>
              <AvatarFallback>
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <Textarea
                placeholder="Compartilhe uma descoberta, dúvida ou discussão acadêmica..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <Badge variant="outline">Texto</Badge>
                  <Select value={postVisibility} onValueChange={setPostVisibility}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Público
                        </div>
                      </SelectItem>
                      <SelectItem value="friends">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Amigos
                        </div>
                      </SelectItem>
                      <SelectItem value="groups">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Grupos
                        </div>
                      </SelectItem>
                      <SelectItem value="institution">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Instituição
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreatePost}
                  disabled={!newPost.trim() || createPostMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Publicar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {posts?.map((post) => (
          <Card key={post.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarFallback>
                    {post.user_id?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Estudante Anônimo</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                    <Badge variant="outline">{post.post_type}</Badge>
                  </div>
                  
                  <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                  
                  {/* Engagement Actions */}
                  <div className="flex items-center gap-6 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-red-500"
                    >
                      <Heart className="h-4 w-4" />
                      {post.post_likes?.[0]?.count || 0}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-muted-foreground hover:text-blue-500"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {post.post_comments?.[0]?.count || 0}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-muted-foreground hover:text-green-500"
                    >
                      <Share2 className="h-4 w-4" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts?.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum post encontrado. Seja o primeiro a compartilhar algo!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}