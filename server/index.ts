import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Security and middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://0.0.0.0:5000',
    'http://localhost:8080',
    'http://0.0.0.0:8080',
    'https://*.replit.dev',
    'https://*.replit.co',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '../dist'), {
  maxAge: '1h',
  etag: false
}));

// Health check with detailed info
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Enhanced API test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'SaberAngola API is working!',
    timestamp: new Date().toISOString(),
    server: 'Express.js',
    status: 'healthy'
  });
});

// Mock authentication routes
app.get('/api/auth/me', (req, res) => {
  // Simulate checking token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    res.json({
      user: {
        id: '1',
        email: 'demo@saberangola.ao',
        name: 'Demo User',
        institution: 'Universidade de Angola'
      },
      message: 'Authenticated'
    });
  } else {
    res.status(401).json({ user: null, message: 'Not authenticated' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password são obrigatórios' });
  }

  // Mock successful login
  res.json({
    user: {
      id: '1',
      email,
      name: email.split('@')[0],
      institution: 'Universidade de Angola'
    },
    token: 'mock_jwt_token_' + Date.now(),
    message: 'Login realizado com sucesso'
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name, institution } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  res.json({
    user: {
      id: Date.now().toString(),
      email,
      name,
      institution: institution || 'Não especificada'
    },
    token: 'mock_jwt_token_' + Date.now(),
    message: 'Registo realizado com sucesso'
  });
});

// Mock data routes
app.get('/api/posts', (req, res) => {
  const mockPosts = [
    {
      id: '1',
      title: 'Introdução à Programação',
      content: 'Explorando os conceitos fundamentais da programação...',
      author: 'Prof. João Silva',
      institution: 'UAN',
      created_at: new Date().toISOString(),
      likes: 15,
      comments_count: 3
    },
    {
      id: '2',
      title: 'Matemática Aplicada',
      content: 'Resolução de problemas matemáticos práticos...',
      author: 'Prof. Maria Santos',
      institution: 'ULAN',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      likes: 8,
      comments_count: 1
    }
  ];

  res.json({ posts: mockPosts, total: mockPosts.length });
});

app.get('/api/groups', (req, res) => {
  const mockGroups = [
    {
      id: '1',
      name: 'Programação Avançada',
      description: 'Grupo para estudos de algoritmos e estruturas de dados',
      subject: 'Informática',
      level: 'Superior',
      member_count: 25,
      max_members: 50,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Física Quântica',
      description: 'Explorando os mistérios da física quântica',
      subject: 'Física',
      level: 'Superior',
      member_count: 12,
      max_members: 30,
      is_active: true,
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  res.json({ groups: mockGroups, total: mockGroups.length });
});

app.get('/api/groups/:id', (req, res) => {
  const { id } = req.params;

  const mockGroup = {
    id,
    name: 'Programação Avançada',
    description: 'Grupo para estudos de algoritmos e estruturas de dados',
    subject: 'Informática',
    level: 'Superior',
    member_count: 25,
    max_members: 50,
    is_active: true,
    created_at: new Date().toISOString(),
    creator: {
      id: '1',
      name: 'Prof. João Silva',
      institution: 'UAN'
    },
    members: [
      { id: '1', name: 'Prof. João Silva', role: 'admin', joined_at: new Date().toISOString() },
      { id: '2', name: 'Ana Costa', role: 'member', joined_at: new Date(Date.now() - 86400000).toISOString() },
      { id: '3', name: 'Carlos Mendes', role: 'moderator', joined_at: new Date(Date.now() - 172800000).toISOString() }
    ],
    books: [
      { id: '1', title: 'Algoritmos e Estruturas de Dados', author: 'Thomas Cormen', added_at: new Date().toISOString() },
      { id: '2', title: 'Clean Code', author: 'Robert Martin', added_at: new Date(Date.now() - 86400000).toISOString() }
    ],
    recent_posts: [
      {
        id: '1',
        content: 'Alguém pode explicar o algoritmo quicksort?',
        author: 'Ana Costa',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        likes: 3
      },
      {
        id: '2',
        content: 'Compartilhando material sobre árvores binárias...',
        author: 'Carlos Mendes',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        likes: 7
      }
    ]
  };

  res.json(mockGroup);
});

app.get('/api/institutions', (req, res) => {
  const mockInstitutions = [
    {
      id: '1',
      name: 'Universidade Agostinho Neto',
      acronym: 'UAN',
      type: 'public',
      city: 'Luanda',
      state: 'Luanda',
      established: 1962,
      students_count: 35000
    },
    {
      id: '2',
      name: 'Universidade Lueji A\'Nkonde',
      acronym: 'ULAN',
      type: 'public',
      city: 'Dundo',
      state: 'Lunda Norte',
      established: 2009,
      students_count: 8000
    },
    {
      id: '3',
      name: 'Universidade Católica de Angola',
      acronym: 'UCAN',
      type: 'private',
      city: 'Luanda',
      state: 'Luanda',
      established: 1997,
      students_count: 12000
    }
  ];

  res.json({ institutions: mockInstitutions, total: mockInstitutions.length });
});

// Books and library routes
app.get('/api/books', (req, res) => {
  const mockBooks = [
    {
      id: '1',
      title: 'História de Angola',
      author: 'José Redinha',
      category: 'História',
      subject: 'História de Angola',
      description: 'Uma análise completa da história angolana',
      visibility: 'public',
      download_count: 150,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Matemática Fundamental',
      author: 'António Silva',
      category: 'Educação',
      subject: 'Matemática',
      description: 'Conceitos básicos de matemática',
      visibility: 'public',
      download_count: 89,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  res.json({ books: mockBooks, total: mockBooks.length });
});

// Videos route
app.get('/api/videos', (req, res) => {
  const mockVideos = [
    {
      id: '1',
      title: 'Aula de Programação - Variáveis',
      description: 'Conceitos básicos sobre variáveis em programação',
      instructor: 'Prof. João Silva',
      subject: 'Informática',
      visibility: 'public',
      views: 245,
      created_at: new Date().toISOString()
    }
  ];

  res.json({ videos: mockVideos, total: mockVideos.length });
});

// Register all API routes
import authRouter from './routes/auth';
import profilesRouter from './routes/profiles';
import postsRouter from './routes/posts';
import groupsRouter from './routes/groups';
import booksRouter from './routes/books';
import videosRouter from './routes/videos';
import institutionsRouter from './routes/institutions';
import conversationsRouter from './routes/conversations';
import friendsRouter from './routes/friends';
import playlistsRouter from './routes/playlists';
import coursesRouter from './routes/courses';
import notesRouter from './routes/notes';

// Use the routes
app.use('/api/auth', authRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/posts', postsRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/books', booksRouter);
app.use('/api/videos', videosRouter);
app.use('/api/institutions', institutionsRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/playlists', playlistsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/notes', notesRouter);

// Catch-all for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Endpoint da API não encontrado',
    path: req.path,
    method: req.method
  });
});

// Handle React app routes (SPA) - must be last
app.use((req, res) => {
  const filePath = path.join(__dirname, '../dist/index.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Erro ao servir index.html:', err);
      res.status(404).send('Página não encontrada');
    }
  });
});

