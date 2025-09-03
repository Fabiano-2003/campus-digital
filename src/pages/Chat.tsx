import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Send, Users, MessageCircle, UserPlus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FriendRequests } from "@/components/chat/FriendRequests";
import { UserSearch } from "@/components/chat/UserSearch";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface Conversation {
  id: string;
  participant: User;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender_name?: string;
}

export default function Chat() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');

  // Get friends list
  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ['friends', user?.id, searchTerm],
    queryFn: () => apiClient.getFriends(user!.id, searchTerm),
    enabled: !!user?.id,
  });

  // Real-time subscription para mensagens
  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`private_messages_${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `conversation_id=eq.${selectedConversation}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  const startConversation = async (userId: string) => {
    try {
      if (!user) return;

      // Criar ou buscar conversa existente usando API
      const conversation = await apiClient.createConversation(userId, user.id);
      
      setSelectedConversation(conversation.id);
      loadMessages(conversation.id);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Erro ao iniciar conversa",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      if (!user) return;
      
      const data = await apiClient.getConversationMessages(conversationId, user.id);
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      await apiClient.sendMessage(selectedConversation, newMessage.trim(), user.id);
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const selectedFriend = friends?.find((f: any) => f.id === selectedConversation);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
            {/* Sidebar */}
            <div className="lg:w-1/3 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Chat</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant={activeTab === 'friends' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('friends')}
                      className="flex-1 text-xs"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Amigos
                    </Button>
                    <Button
                      variant={activeTab === 'requests' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('requests')}
                      className="flex-1 text-xs"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Pedidos
                    </Button>
                    <Button
                      variant={activeTab === 'search' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('search')}
                      className="flex-1 text-xs"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Buscar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeTab === 'friends' && (
                    <>
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Pesquisar amigos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {friendsLoading ? (
                          <div className="text-center py-4">
                            <p className="text-muted-foreground text-sm">Carregando...</p>
                          </div>
                        ) : friends && friends.length > 0 ? (
                          friends.map((friend: any) => (
                            <div
                              key={friend.id}
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                selectedConversation === friend.id
                                  ? 'bg-primary/10 border border-primary/20'
                                  : 'hover:bg-muted/50'
                              }`}
                              onClick={() => startConversation(friend.id)}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>
                                    {friend.full_name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate">
                                    {friend.full_name || 'Usuário'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Clique para conversar
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground text-sm">Nenhum amigo ainda</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveTab('search')}
                              className="mt-2"
                            >
                              Encontrar usuários
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {activeTab === 'requests' && (
                    <div className="max-h-96 overflow-y-auto">
                      <FriendRequests />
                    </div>
                  )}

                  {activeTab === 'search' && (
                    <div className="max-h-96 overflow-y-auto">
                      <UserSearch />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:w-2/3">
              <Card className="h-full flex flex-col">
                {selectedConversation && selectedFriend ? (
                  <>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {selectedFriend.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{selectedFriend.full_name || 'Usuário'}</span>
                      </CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="flex-1 flex flex-col p-0">
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-center py-8">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!
                            </p>
                          </div>
                        ) : (
                          messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  message.sender_id === user?.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <Separator />
                      <div className="p-4 flex gap-2">
                        <Input
                          placeholder="Digite sua mensagem..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Selecione um amigo</h3>
                      <p className="text-muted-foreground">
                        Escolha um amigo para começar a conversar
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}