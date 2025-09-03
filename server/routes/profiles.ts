import express from 'express';
import { db } from '../db';
import { profiles } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get profile by ID
router.get('/:id', async (req, res) => {
  try {
    const profile = await db.select().from(profiles).where(eq(profiles.id, req.params.id)).limit(1);
    
    if (profile.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(profile[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update profile
router.put('/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const profileId = req.params.id;
    
    if (!userId || userId !== profileId) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    const updatedProfile = await db.update(profiles)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profileId))
      .returning();
    
    res.json(updatedProfile[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
import express from 'express';
import { db } from '../db';
import { profiles } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get profile by ID
router.get('/:id', async (req, res) => {
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
