import React from 'react';
import { useUserFollowStats } from '@/hooks/useFollow';

interface UserStatsProps {
  userId: string;
  className?: string;
}

export function UserStats({ userId, className }: UserStatsProps) {
  const { followingCount, followerCount } = useUserFollowStats(userId);

  return (
    <div className={`flex gap-4 text-sm ${className}`}>
      <div className="text-center">
        <div className="font-semibold text-foreground">{followerCount}</div>
        <div className="text-muted-foreground">Seguidores</div>
      </div>
      <div className="text-center">
        <div className="font-semibold text-foreground">{followingCount}</div>
        <div className="text-muted-foreground">Seguindo</div>
      </div>
    </div>
  );
}