import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://0.0.0.0:8080', 'http://localhost:8081', 'http://0.0.0.0:8081', 'http://localhost:8082', 'http://0.0.0.0:8082', 'http://localhost:8083', 'http://0.0.0.0:8083'],
  credentials: true
}));
app.use(express.json());

// Serve static files from dist directory (built frontend)
app.use(express.static(path.join(__dirname, '../dist')));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic API routes for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Import and use routes with error handling
try {
  const authRoutes = await import('./routes/auth.js');
  const booksRoutes = await import('./routes/books.js');
  const groupsRoutes = await import('./routes/groups.js');
  const postsRoutes = await import('./routes/posts.js');
  const profilesRoutes = await import('./routes/profiles.js');
  const videosRoutes = await import('./routes/videos.js');
  const institutionsRoutes = await import('./routes/institutions.js');

  app.use('/api/auth', authRoutes.default);
  app.use('/api/books', booksRoutes.default);
  app.use('/api/groups', groupsRoutes.default);
  app.use('/api/posts', postsRoutes.default);
  app.use('/api/profiles', profilesRoutes.default);
  app.use('/api/videos', videosRoutes.default);
  app.use('/api/institutions', institutionsRoutes.default);

  console.log('✅ All API routes loaded successfully');
} catch (error) {
  console.warn('⚠️  Some routes failed to load:', error.message);
  console.warn('Server will start with basic routes only');
}

// Catch-all handler for frontend routes
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  const filePath = path.join(__dirname, '../dist/index.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(404).send('Page not found');
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 API available at http://0.0.0.0:${PORT}/api`);
  console.log(`🏥 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://0.0.0.0:${PORT}/api/test`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;