// Global error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erro do servidor:', err);

  res.status(err.status || 500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado',
    timestamp: new Date().toISOString()
  });
});

// Graceful startup
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🎯 =================================');
  console.log('🚀 SaberAngola Server Iniciado!');
  console.log('🎯 =================================');
  console.log(`📍 Servidor: http://0.0.0.0:${PORT}`);
  console.log(`📡 API: http://0.0.0.0:${PORT}/api`);
  console.log(`🏥 Health: http://0.0.0.0:${PORT}/health`);
  console.log(`🧪 Test: http://0.0.0.0:${PORT}/api/test`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Iniciado em: ${new Date().toLocaleString('pt-BR')}`);
  console.log('🎯 =================================');
});

// Enhanced error handling
server.on('error', (error: any) => {
  console.error('❌ Falha ao iniciar servidor:', error);

  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${PORT} já está em uso!`);
    console.log('💡 Tentando usar porta alternativa...');

    const alternativePort = PORT + 1;
    const altServer = app.listen(alternativePort, '0.0.0.0', () => {
      console.log(`🚀 Servidor iniciado na porta alternativa: ${alternativePort}`);
    });

    altServer.on('error', (altError) => {
      console.error('❌ Falha na porta alternativa também:', altError);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 ${signal} recebido, encerrando graciosamente...`);

  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Forçando encerramento...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason, 'em', promise);
  gracefulShutdown('UNHANDLED_REJECTION');
});

export default app;