
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Clock, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SearchUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  institution?: string;
  friendship_status: 'pending' | 'accepted' | null;
  is_requester: boolean;
}

export function UserSearch() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['searchUsers', searchQuery, user?.id],
    queryFn: () => apiClient.searchUsers(searchQuery, user!.id),
    enabled: !!user?.id && searchQuery.length >= 2,
  });

  const sendRequestMutation = useMutation({
    mutationFn: (targetUserId: string) => 
      apiClient.sendFriendRequest(targetUserId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchUsers'] });
      toast({
        title: "Sucesso",
        description: "Pedido de amizade enviado!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao enviar pedido de amizade",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  const getStatusBadge = (searchUser: SearchUser) => {
    if (!searchUser.friendship_status) return null;
    
    if (searchUser.friendship_status === 'accepted') {
      return <Badge variant="secondary" className="text-xs">Amigos</Badge>;
    }
    
    if (searchUser.friendship_status === 'pending') {
      return searchUser.is_requester ? (
        <Badge variant="outline" className="text-xs">Enviado</Badge>
      ) : (
        <Badge variant="outline" className="text-xs">Pendente</Badge>
      );
    }
  };

  const canSendRequest = (searchUser: SearchUser) => {
    return !searchUser.friendship_status;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Encontrar Amigos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar usuários por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {searchQuery.length >= 2 && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm">Pesquisando...</p>
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              searchResults.map((searchUser: SearchUser) => (
                <div key={searchUser.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={searchUser.avatar_url} />
                    <AvatarFallback>
                      {searchUser.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {searchUser.full_name}
                      </p>
                      {getStatusBadge(searchUser)}
                    </div>
                    {searchUser.bio && (
                      <p className="text-xs text-muted-foreground truncate">
                        {searchUser.bio}
                      </p>
                    )}
                    {searchUser.institution && (
                      <p className="text-xs text-muted-foreground">
                        {searchUser.institution}
                      </p>
                    )}
                  </div>
                  {canSendRequest(searchUser) && (
                    <Button
                      size="sm"
                      onClick={() => sendRequestMutation.mutate(searchUser.id)}
                      disabled={sendRequestMutation.isPending}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm">
                  Nenhum usuário encontrado
                </p>
              </div>
            )}
          </div>
        )}

        {searchQuery.length < 2 && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-sm">
              Digite pelo menos 2 caracteres para pesquisar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
