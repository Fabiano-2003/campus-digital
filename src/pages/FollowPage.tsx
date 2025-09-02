import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { SuggestedFollows } from '@/components/follow/SuggestedFollows';
import { FollowNotifications } from '@/components/follow/FollowNotifications';
import { UserStats } from '@/components/ui/user-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Bell } from 'lucide-react';

export default function FollowPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Faça login para acessar esta página</div>;
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Rede Social</h1>
        </div>

        {/* User Stats Overview */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Sua Rede
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserStats userId={user.id} className="justify-center" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <div className="space-y-6">
            <FollowNotifications />
          </div>

          {/* Suggestions */}
          <div className="space-y-6">
            <SuggestedFollows />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}