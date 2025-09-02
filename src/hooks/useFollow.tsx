import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type FollowTargetType = 'user' | 'group' | 'page' | 'entity';
export type FollowLevel = 'public' | 'member' | 'moderator' | 'admin' | 'owner';
export type FollowStatus = 'pending' | 'accepted' | 'blocked';

export interface Follow {
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

  // Check if user is following this target
  const { data: isFollowing, isLoading: isCheckingFollow } = useQuery({
    queryKey: ['is-following', user?.id, targetType, targetId],
    queryFn: async () => {
      if (!user) return false;
      
      const { data } = await supabase
        .rpc('is_following', {
          _follower_id: user.id,
          _target_type: targetType,
          _target_id: targetId
        });
      
      return data || false;
    },
    enabled: !!user
  });

  // Get current follow relationship
  const { data: followRelationship } = useQuery({
    queryKey: ['follow-relationship', user?.id, targetType, targetId],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Get follower count
  const { data: followerCount = 0 } = useQuery({
    queryKey: ['follower-count', targetType, targetId],
    queryFn: async () => {
      const { data } = await supabase
        .rpc('get_follower_count', {
          _target_type: targetType,
          _target_id: targetId
        });
      
      return data || 0;
    }
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async ({ level = 'public' }: { level?: FollowLevel } = {}) => {
      if (!user) throw new Error('Must be logged in to follow');
      
      const { data, error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          target_type: targetType,
          target_id: targetId,
          follow_level: level,
          status: 'accepted'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following'] });
      queryClient.invalidateQueries({ queryKey: ['follow-relationship'] });
      queryClient.invalidateQueries({ queryKey: ['follower-count'] });
      toast.success('Seguindo!');
    },
    onError: (error) => {
      toast.error('Erro ao seguir: ' + error.message);
    }
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in to unfollow');
      
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('target_type', targetType)
        .eq('target_id', targetId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following'] });
      queryClient.invalidateQueries({ queryKey: ['follow-relationship'] });
      queryClient.invalidateQueries({ queryKey: ['follower-count'] });
      toast.success('Deixou de seguir');
    },
    onError: (error) => {
      toast.error('Erro ao deixar de seguir: ' + error.message);
    }
  });

  // Update follow level mutation
  const updateFollowLevelMutation = useMutation({
    mutationFn: async ({ level }: { level: FollowLevel }) => {
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('follows')
        .update({ follow_level: level })
        .eq('follower_id', user.id)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-relationship'] });
      toast.success('Nível de acesso atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar nível: ' + error.message);
    }
  });

  return {
    isFollowing: isFollowing || false,
    isCheckingFollow,
    followRelationship,
    followerCount,
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    updateFollowLevel: updateFollowLevelMutation.mutate,
    isFollowPending: followMutation.isPending,
    isUnfollowPending: unfollowMutation.isPending,
    isUpdatePending: updateFollowLevelMutation.isPending
  };
}

// Hook to get user's following count
export function useFollowingCount(userId?: string) {
  return useQuery({
    queryKey: ['following-count', userId],
    queryFn: async () => {
      if (!userId) return 0;
      
      const { data } = await supabase
        .rpc('get_following_count', {
          _user_id: userId
        });
      
      return data || 0;
    },
    enabled: !!userId
  });
}

// Hook to get followers list
export function useFollowers(targetType: FollowTargetType, targetId: string) {
  return useQuery({
    queryKey: ['followers', targetType, targetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          *,
          profiles:follower_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}

// Hook to get following list
export function useFollowing(userId: string) {
  return useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', userId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });
}