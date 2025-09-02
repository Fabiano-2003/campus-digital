import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Heart, MessageCircle, Share2, Eye, Download, Play, BookOpen, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface PublicContent {
  id: string;
  type: 'post' | 'video' | 'monograph' | 'book';
  title?: string;
  content: string;
  author?: string;
  institution?: string;
  created_at: string;
  likes: number;
  views?: number;
  downloads?: number;
  comments_count?: number;
  video_url?: string;
  file_url?: string;
  thumbnail_url?: string;
  category?: string;
  subject?: string;
}

export const PublicFeed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'posts' | 'videos' | 'monographs' | 'books'>('all');

  const { data: publicContent, isLoading } = useQuery({
    queryKey: ['public-content', filter],
    queryFn: async () => {
      const content: PublicContent[] = [];

      // Fetch posts
      if (filter === 'all' || filter === 'posts') {
        const { data: posts } = await supabase
          .from('feed_posts')
          .select('*')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (posts) {
          content.push(...posts.map(post => ({
            ...post,
            type: 'post' as const,
            title: post.content.substring(0, 50) + '...'
          })));
        }
      }

      // Fetch videos
      if (filter === 'all' || filter === 'videos') {
        const { data: videos } = await supabase
          .from('videos')
          .select('*')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (videos) {
          content.push(...videos.map(video => ({
            ...video,
            type: 'video' as const,
            content: video.description || '',
            author: video.instructor
          })));
        }
      }

      // Fetch monographs
      if (filter === 'all' || filter === 'monographs') {
        const { data: monographs } = await supabase
          .from('monographs')
          .select('*')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (monographs) {
          content.push(...monographs.map(mono => ({
            ...mono,
            type: 'monograph' as const,
            content: mono.abstract || '',
            downloads: 0
          })));
        }
      }

      // Fetch books
      if (filter === 'all' || filter === 'books') {
        const { data: books } = await supabase
          .from('books')
          .select('*')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (books) {
          content.push(...books.map(book => ({
            ...book,
            type: 'book' as const,
            content: book.description || '',
            downloads: book.download_count || 0,
            likes: 0
          })));
        }
      }

      // Sort by created_at
      return content.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'monograph': return GraduationCap;
      case 'book': return BookOpen;
      default: return MessageCircle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-red-500';
      case 'monograph': return 'text-blue-500';
      case 'book': return 'text-green-500';
      default: return 'text-purple-500';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <div className="rounded-full bg-muted h-10 w-10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'Todos', icon: MessageCircle },
          { key: 'posts', label: 'Posts', icon: MessageCircle },
          { key: 'videos', label: 'Vídeos', icon: Play },
          { key: 'monographs', label: 'Monografias', icon: GraduationCap },
          { key: 'books', label: 'Livros', icon: BookOpen }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key as any)}
            className="flex items-center space-x-2 whitespace-nowrap"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Button>
        ))}
      </div>

      {/* Content Feed */}
      <div className="space-y-4">
        {publicContent?.map((item, index) => {
          const TypeIcon = getTypeIcon(item.type);
          const typeColor = getTypeColor(item.type);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {item.author ? item.author.charAt(0).toUpperCase() : 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {item.author || 'Usuário Anônimo'}
                        </h3>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <TypeIcon className={`h-3 w-3 ${typeColor}`} />
                          <span className="capitalize">{item.type}</span>
                        </Badge>
                      </div>
                      {item.institution && (
                        <p className="text-sm text-muted-foreground">{item.institution}</p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {item.title && item.type !== 'post' && (
                    <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                  )}
                  
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {item.content}
                  </p>

                  {item.category && (
                    <Badge variant="secondary" className="mb-3">
                      {item.category}
                    </Badge>
                  )}

                  {item.subject && (
                    <Badge variant="outline" className="mb-3 ml-2">
                      {item.subject}
                    </Badge>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{item.likes || 0}</span>
                      </Button>
                      
                      {item.comments_count !== undefined && (
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{item.comments_count}</span>
                        </Button>
                      )}
                      
                      {item.views !== undefined && (
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{item.views}</span>
                        </Button>
                      )}
                      
                      {item.downloads !== undefined && (
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <Download className="h-4 w-4" />
                          <span>{item.downloads}</span>
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      
                      {(item.file_url || item.video_url) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (!user) {
                              navigate('/auth');
                              return;
                            }
                            if (item.type === 'video') navigate('/library');
                            else if (item.type === 'monograph' || item.type === 'book') navigate('/documents');
                            else navigate('/dashboard');
                          }}
                        >
                          {item.type === 'video' ? 'Assistir' : 'Ver Mais'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {(!publicContent || publicContent.length === 0) && (
        <Card className="text-center py-12">
          <CardContent>
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum conteúdo encontrado</h3>
            <p className="text-muted-foreground">
              Não há conteúdo público disponível no momento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};