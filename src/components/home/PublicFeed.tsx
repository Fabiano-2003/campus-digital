import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Heart, MessageCircle, Share2, Eye, Download, Play, BookOpen, GraduationCap, TrendingUp, Clock, Star } from "lucide-react";
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
    <div className="space-y-8">
      {/* Enhanced Filter Tabs */}
      <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl border border-gray-200/50 shadow-lg">
        <div className="flex space-x-1 overflow-x-auto">
          {[
            { key: 'all', label: 'Todos', icon: TrendingUp, count: '∞' },
            { key: 'posts', label: 'Posts', icon: MessageCircle, count: '125' },
            { key: 'videos', label: 'Vídeos', icon: Play, count: '45' },
            { key: 'monographs', label: 'Monografias', icon: GraduationCap, count: '230' },
            { key: 'books', label: 'Livros', icon: BookOpen, count: '180' }
          ].map(({ key, label, icon: Icon, count }) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(key as any)}
              className={`flex items-center space-x-2 whitespace-nowrap px-4 py-2 rounded-xl transition-all duration-300 ${
                filter === key 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
                  : 'hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{label}</span>
              <Badge variant={filter === key ? "secondary" : "outline"} className="text-xs px-2 py-0.5 bg-white/20">
                {count}
              </Badge>
            </Button>
          ))}
        </div>
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
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm group hover:scale-[1.02]">
                <CardHeader className="pb-4 relative">
                  {/* Background gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex items-start space-x-4 relative z-10">
                    <div className="relative">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                          {item.author ? item.author.charAt(0).toUpperCase() : 'A'}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online indicator */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-gray-800 truncate group-hover:text-primary transition-colors">
                            {item.author || 'Usuário Anônimo'}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`flex items-center space-x-1 px-2 py-1 rounded-full border-2 ${
                              item.type === 'video' ? 'border-red-200 bg-red-50 text-red-700' :
                              item.type === 'monograph' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                              item.type === 'book' ? 'border-green-200 bg-green-50 text-green-700' :
                              'border-purple-200 bg-purple-50 text-purple-700'
                            }`}
                          >
                            <TypeIcon className="h-3 w-3" />
                            <span className="capitalize font-medium">{item.type}</span>
                          </Badge>
                        </div>
                        <Badge variant="secondary" className="text-xs px-2 py-1 bg-gradient-to-r from-primary/10 to-secondary/10">
                          <Star className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      </div>
                      
                      {item.institution && (
                        <p className="text-sm text-gray-600 mb-1 font-medium">{item.institution}</p>
                      )}
                      
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>Em alta</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 relative">
                  {item.title && item.type !== 'post' && (
                    <h4 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                  )}
                  
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                    {item.content}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.category && (
                      <Badge 
                        variant="secondary" 
                        className="px-3 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-primary/20 rounded-full"
                      >
                        {item.category}
                      </Badge>
                    )}
                    {item.subject && (
                      <Badge 
                        variant="outline" 
                        className="px-3 py-1 border-gray-200 text-gray-600 rounded-full hover:bg-gray-50"
                      >
                        {item.subject}
                      </Badge>
                    )}
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                      >
                        <Heart className="h-4 w-4" />
                        <span className="font-medium">{item.likes || 0}</span>
                      </Button>
                      
                      {item.comments_count !== undefined && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="font-medium">{item.comments_count}</span>
                        </Button>
                      )}
                      
                      {item.views !== undefined && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-green-50 hover:text-green-600 transition-all duration-200"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="font-medium">{item.views}</span>
                        </Button>
                      )}
                      
                      {item.downloads !== undefined && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
                        >
                          <Download className="h-4 w-4" />
                          <span className="font-medium">{item.downloads}</span>
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="rounded-full w-9 h-9 p-0 hover:bg-gray-100 transition-all duration-200"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      
                      {(item.file_url || item.video_url) && (
                        <Button 
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
                          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {item.type === 'video' ? '▶ Assistir' : '📖 Ver Mais'}
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
        <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-white border-0 shadow-xl">
          <CardContent>
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">Nenhum conteúdo encontrado</h3>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              Não há conteúdo público disponível no momento. Seja o primeiro a compartilhar algo incrível!
            </p>
            <Button 
              className="mt-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-full px-6 py-2 font-semibold"
              onClick={() => navigate(user ? "/dashboard" : "/auth")}
            >
              {user ? "Criar Post" : "Começar Agora"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};