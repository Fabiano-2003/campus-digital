
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Users, Send, Calendar, MapPin, BookOpen, Crown, Settings, UserPlus, MoreVertical, FileText, Download, Heart, MessageCircle, Eye } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GroupMeetings } from "@/components/groups/GroupMeetings";

interface GroupDetail {
  id: string;
  name: string;
  description: string;
  subject: string;
  level: string;
  institution: string;
  max_members: number;
  created_at: string;
  created_by: string;
}

interface Message {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface GroupBook {
  id: string;
  title: string;
  author: string;
  description: string;
  file_url: string;
  cover_url?: string;
  category: string;
  subject: string;
  download_count: number;
  created_at: string;
  uploaded_by: string;
  profiles?: {
    full_name?: string;
  };
}

interface GroupPost {
  id: string;
  content: string;
  post_type: string;
  likes: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [groupBooks, setGroupBooks] = useState<GroupBook[]>([]);
  const [groupPosts, setGroupPosts] = useState<GroupPost[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'books' | 'posts' | 'members' | 'meetings'>('chat');

  useEffect(() => {
    if (id && user) {
      fetchGroupDetail();
      fetchMembers();
      fetchMessages();
      fetchGroupBooks();
      fetchGroupPosts();
      checkMembership();
    }
  }, [id, user]);

  useEffect(() => {
    if (!id || !isMember) return;

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`group_messages_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${id}`
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
  }, [id, isMember]);

  const fetchGroupDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('study_groups')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setGroup(data);

      // Carregar livros relacionados ao assunto do grupo
      if (data) {
        const { data: booksData, error: booksError } = await supabase
          .from('books')
          .select(`
            *,
            profiles:uploaded_by (
              full_name
            )
          `)
          .eq('subject', data.subject)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(20);

        if (!booksError) {
          setGroupBooks(booksData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching group:', error);
      toast({
        title: "Erro ao carregar grupo",
        description: "Grupo não encontrado ou foi desativado.",
        variant: "destructive",
      });
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', id)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
      
      // Carregar posts após carregar membros
      if (data && data.length > 0) {
        const memberIds = data.map(member => member.user_id);
        
        const { data: postsData, error: postsError } = await supabase
          .from('feed_posts')
          .select(`
            *,
            profiles:user_id (
              full_name,
              avatar_url
            )
          `)
          .in('user_id', memberIds)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(10);

        if (!postsError) {
          setGroupPosts(postsData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchGroupBooks = async () => {
    if (!group) return;
    
    try {
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          profiles:uploaded_by (
            full_name
          )
        `)
        .eq('subject', group.subject)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setGroupBooks(data || []);
    } catch (error) {
      console.error('Error fetching group books:', error);
    }
  };

  const fetchGroupPosts = async () => {
    try {
      // Buscar posts dos membros do grupo
      const memberIds = members.map(member => member.user_id);
      
      if (memberIds.length === 0) return;

      const { data, error } = await supabase
        .from('feed_posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .in('user_id', memberIds)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setGroupPosts(data || []);
    } catch (error) {
      console.error('Error fetching group posts:', error);
    }
  };

  const checkMembership = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('id, role')
        .eq('group_id', id)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setIsMember(true);
        setUserRole(data.role);
      } else {
        setIsMember(false);
        setUserRole(null);
      }
    } catch (error) {
      setIsMember(false);
      setUserRole(null);
    }
  };

  const joinGroup = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (members.length >= (group?.max_members || 50)) {
      toast({
        title: "Grupo lotado",
        description: "Este grupo já atingiu o número máximo de membros.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('group_members')
        .insert([{
          group_id: id,
          user_id: user.id,
          role: 'member'
        }]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Você já faz parte deste grupo",
            description: "Você já é membro deste grupo de estudo.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      setIsMember(true);
      setUserRole('member');
      fetchMembers();
      toast({
        title: "Bem-vindo ao grupo! 🎉",
        description: "Você agora pode participar das discussões.",
      });
    } catch (error: any) {
      console.error('Error joining group:', error);
      toast({
        title: "Erro ao entrar no grupo",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    if (!newMessage.trim() || !isMember || !user) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const { error } = await supabase
        .from('group_messages')
        .insert([{
          group_id: id,
          user_id: user.id,
          message: messageText
        }]);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error sending message:', error);
      setNewMessage(messageText); // Restore message on error
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const leaveGroup = async () => {
    if (!user || !isMember) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setIsMember(false);
      setUserRole(null);
      fetchMembers();
      toast({
        title: "Você saiu do grupo",
        description: "Você não faz mais parte deste grupo.",
      });
    } catch (error: any) {
      console.error('Error leaving group:', error);
      toast({
        title: "Erro ao sair do grupo",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="h-32 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="h-48 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!group) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Grupo não encontrado</h2>
              <p className="text-muted-foreground mb-4">
                O grupo que você procura não existe ou foi removido.
              </p>
              <Button onClick={() => navigate('/groups')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos grupos
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbNav />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/groups')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {group.name}
                {userRole === 'admin' && <Crown className="h-6 w-6 text-yellow-500" />}
              </h1>
              <p className="text-muted-foreground">{group.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isMember ? (
              <Button onClick={joinGroup} className="bg-gradient-to-r from-primary to-secondary">
                <UserPlus className="h-4 w-4 mr-2" />
                Participar ({members.length}/{group.max_members})
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {userRole === 'admin' && (
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={leaveGroup} className="text-red-600">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Sair do Grupo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Group Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Informações do Grupo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Matéria</p>
                      <p className="font-medium capitalize">{group.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-secondary/5 rounded-lg">
                    <Users className="h-4 w-4 text-secondary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Nível</p>
                      <p className="font-medium capitalize">{group.level}</p>
                    </div>
                  </div>
                  {group.institution && (
                    <div className="flex items-center gap-2 p-3 bg-accent/5 rounded-lg">
                      <MapPin className="h-4 w-4 text-accent" />
                      <div>
                        <p className="text-xs text-muted-foreground">Instituição</p>
                        <p className="font-medium uppercase">{group.institution}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Criado</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(group.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Content */}
            <Card className="flex-1">
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                  <div className="px-6 pt-6">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="chat" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Chat
                      </TabsTrigger>
                      <TabsTrigger value="books" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Livros ({groupBooks.length})
                      </TabsTrigger>
                      <TabsTrigger value="posts" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Posts ({groupPosts.length})
                      </TabsTrigger>
                      <TabsTrigger value="meetings" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Reuniões
                      </TabsTrigger>
                      <TabsTrigger value="members" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Membros ({members.length})
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="chat" className="px-6 pb-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Chat do Grupo</h3>
                        {isMember && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Conectado
                          </Badge>
                        )}
                      </div>
                      
                      {!isMember ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                            <Users className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Participe para conversar</h3>
                          <p className="text-muted-foreground mb-4">
                            Você precisa ser membro do grupo para participar das discussões
                          </p>
                          <Button onClick={joinGroup} className="bg-gradient-to-r from-primary to-secondary">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Participar do Grupo
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="max-h-96 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
                            {messages.length === 0 ? (
                              <div className="text-center py-8">
                                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                                  <Send className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-muted-foreground">
                                  Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!
                                </p>
                              </div>
                            ) : (
                              messages.map((message) => (
                                <div key={message.id} className="flex gap-3 group hover:bg-white/50 p-2 rounded-lg transition-colors">
                                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                                      {message.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-sm text-gray-900">
                                        {message.profiles?.full_name || 'Usuário'}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(message.created_at), { 
                                          addSuffix: true, 
                                          locale: ptBR 
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 break-words">{message.message}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Digite sua mensagem..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={sendMessage}
                              className="flex-1"
                              maxLength={500}
                            />
                            <Button 
                              onClick={() => sendMessage()} 
                              disabled={!newMessage.trim()}
                              className="bg-gradient-to-r from-primary to-secondary"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {newMessage.length}/500 caracteres
                          </p>
                        </>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="books" className="px-6 pb-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Livros Relacionados - {group.subject}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {groupBooks.map((book) => (
                          <Card key={book.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex gap-3">
                                <div className="w-12 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded flex items-center justify-center">
                                  <BookOpen className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm line-clamp-1">{book.title}</h4>
                                  <p className="text-xs text-muted-foreground mb-1">por {book.author}</p>
                                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">{book.description}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Download className="h-3 w-3" />
                                      <span>{book.download_count} downloads</span>
                                    </div>
                                    <Button size="sm" variant="outline" className="text-xs">
                                      Ver Livro
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {groupBooks.length === 0 && (
                          <div className="col-span-2 text-center py-8">
                            <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              Nenhum livro encontrado para {group.subject}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="posts" className="px-6 pb-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Publicações dos Membros</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {groupPosts.map((post) => (
                          <Card key={post.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex gap-3">
                                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                                    {post.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm">
                                      {post.profiles?.full_name || 'Usuário'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(post.created_at), { 
                                        addSuffix: true, 
                                        locale: ptBR 
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-2 line-clamp-3">{post.content}</p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Heart className="h-3 w-3" />
                                      {post.likes}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MessageCircle className="h-3 w-3" />
                                      {post.comments_count}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {groupPosts.length === 0 && (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              Nenhuma publicação dos membros ainda
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="meetings" className="px-6 pb-6">
                    <GroupMeetings 
                      groupId={group.id}
                      userRole={userRole}
                      isMember={isMember}
                    />
                  </TabsContent>

                  <TabsContent value="members" className="px-6 pb-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Membros do Grupo</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                        {members.map((member) => (
                          <Card key={member.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                                    {member.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm truncate">
                                      {member.profiles?.full_name || 'Usuário'}
                                    </p>
                                    {member.role === 'admin' && (
                                      <Crown className="h-4 w-4 text-yellow-500" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                                      {member.role === 'admin' ? 'Administrador' : 'Membro'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(member.joined_at), { 
                                        addSuffix: true, 
                                        locale: ptBR 
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Group Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Membros</span>
                    </div>
                    <Badge variant="outline">
                      {members.length}/{group.max_members}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-medium">Livros</span>
                    </div>
                    <Badge variant="outline">
                      {groupBooks.length}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium">Posts</span>
                    </div>
                    <Badge variant="outline">
                      {groupPosts.length}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Mensagens</span>
                    </div>
                    <Badge variant="outline">
                      {messages.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {isMember && (
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Ver Documentos
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('meetings')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver Reuniões
                    </Button>
                    {userRole === 'admin' && (
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurações
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
