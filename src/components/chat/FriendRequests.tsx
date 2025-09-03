
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, X, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface FriendRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  requester: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export function FriendRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['friendRequests', user?.id],
    queryFn: () => apiClient.getFriendRequests(user!.id),
    enabled: !!user?.id,
  });

  const acceptMutation = useMutation({
    mutationFn: (friendshipId: string) => 
      apiClient.acceptFriendRequest(friendshipId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('Pedido de amizade aceito!');
    },
    onError: () => {
      toast.error('Erro ao aceitar pedido de amizade');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (friendshipId: string) => 
      apiClient.rejectFriendRequest(friendshipId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast.success('Pedido de amizade rejeitado');
    },
    onError: () => {
      toast.error('Erro ao rejeitar pedido de amizade');
    },
  });

  if (!user || isLoading) return null;

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Pedidos de Amizade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-4">
            Nenhum pedido de amizade pendente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Pedidos de Amizade
          <Badge variant="secondary">{requests.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((request: FriendRequest) => (
          <div key={request.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={request.requester.avatar_url} />
              <AvatarFallback>
                {request.requester.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">
                {request.requester.full_name}
              </p>
              <p className="text-xs text-muted-foreground">
                Enviou um pedido de amizade
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => acceptMutation.mutate(request.id)}
                disabled={acceptMutation.isPending}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rejectMutation.mutate(request.id)}
                disabled={rejectMutation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
