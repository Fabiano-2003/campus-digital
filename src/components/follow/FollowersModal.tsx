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
import { Users } from 'lucide-react';
import { FollowButton } from '@/components/ui/follow-button';
import { FollowTargetType } from '@/hooks/useFollow';

interface FollowersModalProps {
  targetType: FollowTargetType;
  targetId: string;
  followerCount: number;
  trigger?: React.ReactNode;
}

interface Follower {
  id: string;
  follower_id: string;
  follow_level: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  } | null;
}

export function FollowersModal({ 
  targetType, 
  targetId, 
  followerCount,
  trigger 
}: FollowersModalProps) {
  const { data: followers, isLoading } = useQuery({
    queryKey: ['followers', targetType, targetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          id,
          follower_id,
          follow_level,
          created_at
        `)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get profile information for each follower
      const followerIds = data.map(f => f.follower_id);
      
      if (followerIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio')
        .in('id', followerIds);

      if (profilesError) throw profilesError;

      // Combine follow data with profile data
      return data.map(follow => ({
        ...follow,
        profiles: profiles?.find(p => p.id === follow.follower_id) || null
      })) as Follower[];
    },
  });

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="hover-scale">
      <Users className="w-4 h-4 mr-2" />
      {followerCount} seguidores
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
            <Users className="w-5 h-5" />
            Seguidores ({followerCount})
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
          ) : followers && followers.length > 0 ? (
            <div className="space-y-2">
              {followers.map((follower) => (
                <div 
                  key={follower.id} 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors animate-fade-in"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={follower.profiles?.avatar_url || ''} />
                    <AvatarFallback>
                      {follower.profiles?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {follower.profiles?.full_name || 'Usuário'}
                    </p>
                    {follower.profiles?.bio && (
                      <p className="text-xs text-muted-foreground truncate">
                        {follower.profiles.bio}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {follower.follow_level === 'public' ? 'Público' : 
                       follower.follow_level === 'member' ? 'Membro' :
                       follower.follow_level === 'admin' ? 'Admin' : follower.follow_level}
                    </p>
                  </div>
                  <FollowButton
                    targetType="user"
                    targetId={follower.follower_id}
                    className="text-xs"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Ainda não há seguidores</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}