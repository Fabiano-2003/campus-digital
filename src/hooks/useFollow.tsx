import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type FollowTargetType = 'user' | 'group' | 'page' | 'entity';
export type FollowLevel = 'public' | 'member' | 'moderator' | 'admin' | 'owner';
export type FollowStatus = 'pending' | 'accepted' | 'blocked';

interface Follow {
  id: string;
  follower_id: string;
  target_type: FollowTargetType;
  target_id: string;
  follow_level: FollowLevel;
  status: FollowStatus;
  created_at: string;
  updated_at: string;
}

export function useFollow(targetType: FollowTargetType, targetId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user is following the target
  const { data: isFollowing, isLoading } = useQuery({
    queryKey: ['isFollowing', user?.id, targetType, targetId],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('status', 'accepted')
        .maybeSingle();
      
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Get follower count
  const { data: followerCount } = useQuery({
    queryKey: ['followerCount', targetType, targetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_follower_count', {
          _target_type: targetType,
          _target_id: targetId
        });
      
      if (error) throw error;
      return data as number;
    },
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async ({ level = 'public' }: { level?: FollowLevel } = {}) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          target_type: targetType,
          target_id: targetId,
          follow_level: level,
          status: 'accepted'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', user?.id, targetType, targetId] });
      queryClient.invalidateQueries({ queryKey: ['followerCount', targetType, targetId] });
      toast.success('Seguindo com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao seguir: ' + error.message);
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('target_type', targetType)
        .eq('target_id', targetId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', user?.id, targetType, targetId] });
      queryClient.invalidateQueries({ queryKey: ['followerCount', targetType, targetId] });
      toast.success('Deixou de seguir');
    },
    onError: (error: any) => {
      toast.error('Erro ao deixar de seguir: ' + error.message);
    },
  });

  return {
    isFollowing: !!isFollowing,
    followerCount: followerCount || 0,
    isLoading,
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    isFollowLoading: followMutation.isPending,
    isUnfollowLoading: unfollowMutation.isPending,
  };
}

export function useUserFollowStats(userId: string) {
  // Get following count for user
  const { data: followingCount } = useQuery({
    queryKey: ['followingCount', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_following_count', {
          _user_id: userId
        });
      
      if (error) throw error;
      return data as number;
    },
    enabled: !!userId,
  });

  // Get follower count for user
  const { data: followerCount } = useQuery({
    queryKey: ['followerCount', 'user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_follower_count', {
          _target_type: 'user',
          _target_id: userId
        });
      
      if (error) throw error;
      return data as number;
    },
    enabled: !!userId,
  });

  return {
    followingCount: followingCount || 0,
    followerCount: followerCount || 0,
  };
}