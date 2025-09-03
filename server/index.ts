import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors({
  origin: true, // Allow all origins for Replit environment
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

// Simplified API routes for now
app.get('/api/auth/me', (req, res) => {
  res.json({ user: null, message: 'Not authenticated' });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  res.json({ user: { id: '1', email, name: email.split('@')[0] }, message: 'Login successful' });
});

app.get('/api/posts', (req, res) => {
  res.json({ posts: [], message: 'No posts available' });
});

app.get('/api/groups', (req, res) => {
  res.json({ groups: [], message: 'No groups available' });
});

app.get('/api/institutions', (req, res) => {
  res.json({ institutions: [], message: 'No institutions available' });
});

console.log('✅ Basic API routes loaded successfully');

// Handle all other routes by serving the React app
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../dist/index.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(404).send('Page not found');
    }
  });
});

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
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