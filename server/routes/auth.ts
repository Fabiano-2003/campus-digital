import express from 'express';
import { db } from '../db';
import { users, profiles } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Simple auth routes for now - will be enhanced with proper authentication
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find or create user
    let user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user.length === 0) {
      // Create new user
      const newUser = await db.insert(users).values({
        email,
        name: email.split('@')[0],
      }).returning();
      
      // Create profile
      await db.insert(profiles).values({
        id: newUser[0].id,
        fullName: email.split('@')[0],
      });
      
      user = newUser;
    }
    
    res.json({ user: user[0] });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.get('/me', async (req, res) => {
  try {
    // For now, return mock user - will implement proper JWT later
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: user[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const profile = await db.select().from(profiles).where(eq(profiles.id, req.params.id)).limit(1);
    if (profile.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;