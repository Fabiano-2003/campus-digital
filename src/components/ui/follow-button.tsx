import React from 'react';
import { Button } from './button';
import { UserPlus, UserMinus, Users } from 'lucide-react';
import { useFollow, FollowTargetType, FollowLevel } from '@/hooks/useFollow';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface FollowButtonProps {
  targetType: FollowTargetType;
  targetId: string;
  showFollowerCount?: boolean;
  allowLevelSelection?: boolean;
  className?: string;
}

const levelLabels: Record<FollowLevel, string> = {
  public: 'Público',
  member: 'Membro',
  moderator: 'Moderador',
  admin: 'Administrador',
  owner: 'Proprietário',
};

export function FollowButton({
  targetType,
  targetId,
  showFollowerCount = false,
  allowLevelSelection = false,
  className,
}: FollowButtonProps) {
  const { user } = useAuth();
  const { 
    isFollowing, 
    followerCount, 
    isLoading, 
    follow, 
    unfollow, 
    isFollowLoading, 
    isUnfollowLoading 
  } = useFollow(targetType, targetId);

  if (!user) return null;

  // Don't show follow button for user's own profile
  if (targetType === 'user' && targetId === user.id) return null;

  const handleFollow = (level: FollowLevel = 'public') => {
    follow({ level });
  };

  const handleUnfollow = () => {
    unfollow();
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled className={className}>
        <Users className="w-4 h-4 mr-2" />
        Carregando...
      </Button>
    );
  }

  if (isFollowing) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={handleUnfollow}
          disabled={isUnfollowLoading}
          className={className}
        >
          <UserMinus className="w-4 h-4 mr-2" />
          Seguindo
        </Button>
        {showFollowerCount && (
          <span className="text-sm text-muted-foreground">
            {followerCount} seguidores
          </span>
        )}
      </div>
    );
  }

  if (allowLevelSelection) {
    return (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="default" 
              disabled={isFollowLoading}
              className={className}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Seguir
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 bg-background border shadow-lg z-50"
          >
            {(Object.keys(levelLabels) as FollowLevel[]).map((level) => (
              <DropdownMenuItem
                key={level}
                onClick={() => handleFollow(level)}
                className="hover:bg-accent cursor-pointer"
              >
                {levelLabels[level]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {showFollowerCount && (
          <span className="text-sm text-muted-foreground">
            {followerCount} seguidores
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => handleFollow()}
        disabled={isFollowLoading}
        className={className}
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Seguir
      </Button>
      {showFollowerCount && (
        <span className="text-sm text-muted-foreground">
          {followerCount} seguidores
        </span>
      )}
    </div>
  );
}