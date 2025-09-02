import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Play, Eye, Heart, Search, Calendar, User, Clock, Upload } from "lucide-react";

interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: number;
  category: string;
  subject?: string;
  institution?: string;
  level?: string;
  instructor?: string;
  views: number;
  likes: number;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export function VideosFeed() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    video_url: "",
    category: "educational",
    subject: "",
    instructor: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Erro ao carregar vídeos",
        description: "Não foi possível carregar a lista de vídeos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ views: videos.find(v => v.id === videoId)?.views + 1 || 1 })
        .eq('id', videoId);

      if (error) throw error;
      
      setVideos(prev => prev.map(v => 
        v.id === videoId ? { ...v, views: v.views + 1 } : v
      ));
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Duração não informada";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const uploadVideo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('videos')
        .insert([{
          ...uploadData,
          uploaded_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Vídeo adicionado",
        description: "O vídeo foi adicionado com sucesso ao feed.",
      });

      setShowUpload(false);
      setUploadData({
        title: "",
        description: "",
        video_url: "",
        category: "educational",
        subject: "",
        instructor: ""
      });
      fetchVideos();
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Erro ao adicionar vídeo",
        description: "Não foi possível adicionar o vídeo.",
        variant: "destructive",
      });
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || video.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(videos.map(video => video.category))];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar vídeos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setShowUpload(true)} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Adicionar Vídeo
        </Button>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Adicionar Vídeo</h3>
            <Input
              placeholder="Título do vídeo"
              value={uploadData.title}
              onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
            />
            <Input
              placeholder="URL do vídeo (YouTube, Vimeo, etc.)"
              value={uploadData.video_url}
              onChange={(e) => setUploadData(prev => ({ ...prev, video_url: e.target.value }))}
            />
            <Input
              placeholder="Descrição (opcional)"
              value={uploadData.description}
              onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
            />
            <Input
              placeholder="Matéria/Disciplina"
              value={uploadData.subject}
              onChange={(e) => setUploadData(prev => ({ ...prev, subject: e.target.value }))}
            />
            <Input
              placeholder="Instrutor/Professor"
              value={uploadData.instructor}
              onChange={(e) => setUploadData(prev => ({ ...prev, instructor: e.target.value }))}
            />
            <Select 
              value={uploadData.category} 
              onValueChange={(value) => setUploadData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="educational">Educacional</SelectItem>
                <SelectItem value="tutorial">Tutorial</SelectItem>
                <SelectItem value="lecture">Aula</SelectItem>
                <SelectItem value="presentation">Apresentação</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={uploadVideo} className="flex-1" disabled={!uploadData.title || !uploadData.video_url}>
                Adicionar
              </Button>
              <Button variant="outline" onClick={() => setShowUpload(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Play className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum vídeo encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm || categoryFilter !== "all" 
                ? "Tente ajustar os filtros de busca." 
                : "Ainda não há vídeos disponíveis."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(video.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      {video.instructor && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {video.instructor}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(video.duration)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {video.category.charAt(0).toUpperCase() + video.category.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {video.description && (
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {video.description}
                  </p>
                )}
                {video.subject && (
                  <Badge variant="outline" className="mb-4">
                    {video.subject}
                  </Badge>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {video.views} visualizações
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {video.likes} curtidas
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => {
                          setSelectedVideo(video);
                          incrementViews(video.id);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Assistir
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                      {selectedVideo && (
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">{selectedVideo.title}</h3>
                          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                            {selectedVideo.video_url.includes('youtube.com') || selectedVideo.video_url.includes('youtu.be') ? (
                              <iframe
                                src={selectedVideo.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                className="w-full h-full"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={selectedVideo.video_url}
                                controls
                                className="w-full h-full"
                              />
                            )}
                          </div>
                          {selectedVideo.description && (
                            <p className="text-muted-foreground">{selectedVideo.description}</p>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}