import express from 'express';
import { db } from '../db';
import { institutions, institutionReviews } from '../../shared/schema';
import { desc, eq } from 'drizzle-orm';

const router = express.Router();

// Get all institutions
router.get('/', async (req, res) => {
  try {
    const institutionList = await db.select().from(institutions)
      .where(eq(institutions.isActive, true))
      .orderBy(desc(institutions.createdAt));
    res.json(institutionList);
  } catch (error) {
    console.error('Get institutions error:', error);
    res.status(500).json({ error: 'Failed to get institutions' });
  }
});

// Get institution by ID
router.get('/:id', async (req, res) => {
  try {
    const institution = await db.select().from(institutions).where(eq(institutions.id, req.params.id)).limit(1);
    
    if (institution.length === 0) {
      return res.status(404).json({ error: 'Institution not found' });
    }
    
    res.json(institution[0]);
  } catch (error) {
    console.error('Get institution error:', error);
    res.status(500).json({ error: 'Failed to get institution' });
  }
});

// Create new institution
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const newInstitution = await db.insert(institutions).values({
      ...req.body,
      createdBy: userId,
    }).returning();
    
    res.json(newInstitution[0]);
  } catch (error) {
    console.error('Create institution error:', error);
    res.status(500).json({ error: 'Failed to create institution' });
  }
});

export default router;
import express from 'express';
import { db } from '../db';
import { institutions } from '../../shared/schema';
import { desc, eq } from 'drizzle-orm';

const router = express.Router();

// Get all institutions
router.get('/', async (req, res) => {
  try {
    const allInstitutions = await db.select().from(institutions).orderBy(desc(institutions.created_at));
    res.json(allInstitutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ error: 'Failed to fetch institutions' });
  }
});

export default router;
