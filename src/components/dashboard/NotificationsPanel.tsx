import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, Mail, Users, FileText, Star, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export function NotificationsPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar notificações
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Marcar todas como lidas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("Todas as notificações foram marcadas como lidas");
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <Mail className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'achievement':
        return <Star className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'text-blue-500';
      case 'group':
        return 'text-green-500';
      case 'document':
        return 'text-purple-500';
      case 'achievement':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  // Filtrar notificações
  const unreadNotifications = notifications?.filter(n => !n.read) || [];
  const readNotifications = notifications?.filter(n => n.read) || [];

  // Dados de exemplo para demonstrar a funcionalidade
  const exampleNotifications = [
    {
      id: 'example-1',
      title: 'Bem-vindo à Plataforma!',
      message: 'Parabéns por se juntar à nossa comunidade acadêmica. Explore livros, participe de grupos de estudo e crie documentos incríveis!',
      type: 'info',
      read: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'example-2',
      title: 'Novo Grupo de Matemática',
      message: 'Um novo grupo de estudo de Cálculo I foi criado na sua instituição. Que tal participar?',
      type: 'group',
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'example-3',
      title: 'Livro Recomendado',
      message: 'Baseado nos seus interesses, temos uma nova recomendação de livro de Física Quântica.',
      type: 'document',
      read: true,
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  // Usar notificações reais se existirem, senão usar exemplos
  const displayNotifications = notifications?.length ? notifications : exampleNotifications;
  const displayUnread = displayNotifications.filter(n => !n.read);
  const displayRead = displayNotifications.filter(n => n.read);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Central de Notificações
              </CardTitle>
              <CardDescription>
                Acompanhe suas atividades e novidades da plataforma
              </CardDescription>
            </div>
            {displayUnread.length > 0 && (
              <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                <Check className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="unread" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unread" className="flex items-center gap-2">
            Não lidas
            {displayUnread.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {displayUnread.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value="unread">
          <div className="space-y-4">
            {displayUnread.length > 0 ? (
              displayUnread.map((notification) => (
                <Card key={notification.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full bg-muted ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{notification.type}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!notification.read && notifications?.length && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Você não tem notificações não lidas!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-4">
            {displayNotifications.length > 0 ? (
              displayNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`${notification.read ? 'opacity-75' : 'border-l-4 border-l-primary'}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full bg-muted ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{notification.type}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                            {notification.read && (
                              <Badge variant="secondary" className="text-xs">
                                Lida
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Você ainda não tem notificações.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}