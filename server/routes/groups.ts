import express from 'express';
import { db } from '../db';
import { studyGroups, groupMembers, groupMessages } from '../../shared/schema';
import { desc, eq } from 'drizzle-orm';

const router = express.Router();

// Get all study groups
router.get('/', async (req, res) => {
  try {
    const groups = await db.select().from(studyGroups).orderBy(desc(studyGroups.createdAt));
    res.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to get groups' });
  }
});

// Get group by ID
router.get('/:id', async (req, res) => {
  try {
    const group = await db.select().from(studyGroups).where(eq(studyGroups.id, req.params.id)).limit(1);
    
    if (group.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(group[0]);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to get group' });
  }
});

// Create new group
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const newGroup = await db.insert(studyGroups).values({
      ...req.body,
      createdBy: userId,
    }).returning();
    
    // Add creator as first member
    await db.insert(groupMembers).values({
      groupId: newGroup[0].id,
      userId: userId,
      role: 'admin',
    });
    
    res.json(newGroup[0]);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Get group messages
router.get('/:id/messages', async (req, res) => {
  try {
    const messages = await db.select().from(groupMessages)
      .where(eq(groupMessages.groupId, req.params.id))
      .orderBy(desc(groupMessages.createdAt));
    
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

export default router;