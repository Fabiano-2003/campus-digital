import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  BookOpen, 
  Video, 
  MessageSquare, 
  Heart,
  ExternalLink,
  Calendar
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
  metadata: any;
  user_id: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const activityIcons = {
  new_post: MessageSquare,
  new_book: BookOpen,
  new_video: Video,
  new_monograph: FileText,
  joined_group: Users,
  new_document: FileText,
};

const activityColors = {
  new_post: 'text-blue-500',
  new_book: 'text-green-500',
  new_video: 'text-red-500',
  new_monograph: 'text-purple-500',
  joined_group: 'text-orange-500',
  new_document: 'text-indigo-500',
};

export function FollowFeed() {
  const { user } = useAuth();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['followFeed', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get users that current user is following
      const { data: following } = await supabase
        .from('follows')
        .select('target_id')
        .eq('follower_id', user.id)
        .eq('target_type', 'user')
        .eq('status', 'accepted');

      if (!following || following.length === 0) return [];

      const followingIds = following.map(f => f.target_id);

      // Get recent activities from followed users  
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          id,
          type,
          title,
          description,
          created_at,
          metadata,
          user_id
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get profile information for each user
      const userIds = [...new Set(data.map(item => item.user_id))];
      
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      // Combine activity data with profile data
      return data.map(activity => ({
        ...activity,
        profiles: profiles?.find(p => p.id === activity.user_id) || null
      })) as ActivityItem[];
    },
    enabled: !!user?.id,
  });

  if (!user) return null;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Atividades de Quem Você Segue
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4 border rounded-lg">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="w-32 h-4 mb-2" />
                  <Skeleton className="w-full h-3 mb-1" />
                  <Skeleton className="w-24 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.map((activity, index) => {
              const Icon = activityIcons[activity.type as keyof typeof activityIcons] || MessageSquare;
              const iconColor = activityColors[activity.type as keyof typeof activityColors] || 'text-gray-500';

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent transition-colors animate-fade-in hover-scale"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={activity.profiles?.avatar_url || ''} />
                      <AvatarFallback>
                        {activity.profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-background border-2 border-background rounded-full flex items-center justify-center ${iconColor}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">
                        {activity.profiles?.full_name || 'Usuário'}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {activity.type === 'new_post' ? 'Nova publicação' :
                         activity.type === 'new_book' ? 'Novo livro' :
                         activity.type === 'new_video' ? 'Novo vídeo' :
                         activity.type === 'new_monograph' ? 'Nova monografia' :
                         activity.type === 'joined_group' ? 'Entrou em grupo' :
                         activity.type === 'new_document' ? 'Novo documento' :
                         'Atividade'}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium text-sm text-foreground mb-1 truncate">
                      {activity.title}
                    </h4>
                    
                    {activity.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {activity.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      
                      {activity.metadata?.url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={activity.metadata.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Ver
                          </a>
                        </Button>
                      )}
                    </div>
                    
                    {activity.metadata?.stats && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {activity.metadata.stats.likes > 0 && (
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {activity.metadata.stats.likes}
                          </div>
                        )}
                        {activity.metadata.stats.comments > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {activity.metadata.stats.comments}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhuma atividade recente</p>
            <p className="text-xs mt-1">
              Siga outros usuários para ver suas atividades aqui
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}