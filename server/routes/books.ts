import express from 'express';
import { db } from '../db';
import { books } from '../../shared/schema';
import { desc, eq, like, and } from 'drizzle-orm';

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
  try {
    const { category, search, institution } = req.query;
    
    // Build where conditions
    const conditions = [];
    if (category) {
      conditions.push(eq(books.category, category as string));
    }
    if (search) {
      conditions.push(like(books.title, `%${search}%`));
    }
    if (institution) {
      conditions.push(eq(books.institution, institution as string));
    }
    
    // Execute query
    let result;
    if (conditions.length > 0) {
      result = await db.select().from(books).where(and(...conditions)).orderBy(desc(books.createdAt));
    } else {
      result = await db.select().from(books).orderBy(desc(books.createdAt));
    }
    
    res.json(result);
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ error: 'Failed to get books' });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await db.select().from(books).where(eq(books.id, req.params.id)).limit(1);
    
    if (book.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(book[0]);
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ error: 'Failed to get book' });
  }
});

// Create new book
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const newBook = await db.insert(books).values({
      ...req.body,
      uploadedBy: userId,
    }).returning();
    
    res.json(newBook[0]);
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

export default router;