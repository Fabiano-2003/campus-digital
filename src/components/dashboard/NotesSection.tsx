
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  BookMarked, 
  Edit3, 
  Trash2, 
  Share2, 
  Tag, 
  Star, 
  Clock, 
  Eye,
  Lock,
  Globe,
  FolderOpen,
  PenTool,
  Save,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  subject: string;
  category: string;
  isPublic: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NoteFolder {
  id: string;
  name: string;
  color: string;
  noteCount: number;
}

export const NotesSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: "",
    subject: "",
    category: "general",
    isPublic: false
  });

  // Mock data - in real app, this would come from Supabase
  const mockFolders: NoteFolder[] = [
    { id: "all", name: "Todas as Notas", color: "#6366f1", noteCount: 24 },
    { id: "mathematics", name: "Matemática", color: "#ef4444", noteCount: 8 },
    { id: "programming", name: "Programação", color: "#10b981", noteCount: 12 },
    { id: "history", name: "História", color: "#f59e0b", noteCount: 4 }
  ];

  const mockNotes: Note[] = [
    {
      id: "1",
      title: "Algoritmos de Ordenação",
      content: "Bubble Sort: O algoritmo mais simples, compara elementos adjacentes e os troca se estiverem na ordem errada.\n\nMerge Sort: Usa estratégia divide e conquista, tem complexidade O(n log n)...",
      tags: ["algoritmos", "ordenação", "complexidade"],
      subject: "Ciência da Computação",
      category: "programming",
      isPublic: true,
      isFavorite: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "2",
      title: "Derivadas e Integrais",
      content: "Regras básicas de derivação:\n1. Regra da potência: d/dx[x^n] = nx^(n-1)\n2. Regra do produto: d/dx[fg] = f'g + fg'...",
      tags: ["cálculo", "derivadas", "integrais"],
      subject: "Matemática",
      category: "mathematics",
      isPublic: false,
      isFavorite: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    // Simulate API call
    const note: Note = {
      id: Date.now().toString(),
      ...newNote,
      tags: newNote.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    toast.success("Nota criada com sucesso!");
    setIsCreatingNote(false);
    setNewNote({
      title: "",
      content: "",
      tags: "",
      subject: "",
      category: "general",
      isPublic: false
    });
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      tags: note.tags.join(", "),
      subject: note.subject,
      category: note.category,
      isPublic: note.isPublic
    });
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;

    toast.success("Nota actualizada com sucesso!");
    setEditingNote(null);
    setNewNote({
      title: "",
      content: "",
      tags: "",
      subject: "",
      category: "general",
      isPublic: false
    });
  };

  const filteredNotes = mockNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFolder = selectedFolder === "all" || note.category === selectedFolder;
    
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            📝 Minhas Notas
          </h2>
          <p className="text-muted-foreground mt-1">
            Organize seus estudos com notas inteligentes
          </p>
        </div>
        <Button 
          onClick={() => setIsCreatingNote(true)}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Nota
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Folders */}
        <div className="space-y-4">
          <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Pastas
              </h3>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockFolders.map(folder => (
                <Button
                  key={folder.id}
                  variant={selectedFolder === folder.id ? "default" : "ghost"}
                  className={`w-full justify-between text-left h-auto py-3 ${
                    selectedFolder === folder.id 
                      ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                      : ''
                  }`}
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: folder.color }}
                    />
                    <span className="font-medium">{folder.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {folder.noteCount}
                  </Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-4 space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24</div>
                <div className="text-sm text-muted-foreground">Total de Notas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">8</div>
                <div className="text-sm text-muted-foreground">Favoritas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">5</div>
                <div className="text-sm text-muted-foreground">Públicas</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-0 bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl transition-shadow"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="general">Geral</SelectItem>
                <SelectItem value="mathematics">Matemática</SelectItem>
                <SelectItem value="programming">Programação</SelectItem>
                <SelectItem value="history">História</SelectItem>
                <SelectItem value="science">Ciências</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 mb-1 group-hover:text-primary transition-colors">
                            {note.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(note.updatedAt).toLocaleDateString('pt-BR')}</span>
                            {note.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {note.isFavorite && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditNote(note);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                        {note.content}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {note.tags.slice(0, 3).map(tag => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20"
                          >
                            #{tag}
                          </Badge>
                        ))}
                        {note.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{note.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className="text-xs px-2 py-1 border-gray-200"
                        >
                          {note.subject}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Share2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredNotes.length === 0 && (
            <Card className="text-center py-16 border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
              <CardContent>
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                  <BookMarked className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Nenhuma nota encontrada</h3>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
                  {searchTerm ? 
                    "Não encontramos notas que correspondam à sua busca." : 
                    "Comece a criar suas notas de estudo e mantenha todo o conhecimento organizado."
                  }
                </p>
                <Button 
                  onClick={() => setIsCreatingNote(true)}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-full px-6 py-2 font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Nota
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create/Edit Note Dialog */}
      <Dialog open={isCreatingNote || !!editingNote} onOpenChange={(open) => {
        if (!open) {
          setIsCreatingNote(false);
          setEditingNote(null);
          setNewNote({
            title: "",
            content: "",
            tags: "",
            subject: "",
            category: "general",
            isPublic: false
          });
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              {editingNote ? 'Editar Nota' : 'Nova Nota'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input
              placeholder="Título da nota..."
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              className="text-lg font-semibold"
            />
            
            <Textarea
              placeholder="Escreva o conteúdo da sua nota aqui..."
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              className="min-h-[200px] resize-none"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Disciplina/Matéria"
                value={newNote.subject}
                onChange={(e) => setNewNote(prev => ({ ...prev, subject: e.target.value }))}
              />
              
              <Select value={newNote.category} onValueChange={(value) => setNewNote(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Geral</SelectItem>
                  <SelectItem value="mathematics">Matemática</SelectItem>
                  <SelectItem value="programming">Programação</SelectItem>
                  <SelectItem value="history">História</SelectItem>
                  <SelectItem value="science">Ciências</SelectItem>
                  <SelectItem value="language">Idiomas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Input
              placeholder="Tags (separadas por vírgula)"
              value={newNote.tags}
              onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newNote.isPublic}
                  onChange={(e) => setNewNote(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-600 flex items-center gap-1">
                  {newNote.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  {newNote.isPublic ? 'Pública' : 'Privada'}
                </label>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreatingNote(false);
                    setEditingNote(null);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  onClick={editingNote ? handleUpdateNote : handleCreateNote}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingNote ? 'Actualizar' : 'Criar Nota'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
