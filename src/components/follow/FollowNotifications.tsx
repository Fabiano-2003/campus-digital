import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';

interface FollowNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  type: string;
  metadata?: {
    follower_id?: string;
    follower_name?: string;
    follower_avatar?: string;
    target_type?: string;
    target_id?: string;
    follow_level?: string;
  };
}

export function FollowNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['followNotifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['new_follower', 'follow_request', 'follow_accepted'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as FollowNotification[];
    },
    enabled: !!user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followNotifications', user?.id] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false)
        .in('type', ['new_follower', 'follow_request', 'follow_accepted']);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followNotifications', user?.id] });
      toast.success('Todas as notificações marcadas como lidas');
    },
  });

  const handleFollowResponse = async (
    followerId: string, 
    targetType: string, 
    targetId: string, 
    accept: boolean
  ) => {
    try {
      if (accept) {
        const { error } = await supabase
          .from('follows')
          .update({ status: 'accepted' })
          .eq('follower_id', followerId)
          .eq('target_type', targetType as any)
          .eq('target_id', targetId);

        if (error) throw error;
        toast.success('Solicitação aceita!');
      } else {
        const { error } = await supabase
          .from('follows')
          .update({ status: 'blocked' })
          .eq('follower_id', followerId)
          .eq('target_type', targetType as any)
          .eq('target_id', targetId);

        if (error) throw error;
        toast.success('Solicitação rejeitada');
      }
      
      queryClient.invalidateQueries({ queryKey: ['followNotifications', user?.id] });
    } catch (error: any) {
      toast.error('Erro ao responder solicitação: ' + error.message);
    }
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  if (!user || !notifications?.length) return null;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações de Seguidores
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <Check className="w-4 h-4 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="w-32 h-4 mb-1" />
                  <Skeleton className="w-48 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-all animate-fade-in hover-scale ${
                  !notification.read 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'bg-background hover:bg-accent'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={notification.metadata?.follower_avatar || ''} />
                      <AvatarFallback>
                        {notification.metadata?.follower_name?.charAt(0) || 
                         (notification.type === 'new_follower' ? <UserPlus className="w-4 h-4" /> : <Users className="w-4 h-4" />)}
                      </AvatarFallback>
                    </Avatar>
                    {!notification.read && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    
                    {notification.type === 'follow_request' && notification.metadata && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleFollowResponse(
                            notification.metadata!.follower_id!,
                            notification.metadata!.target_type!,
                            notification.metadata!.target_id!,
                            true
                          )}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFollowResponse(
                            notification.metadata!.follower_id!,
                            notification.metadata!.target_type!,
                            notification.metadata!.target_id!,
                            false
                          )}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                      disabled={markAsReadMutation.isPending}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}