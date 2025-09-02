import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FollowButton } from '@/components/ui/follow-button';
import { UserPlus, Users, GraduationCap, Building2 } from 'lucide-react';

interface SuggestedUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  institution: string | null;
  course: string | null;
  mutual_followers?: number;
}

interface SuggestedGroup {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  institution: string | null;
  member_count?: number;
}

export function SuggestedFollows() {
  const { user } = useAuth();

  // Get suggested users based on mutual connections and similar institutions
  const { data: suggestedUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['suggestedUsers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get current user's profile to find similar users
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('institution, course')
        .eq('id', user.id)
        .single();

      let query = supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, institution, course')
        .neq('id', user.id)
        .limit(5);

      // Prioritize users from same institution or course
      if (currentProfile?.institution) {
        query = query.or(`institution.eq.${currentProfile.institution},course.eq.${currentProfile.course}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter out users already being followed
      const { data: currentFollows } = await supabase
        .from('follows')
        .select('target_id')
        .eq('follower_id', user.id)
        .eq('target_type', 'user')
        .eq('status', 'accepted');

      const followedIds = currentFollows?.map(f => f.target_id) || [];
      
      return (data || []).filter(u => !followedIds.includes(u.id)) as SuggestedUser[];
    },
    enabled: !!user?.id,
  });

  // Get suggested groups based on user's interests
  const { data: suggestedGroups, isLoading: loadingGroups } = useQuery({
    queryKey: ['suggestedGroups', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('study_groups')
        .select(`
          id,
          name,
          description,
          subject,
          institution,
          group_members (count)
        `)
        .eq('is_active', true)
        .limit(3);

      if (error) throw error;

      // Filter out groups user is already member of
      const { data: userGroups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      const memberGroupIds = userGroups?.map(g => g.group_id) || [];
      
      return (data || [])
        .filter(g => !memberGroupIds.includes(g.id))
        .map(g => ({
          ...g,
          member_count: Array.isArray(g.group_members) ? g.group_members.length : 0
        })) as SuggestedGroup[];
    },
    enabled: !!user?.id,
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Suggested Users */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="w-5 h-5" />
            Sugestões para Seguir
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="w-24 h-4 mb-1" />
                    <Skeleton className="w-32 h-3" />
                  </div>
                  <Skeleton className="w-16 h-8" />
                </div>
              ))}
            </div>
          ) : suggestedUsers && suggestedUsers.length > 0 ? (
            <div className="space-y-3">
              {suggestedUsers.map((suggestedUser, index) => (
                <div 
                  key={suggestedUser.id} 
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors animate-fade-in hover-scale"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={suggestedUser.avatar_url || ''} />
                    <AvatarFallback>
                      {suggestedUser.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {suggestedUser.full_name || 'Usuário'}
                    </p>
                    {suggestedUser.bio && (
                      <p className="text-xs text-muted-foreground truncate">
                        {suggestedUser.bio}
                      </p>
                    )}
                    {suggestedUser.institution && (
                      <div className="flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground truncate">
                          {suggestedUser.institution}
                        </p>
                      </div>
                    )}
                  </div>
                  <FollowButton
                    targetType="user"
                    targetId={suggestedUser.id}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma sugestão disponível no momento</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Groups */}
      <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" />
            Grupos Recomendados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingGroups ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <Skeleton className="w-32 h-4 mb-2" />
                  <Skeleton className="w-full h-3 mb-2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="w-20 h-3" />
                    <Skeleton className="w-16 h-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : suggestedGroups && suggestedGroups.length > 0 ? (
            <div className="space-y-3">
              {suggestedGroups.map((group, index) => (
                <div 
                  key={group.id} 
                  className="p-3 border rounded-lg hover:bg-accent transition-colors animate-fade-in hover-scale"
                  style={{ animationDelay: `${(index + 3) * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <h4 className="font-medium text-sm truncate">{group.name}</h4>
                      {group.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {group.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{group.subject}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {group.member_count} membros
                          </span>
                        </div>
                      </div>
                    </div>
                    <FollowButton
                      targetType="group"
                      targetId={group.id}
                      allowLevelSelection={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum grupo recomendado no momento</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}