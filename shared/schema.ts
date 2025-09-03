import { pgTable, text, timestamp, integer, boolean, jsonb, decimal, uuid, varchar, date, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const followTargetTypeEnum = pgEnum('follow_target_type', ['user', 'group', 'page', 'entity']);
export const followLevelEnum = pgEnum('follow_level', ['public', 'member', 'moderator', 'admin', 'owner']);
export const followStatusEnum = pgEnum('follow_status', ['pending', 'accepted', 'blocked']);

// Profiles table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  province: text('province'),
  institution: text('institution'),
  course: text('course'),
  academicLevel: text('academic_level'),
  studentId: text('student_id'),
  title: text('title'),
  summary: text('summary'),
  skills: text('skills').array(),
  languages: text('languages').array(),
  certifications: jsonb('certifications').default('[]'),
  workExperience: jsonb('work_experience').default('[]'),
  education: jsonb('education').default('[]'),
  projects: jsonb('projects').default('[]'),
  achievements: jsonb('achievements').default('[]'),
  socialLinks: jsonb('social_links').default('{}'),
  cvFileUrl: text('cv_file_url'),
  portfolioUrl: text('portfolio_url'),
  linkedinUrl: text('linkedin_url'),
  githubUrl: text('github_url'),
  birthDate: date('birth_date'),
  gender: text('gender'),
  availability: text('availability').default('available'),
  preferredWorkType: text('preferred_work_type'),
  salaryExpectation: text('salary_expectation'),
  careerInterests: text('career_interests').array(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Users table (simplified - auth will be handled differently)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: text('email').unique().notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Books table
export const books = pgTable('books', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  author: text('author').notNull(),
  description: text('description'),
  fileUrl: text('file_url'),
  coverUrl: text('cover_url'),
  category: text('category').notNull(),
  institution: text('institution'),
  subject: text('subject'),
  fileSize: integer('file_size'),
  downloadCount: integer('download_count').default(0),
  visibility: text('visibility').default('public'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'cascade' }),
});

// Monographs table
export const monographs = pgTable('monographs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  author: text('author').notNull(),
  abstract: text('abstract'),
  fileUrl: text('file_url').notNull(),
  category: text('category').notNull(),
  institution: text('institution').notNull(),
  course: text('course'),
  advisor: text('advisor'),
  publicationYear: integer('publication_year'),
  views: integer('views').default(0),
  likes: integer('likes').default(0),
  visibility: text('visibility').default('public'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'cascade' }),
});

// Study groups table
export const studyGroups = pgTable('study_groups', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  subject: text('subject').notNull(),
  level: text('level').notNull(),
  institution: text('institution'),
  maxMembers: integer('max_members').default(50),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'cascade' }),
});

// Group members table
export const groupMembers = pgTable('group_members', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  groupId: uuid('group_id').references(() => studyGroups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').default('member'),
  joinedAt: timestamp('joined_at').defaultNow(),
});

// Group messages table
export const groupMessages = pgTable('group_messages', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  groupId: uuid('group_id').references(() => studyGroups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  messageType: text('message_type').default('text'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Generated documents table
export const generatedDocuments = pgTable('generated_documents', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  documentType: text('document_type').notNull(),
  content: jsonb('content'),
  fileUrl: text('file_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Feed posts table
export const feedPosts = pgTable('feed_posts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  postType: text('post_type').default('text'),
  metadata: jsonb('metadata'),
  likes: integer('likes').default(0),
  commentsCount: integer('comments_count').default(0),
  visibility: text('visibility').default('public'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Post likes table
export const postLikes = pgTable('post_likes', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  postId: uuid('post_id').references(() => feedPosts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Post comments table
export const postComments = pgTable('post_comments', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  postId: uuid('post_id').references(() => feedPosts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Videos table
export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  description: text('description'),
  videoUrl: text('video_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  duration: integer('duration'),
  category: text('category').default('educational'),
  subject: text('subject'),
  institution: text('institution'),
  level: text('level'),
  instructor: text('instructor'),
  views: integer('views').default(0),
  likes: integer('likes').default(0),
  visibility: text('visibility').default('public'),
  uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Institutions table
export const institutions = pgTable('institutions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  institutionType: text('institution_type').default('university'),
  address: text('address'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').default('Brasil'),
  postalCode: text('postal_code'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  logoUrl: text('logo_url'),
  coverImageUrl: text('cover_image_url'),
  establishedYear: integer('established_year'),
  studentCount: integer('student_count'),
  facultyCount: integer('faculty_count'),
  accreditation: text('accreditation').array(),
  programs: text('programs').array(),
  facilities: text('facilities').array(),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.0'),
  reviewsCount: integer('reviews_count').default(0),
  isVerified: boolean('is_verified').default(false),
  isActive: boolean('is_active').default(true),
  socialMedia: jsonb('social_media'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'cascade' }),
});

// Institution reviews table
export const institutionReviews = pgTable('institution_reviews', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  institutionId: uuid('institution_id').references(() => institutions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  title: text('title'),
  comment: text('comment'),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Conversations table
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  participant1: uuid('participant_1').references(() => users.id, { onDelete: 'cascade' }),
  participant2: uuid('participant_2').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Private messages table
export const privateMessages = pgTable('private_messages', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  messageType: text('message_type').default('text'),
  createdAt: timestamp('created_at').defaultNow(),
  readAt: timestamp('read_at'),
});

// Follows table
export const follows = pgTable('follows', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  followerId: uuid('follower_id').references(() => users.id, { onDelete: 'cascade' }),
  targetType: followTargetTypeEnum('target_type').notNull(),
  targetId: uuid('target_id').notNull(),
  followLevel: followLevelEnum('follow_level').default('public'),
  status: followStatusEnum('status').default('accepted'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
