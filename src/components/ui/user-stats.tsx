import React from 'react';
import { useUserFollowStats } from '@/hooks/useFollow';
import { FollowersModal } from '@/components/follow/FollowersModal';
import { FollowingModal } from '@/components/follow/FollowingModal';

interface UserStatsProps {
  userId: string;
  className?: string;
}

export function UserStats({ userId, className }: UserStatsProps) {
  const { followingCount, followerCount } = useUserFollowStats(userId);

  return (
    <div className={`flex gap-4 text-sm ${className}`}>
      <FollowersModal
        targetType="user"
        targetId={userId}
        followerCount={followerCount}
      />
      <FollowingModal
        userId={userId}
        followingCount={followingCount}
      />
    </div>
  );
}