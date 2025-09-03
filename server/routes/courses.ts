
import express from 'express';
import { db } from '../db';
import { teacherCourses, courseEnrollments, courseContent } from '../../shared/schema';
import { desc, eq, and } from 'drizzle-orm';

const router = express.Router();

// Get all available courses
router.get('/', async (req, res) => {
  try {
    const courses = await db
      .select()
      .from(teacherCourses)
      .where(eq(teacherCourses.isActive, true))
      .orderBy(desc(teacherCourses.createdAt));
    
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await db
      .select()
      .from(teacherCourses)
      .where(eq(teacherCourses.id, req.params.id))
      .limit(1);
    
    if (course.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(course[0]);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to get course' });
  }
});

// Create new course (teacher only)
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const newCourse = await db.insert(teacherCourses).values({
      ...req.body,
      teacherId: userId,
    }).returning();
    
    res.json(newCourse[0]);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Enroll in course
router.post('/:id/enroll', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const courseId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const enrollment = await db.insert(courseEnrollments).values({
      courseId,
      studentId: userId,
      status: 'pending'
    }).returning();
    
    res.json(enrollment[0]);
  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({ error: 'Failed to enroll in course' });
  }
});

// Get course content (enrolled students only)
router.get('/:id/content', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const courseId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if user is enrolled
    const enrollment = await db
      .select()
      .from(courseEnrollments)
      .where(and(
        eq(courseEnrollments.courseId, courseId),
        eq(courseEnrollments.studentId, userId),
        eq(courseEnrollments.status, 'accepted')
      ))
      .limit(1);
    
    if (enrollment.length === 0) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    const content = await db
      .select()
      .from(courseContent)
      .where(eq(courseContent.courseId, courseId))
      .orderBy(courseContent.position);
    
    res.json(content);
  } catch (error) {
    console.error('Get course content error:', error);
    res.status(500).json({ error: 'Failed to get course content' });
  }
});

export default router;
