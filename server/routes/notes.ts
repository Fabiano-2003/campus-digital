
import express from 'express';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const createNoteSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  tags: z.array(z.string()).optional().default([]),
  subject: z.string().optional(),
  category: z.string().default('general'),
  isPublic: z.boolean().default(false),
  folderId: z.string().uuid().optional(),
});

const updateNoteSchema = createNoteSchema.partial();

// Mock data for development
const mockNotes = [
  {
    id: '1',
    userId: 'user1',
    title: 'Algoritmos de Ordenação',
    content: 'Bubble Sort: O algoritmo mais simples, compara elementos adjacentes e os troca se estiverem na ordem errada.\n\nMerge Sort: Usa estratégia divide e conquista, tem complexidade O(n log n)...',
    tags: ['algoritmos', 'ordenação', 'complexidade'],
    subject: 'Ciência da Computação',
    category: 'programming',
    isPublic: true,
    isFavorite: true,
    views: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Derivadas e Integrais',
    content: 'Regras básicas de derivação:\n1. Regra da potência: d/dx[x^n] = nx^(n-1)\n2. Regra do produto: d/dx[fg] = f\'g + fg\'...',
    tags: ['cálculo', 'derivadas', 'integrais'],
    subject: 'Matemática',
    category: 'mathematics',
    isPublic: false,
    isFavorite: false,
    views: 23,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  }
];

const mockFolders = [
  { id: '1', userId: 'user1', name: 'Matemática', color: '#ef4444', createdAt: new Date().toISOString() },
  { id: '2', userId: 'user1', name: 'Programação', color: '#10b981', createdAt: new Date().toISOString() },
  { id: '3', userId: 'user1', name: 'História', color: '#f59e0b', createdAt: new Date().toISOString() }
];

// Get user notes
router.get('/', async (req, res) => {
  try {
    const { category, search, folderId } = req.query;
    
    let filteredNotes = [...mockNotes];
    
    if (category && category !== 'all') {
      filteredNotes = filteredNotes.filter(note => note.category === category);
    }
    
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredNotes = filteredNotes.filter(note => 
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    if (folderId && folderId !== 'all') {
      filteredNotes = filteredNotes.filter(note => note.folderId === folderId);
    }

    res.json({
      notes: filteredNotes,
      total: filteredNotes.length
    });
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get user folders
router.get('/folders', async (req, res) => {
  try {
    const foldersWithCount = mockFolders.map(folder => ({
      ...folder,
      noteCount: mockNotes.filter(note => note.folderId === folder.id).length
    }));

    res.json({
      folders: foldersWithCount,
      total: foldersWithCount.length
    });
  } catch (error) {
    console.error('Erro ao buscar pastas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create note
router.post('/', async (req, res) => {
  try {
    const validatedData = createNoteSchema.parse(req.body);
    
    const newNote = {
      id: Date.now().toString(),
      userId: 'user1', // In real app, get from auth token
      ...validatedData,
      views: 0,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockNotes.unshift(newNote);

    res.status(201).json({
      note: newNote,
      message: 'Nota criada com sucesso'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors
      });
    }
    console.error('Erro ao criar nota:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateNoteSchema.parse(req.body);
    
    const noteIndex = mockNotes.findIndex(note => note.id === id);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }

    mockNotes[noteIndex] = {
      ...mockNotes[noteIndex],
      ...validatedData,
      updatedAt: new Date().toISOString()
    };

    res.json({
      note: mockNotes[noteIndex],
      message: 'Nota actualizada com sucesso'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors
      });
    }
    console.error('Erro ao actualizar nota:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const noteIndex = mockNotes.findIndex(note => note.id === id);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }

    mockNotes.splice(noteIndex, 1);

    res.json({ message: 'Nota eliminada com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar nota:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Toggle favorite
router.patch('/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;
    
    const note = mockNotes.find(note => note.id === id);
    if (!note) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }

    note.isFavorite = !note.isFavorite;
    note.updatedAt = new Date().toISOString();

    res.json({
      note,
      message: `Nota ${note.isFavorite ? 'adicionada aos' : 'removida dos'} favoritos`
    });
  } catch (error) {
    console.error('Erro ao alterar favorito:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create folder
router.post('/folders', async (req, res) => {
  try {
    const { name, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nome da pasta é obrigatório' });
    }

    const newFolder = {
      id: Date.now().toString(),
      userId: 'user1',
      name,
      color: color || '#6366f1',
      createdAt: new Date().toISOString()
    };

    mockFolders.push(newFolder);

    res.status(201).json({
      folder: newFolder,
      message: 'Pasta criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar pasta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
