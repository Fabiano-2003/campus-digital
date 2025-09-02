import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown, UserPlus, UserMinus, Users } from 'lucide-react';
import { useFollow, FollowTargetType, FollowLevel } from '@/hooks/useFollow';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  targetType: FollowTargetType;
  targetId: string;
  showFollowLevel?: boolean;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

const followLevelLabels: Record<FollowLevel, string> = {
  public: 'Público',
  member: 'Membro',
  moderator: 'Moderador',
  admin: 'Administrador',
  owner: 'Proprietário'
};

export function FollowButton({ 
  targetType, 
  targetId, 
  showFollowLevel = false,
  className,
  size = 'default'
}: FollowButtonProps) {
  const [showLevelMenu, setShowLevelMenu] = useState(false);
  
  const {
    isFollowing,
    isCheckingFollow,
    followRelationship,
    followerCount,
    follow,
    unfollow,
    updateFollowLevel,
    isFollowPending,
    isUnfollowPending,
    isUpdatePending
  } = useFollow(targetType, targetId);

  const handleFollow = (level: FollowLevel = 'public') => {
    follow({ level });
  };

  const handleUnfollow = () => {
    unfollow();
  };

  const handleUpdateLevel = (level: FollowLevel) => {
    updateFollowLevel({ level });
    setShowLevelMenu(false);
  };

  if (isCheckingFollow) {
    return (
      <Button 
        variant="outline" 
        disabled 
        size={size}
        className={className}
      >
        <Users className="w-4 h-4 mr-2" />
        Carregando...
      </Button>
    );
  }

  if (!isFollowing) {
    if (showFollowLevel && targetType === 'group') {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="default" 
              size={size}
              className={className}
              disabled={isFollowPending}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Seguir
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleFollow('public')}>
              Como Público
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFollow('member')}>
              Como Membro
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button 
        variant="default" 
        onClick={() => handleFollow()}
        disabled={isFollowPending}
        size={size}
        className={className}
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Seguir
        {followerCount > 0 && (
          <span className="ml-2 text-xs bg-background/10 px-1.5 py-0.5 rounded">
            {followerCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button 
        variant="outline" 
        onClick={handleUnfollow}
        disabled={isUnfollowPending}
        size={size}
      >
        <UserMinus className="w-4 h-4 mr-2" />
        Seguindo
        {followerCount > 0 && (
          <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">
            {followerCount}
          </span>
        )}
      </Button>

      {showFollowLevel && followRelationship && (
        <DropdownMenu open={showLevelMenu} onOpenChange={setShowLevelMenu}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isUpdatePending}>
              {followLevelLabels[followRelationship.follow_level]}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.entries(followLevelLabels).map(([level, label]) => (
              <DropdownMenuItem 
                key={level}
                onClick={() => handleUpdateLevel(level as FollowLevel)}
                className={cn(
                  followRelationship.follow_level === level && "bg-muted"
                )}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}