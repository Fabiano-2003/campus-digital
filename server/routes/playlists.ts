
import express from 'express';
import { db } from '../db';
import { playlists, playlistItems } from '../../shared/schema';
import { desc, eq, and } from 'drizzle-orm';

const router = express.Router();

// Get user playlists
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userPlaylists = await db
      .select()
      .from(playlists)
      .where(eq(playlists.userId, userId))
      .orderBy(desc(playlists.createdAt));
    
    res.json(userPlaylists);
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ error: 'Failed to get playlists' });
  }
});

// Get playlist by ID with items
router.get('/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const playlistId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const playlist = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)))
      .limit(1);
    
    if (playlist.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const items = await db
      .select()
      .from(playlistItems)
      .where(eq(playlistItems.playlistId, playlistId))
      .orderBy(playlistItems.position);
    
    res.json({ ...playlist[0], items });
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ error: 'Failed to get playlist' });
  }
});

// Create new playlist
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const newPlaylist = await db.insert(playlists).values({
      ...req.body,
      userId: userId,
    }).returning();
    
    res.json(newPlaylist[0]);
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Add item to playlist
router.post('/:id/items', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const playlistId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify playlist ownership
    const playlist = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)))
      .limit(1);
    
    if (playlist.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const newItem = await db.insert(playlistItems).values({
      playlistId,
      ...req.body,
    }).returning();
    
    res.json(newItem[0]);
  } catch (error) {
    console.error('Add playlist item error:', error);
    res.status(500).json({ error: 'Failed to add item to playlist' });
  }
});

// Delete playlist
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const playlistId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const deleted = await db
      .delete(playlists)
      .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)))
      .returning();
    
    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

export default router;
