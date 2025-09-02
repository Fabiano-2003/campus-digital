import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Users, Building2, Users2 } from 'lucide-react';
import { FollowButton } from '@/components/ui/follow-button';
import { FollowTargetType } from '@/hooks/useFollow';

interface FollowingModalProps {
  userId: string;
  followingCount: number;
  trigger?: React.ReactNode;
}

interface Following {
  id: string;
  target_type: FollowTargetType;
  target_id: string;
  follow_level: string;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  } | null;
  study_groups?: {
    id: string;
    name: string;
    description: string | null;
    subject: string;
  } | null;
}

const targetTypeIcons = {
  user: UserCheck,
  group: Users2,
  page: Building2,
  entity: Building2,
};

const targetTypeLabels = {
  user: 'Usuário',
  group: 'Grupo',
  page: 'Página',
  entity: 'Entidade',
};

export function FollowingModal({ 
  userId, 
  followingCount,
  trigger 
}: FollowingModalProps) {
  const { data: following, isLoading } = useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          id,
          target_type,
          target_id,
          follow_level,
          created_at
        `)
        .eq('follower_id', userId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get profiles for user targets
      const userTargetIds = data.filter(f => f.target_type === 'user').map(f => f.target_id);
      const groupTargetIds = data.filter(f => f.target_type === 'group').map(f => f.target_id);

      let profiles: any[] = [];
      let groups: any[] = [];

      if (userTargetIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, bio')
          .in('id', userTargetIds);
        profiles = profilesData || [];
      }

      if (groupTargetIds.length > 0) {
        const { data: groupsData } = await supabase
          .from('study_groups')
          .select('id, name, description, subject')
          .in('id', groupTargetIds);
        groups = groupsData || [];
      }

      // Combine follow data with target data
      return data.map(follow => ({
        ...follow,
        profiles: follow.target_type === 'user' 
          ? profiles.find(p => p.id === follow.target_id) || null 
          : null,
        study_groups: follow.target_type === 'group' 
          ? groups.find(g => g.id === follow.target_id) || null 
          : null
      })) as Following[];
    },
  });

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="hover-scale">
      <UserCheck className="w-4 h-4 mr-2" />
      {followingCount} seguindo
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Seguindo ({followingCount})
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="w-24 h-4 mb-1" />
                    <Skeleton className="w-32 h-3" />
                  </div>
                  <Skeleton className="w-16 h-8" />
                </div>
              ))}
            </div>
          ) : following && following.length > 0 ? (
            <div className="space-y-2">
              {following.map((item) => {
                const Icon = targetTypeIcons[item.target_type];
                const isUser = item.target_type === 'user';
                const displayName = isUser 
                  ? item.profiles?.full_name || 'Usuário'
                  : item.study_groups?.name || 'Item';
                const displayInfo = isUser
                  ? item.profiles?.bio
                  : item.study_groups?.description;

                return (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors animate-fade-in"
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={item.profiles?.avatar_url || ''} />
                        <AvatarFallback>
                          {isUser ? displayName.charAt(0) : <Icon className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <Badge 
                        variant="secondary" 
                        className="absolute -bottom-1 -right-1 w-5 h-5 p-0 flex items-center justify-center"
                      >
                        <Icon className="w-3 h-3" />
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {displayName}
                      </p>
                      {displayInfo && (
                        <p className="text-xs text-muted-foreground truncate">
                          {displayInfo}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {targetTypeLabels[item.target_type]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.follow_level === 'public' ? 'Público' : 
                           item.follow_level === 'member' ? 'Membro' :
                           item.follow_level === 'admin' ? 'Admin' : item.follow_level}
                        </Badge>
                      </div>
                    </div>
                    <FollowButton
                      targetType={item.target_type}
                      targetId={item.target_id}
                      className="text-xs"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Você ainda não está seguindo ninguém</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}