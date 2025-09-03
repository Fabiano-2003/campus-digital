import express from 'express';
import { db } from '../db';
import { videos } from '../../shared/schema';
import { desc, eq } from 'drizzle-orm';

const router = express.Router();

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videoList = await db.select().from(videos).orderBy(desc(videos.createdAt));
    res.json(videoList);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Failed to get videos' });
  }
});

// Get video by ID
router.get('/:id', async (req, res) => {
  try {
    const video = await db.select().from(videos).where(eq(videos.id, req.params.id)).limit(1);
    
    if (video.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json(video[0]);
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Failed to get video' });
  }
});

// Create new video
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const newVideo = await db.insert(videos).values({
      ...req.body,
      uploadedBy: userId,
    }).returning();
    
    res.json(newVideo[0]);
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ error: 'Failed to create video' });
  }
});

export default router;