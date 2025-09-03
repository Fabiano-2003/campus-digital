
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ListMusic, Plus, BookOpen, Play, GraduationCap, Trash2, Edit, Share } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  cover_url: string | null;
  created_at: string;
  items_count?: number;
}

interface PlaylistItem {
  id: string;
  item_type: 'video' | 'book' | 'monograph';
  item_id: string;
  position: number;
  added_at: string;
  title?: string;
  author?: string;
  thumbnail_url?: string;
}

export function PlaylistsSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [newPlaylistData, setNewPlaylistData] = useState({
    name: "",
    description: "",
    is_public: false
  });

  // Fetch user playlists
  const { data: playlists, isLoading: playlistsLoading } = useQuery({
    queryKey: ['user-playlists', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          playlist_items(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(playlist => ({
        ...playlist,
        items_count: playlist.playlist_items?.[0]?.count || 0
      }));
    },
    enabled: !!user?.id
  });

  // Fetch playlist items
  const { data: playlistItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['playlist-items', selectedPlaylist],
    queryFn: async () => {
      if (!selectedPlaylist) return [];
      
      const { data, error } = await supabase
        .from('playlist_items')
        .select('*')
        .eq('playlist_id', selectedPlaylist)
        .order('position');

      if (error) throw error;

      // Fetch additional data for each item
      const itemsWithDetails = await Promise.all(
        data.map(async (item) => {
          let itemDetails = {};
          
          if (item.item_type === 'video') {
            const { data: video } = await supabase
              .from('videos')
              .select('title, instructor, thumbnail_url')
              .eq('id', item.item_id)
              .single();
            itemDetails = { title: video?.title, author: video?.instructor, thumbnail_url: video?.thumbnail_url };
          } else if (item.item_type === 'book') {
            const { data: book } = await supabase
              .from('books')
              .select('title, author, cover_url')
              .eq('id', item.item_id)
              .single();
            itemDetails = { title: book?.title, author: book?.author, thumbnail_url: book?.cover_url };
          } else if (item.item_type === 'monograph') {
            const { data: mono } = await supabase
              .from('monographs')
              .select('title, author')
              .eq('id', item.item_id)
              .single();
            itemDetails = { title: mono?.title, author: mono?.author };
          }

          return { ...item, ...itemDetails };
        })
      );

      return itemsWithDetails;
    },
    enabled: !!selectedPlaylist
  });

  // Create playlist mutation
  const createPlaylistMutation = useMutation({
    mutationFn: async (playlistData: typeof newPlaylistData) => {
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          ...playlistData,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-playlists'] });
      toast.success("Playlist criada com sucesso!");
      setIsCreateDialogOpen(false);
      setNewPlaylistData({ name: "", description: "", is_public: false });
    },
    onError: (error) => {
      console.error("Error creating playlist:", error);
      toast.error("Erro ao criar playlist");
    }
  });

  // Delete playlist mutation
  const deletePlaylistMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-playlists'] });
      toast.success("Playlist removida com sucesso!");
      if (selectedPlaylist) setSelectedPlaylist(null);
    },
    onError: (error) => {
      console.error("Error deleting playlist:", error);
      toast.error("Erro ao remover playlist");
    }
  });

  const handleCreatePlaylist = () => {
    if (!newPlaylistData.name.trim()) {
      toast.error("Nome da playlist é obrigatório");
      return;
    }
    createPlaylistMutation.mutate(newPlaylistData);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'book': return BookOpen;
      case 'monograph': return GraduationCap;
      default: return BookOpen;
    }
  };

  if (playlistsLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <ListMusic className="h-5 w-5 text-primary" />
                <span>Minhas Playlists</span>
              </CardTitle>
              <CardDescription>
                Organize seus vídeos, livros e monografias em playlists personalizadas
              </CardDescription>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Playlist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Playlist</DialogTitle>
                  <DialogDescription>
                    Crie uma playlist para organizar seus conteúdos favoritos
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Playlist</Label>
                    <Input
                      id="name"
                      value={newPlaylistData.name}
                      onChange={(e) => setNewPlaylistData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Matemática Avançada"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newPlaylistData.description}
                      onChange={(e) => setNewPlaylistData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição da playlist..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public"
                      checked={newPlaylistData.is_public}
                      onCheckedChange={(checked) => setNewPlaylistData(prev => ({ ...prev, is_public: checked }))}
                    />
                    <Label htmlFor="public">Playlist pública</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreatePlaylist} disabled={createPlaylistMutation.isPending}>
                      {createPlaylistMutation.isPending ? "Criando..." : "Criar"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Playlists Grid */}
      {selectedPlaylist ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Itens da Playlist</CardTitle>
              <Button variant="outline" onClick={() => setSelectedPlaylist(null)}>
                Voltar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {playlistItems?.map((item, index) => {
                  const ItemIcon = getItemIcon(item.item_type);
                  return (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                        <ItemIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.author}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {item.item_type}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
                {(!playlistItems || playlistItems.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Esta playlist está vazia</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists?.map((playlist) => (
            <Card key={playlist.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6" onClick={() => setSelectedPlaylist(playlist.id)}>
                <div className="space-y-4">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                    <ListMusic className="h-8 w-8 text-primary" />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg line-clamp-2">{playlist.name}</h3>
                    {playlist.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {playlist.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={playlist.is_public ? "default" : "outline"}>
                        {playlist.is_public ? "Pública" : "Privada"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {playlist.items_count} itens
                      </span>
                    </div>
                    
                    <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deletePlaylistMutation.mutate(playlist.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Criada {formatDistanceToNow(new Date(playlist.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!playlists || playlists.length === 0) && (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <ListMusic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">Nenhuma playlist criada</h3>
                <p className="text-muted-foreground mb-4">
                  Crie sua primeira playlist para organizar seus conteúdos favoritos
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Playlist
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
