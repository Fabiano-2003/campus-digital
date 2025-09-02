import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FollowButton } from '@/components/ui/follow-button';
import { useUserFollowStats } from '@/hooks/useFollow';
import { Users, BookOpen, FileText } from 'lucide-react';

interface UserProfileProps {
  userId: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  institution?: string;
  course?: string;
  academicLevel?: string;
  isOwnProfile?: boolean;
}

export function UserProfile({
  userId,
  fullName,
  avatarUrl,
  bio,
  institution,
  course,
  academicLevel,
  isOwnProfile = false
}: UserProfileProps) {
  const { followingCount, followerCount } = useUserFollowStats(userId);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback className="text-lg">
              {fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="text-xl font-semibold">{fullName || 'Usuário'}</h3>
            {bio && (
              <p className="text-sm text-muted-foreground mt-1">{bio}</p>
            )}
          </div>

          {!isOwnProfile && (
            <FollowButton 
              targetType="user" 
              targetId={userId}
              className="w-full"
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Academic Info */}
        {(institution || course || academicLevel) && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Informações Acadêmicas</h4>
            <div className="flex flex-wrap gap-2">
              {institution && (
                <Badge variant="outline">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {institution}
                </Badge>
              )}
              {course && (
                <Badge variant="outline">
                  <FileText className="w-3 h-3 mr-1" />
                  {course}
                </Badge>
              )}
              {academicLevel && (
                <Badge variant="outline">
                  {academicLevel}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-center">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{followingCount} seguindo</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}