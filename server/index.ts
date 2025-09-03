import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db';
import authRoutes from './routes/auth';
import booksRoutes from './routes/books';
import groupsRoutes from './routes/groups';
import postsRoutes from './routes/posts';
import profilesRoutes from './routes/profiles';
import videosRoutes from './routes/videos';
import institutionsRoutes from './routes/institutions';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist directory (built frontend)
app.use(express.static(path.join(__dirname, '../dist')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/institutions', institutionsRoutes);

// Serve frontend for all other routes (SPA) - commented out due to path-to-regexp issue
// app.get('*', (req, res) => {
//   const filePath = path.join(__dirname, '../dist/index.html');
//   res.sendFile(filePath);
// });

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;