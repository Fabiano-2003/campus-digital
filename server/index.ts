import express from 'express';
import cors from 'cors';
import { db } from './db';
import authRoutes from './routes/auth';
import booksRoutes from './routes/books';
import groupsRoutes from './routes/groups';
import postsRoutes from './routes/posts';
import profilesRoutes from './routes/profiles';
import videosRoutes from './routes/videos';
import institutionsRoutes from './routes/institutions';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;