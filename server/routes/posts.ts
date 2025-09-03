import express from 'express';
import { db } from '../db';
import { feedPosts, postLikes, postComments } from '../../shared/schema';
import { desc, eq, and } from 'drizzle-orm';

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await db.select().from(feedPosts).orderBy(desc(feedPosts.createdAt));
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// Create new post
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const newPost = await db.insert(feedPosts).values({
      ...req.body,
      userId: userId,
    }).returning();
    
    res.json(newPost[0]);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Like/unlike post
router.post('/:id/like', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const postId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Check if already liked
    const existingLike = await db.select().from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
      .limit(1);
    
    if (existingLike.length > 0) {
      // Unlike
      await db.delete(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
      res.json({ liked: false });
    } else {
      // Like
      await db.insert(postLikes).values({
        postId: postId,
        userId: userId,
      });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

export default router;