import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Send, Users, MessageCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

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
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'conversations' | 'users'>('conversations');
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    getCurrentUser();
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchConversations();
    }
  }, [activeTab]);

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

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .neq('id', currentUserId)
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchConversations = async () => {
    // Simulando conversas - em uma implementação real, você teria uma tabela de conversas
    // Por enquanto, vamos mostrar usuários com quem já interagiu
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .neq('id', currentUserId)
        .limit(10);

      if (error) throw error;
      
      const mockConversations: Conversation[] = (data || []).map(user => ({
        id: `conv_${user.id}`,
        participant: user,
        last_message: "Clique para iniciar uma conversa",
        last_message_time: new Date().toISOString(),
        unread_count: 0
      }));

      setConversations(mockConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const startConversation = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Criar ou buscar conversa existente
      const { data: conversation, error } = await supabase
        .from('conversations')
        .upsert({
          participant_1: user.id < userId ? user.id : userId,
          participant_2: user.id < userId ? userId : user.id
        })
        .select()
        .single();

      if (error) throw error;

      setSelectedConversation(conversation.id);
      loadMessages(conversation.id);
      setActiveTab('conversations');
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
      const { data, error } = await supabase
        .from('private_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('private_messages')
        .insert([{
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: newMessage.trim()
        }]);

      if (error) throw error;

      setNewMessage("");
      // Não precisamos recarregar mensagens pois o real-time vai atualizar automaticamente
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConversations = conversations.filter(conv =>
    conv.participant.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
            {/* Sidebar */}
            <div className="lg:w-1/3 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mensagens</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={activeTab === 'conversations' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('conversations')}
                      className="flex-1"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Conversas
                    </Button>
                    <Button
                      variant={activeTab === 'users' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('users')}
                      className="flex-1"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Usuários
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {activeTab === 'conversations' ? (
                      filteredConversations.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Nenhuma conversa ainda</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab('users')}
                            className="mt-2"
                          >
                            Encontrar usuários
                          </Button>
                        </div>
                      ) : (
                        filteredConversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedConversation === conversation.participant.id
                                ? 'bg-primary/10 border border-primary/20'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => startConversation(conversation.participant.id)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {conversation.participant.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">
                                  {conversation.participant.full_name || 'Usuário'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {conversation.last_message}
                                </p>
                              </div>
                              {conversation.unread_count > 0 && (
                                <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                  {conversation.unread_count}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )
                    ) : (
                      filteredUsers.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                        </div>
                      ) : (
                        filteredUsers.map((user) => (
                          <div
                            key={user.id}
                            className="p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => startConversation(user.id)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {user.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-semibold text-sm">
                                  {user.full_name || 'Usuário'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Clique para iniciar conversa
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:w-2/3">
              <Card className="h-full flex flex-col">
                {selectedConversation ? (
                  <>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {users.find(u => u.id === selectedConversation)?.full_name?.charAt(0) || 
                             conversations.find(c => c.participant.id === selectedConversation)?.participant.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {users.find(u => u.id === selectedConversation)?.full_name || 
                           conversations.find(c => c.participant.id === selectedConversation)?.participant.full_name || 'Usuário'}
                        </span>
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
                                message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  message.sender_id === currentUserId
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
                      <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
                      <p className="text-muted-foreground">
                        Escolha um usuário para começar a conversar
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