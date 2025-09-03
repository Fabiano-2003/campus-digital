# SaberAngola - Academic Platform

## Overview

SaberAngola is a comprehensive academic platform designed to democratize access to knowledge in Angola. The application serves as a centralized hub for students, educators, and researchers to share resources, collaborate in study groups, generate academic documents, and build professional networks within the academic community.

The platform facilitates knowledge sharing through a digital library of books and monographs, enables real-time collaboration through study groups and chat functionality, provides document generation tools for academic purposes, and supports institutional connections across Angolan educational institutions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: React Router for client-side navigation with protected routes for authenticated users
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent design
- **Animation**: Framer Motion for smooth transitions and micro-interactions
- **Build Tool**: Vite for fast development and optimized production builds

### Authentication & Authorization
- **Authentication Provider**: Supabase Auth with email/password authentication
- **Session Management**: Custom AuthProvider using React Context API
- **Protected Routes**: Route-level protection redirecting unauthenticated users
- **User Profiles**: Extended profile system with academic credentials and institutional affiliations

### Data Layer
- **Database**: Supabase PostgreSQL database with real-time capabilities
- **ORM**: Drizzle ORM for type-safe database queries (server-side configuration present)
- **Schema Design**: Comprehensive schema supporting users, institutions, study groups, documents, books, monographs, chat messages, and social features
- **File Storage**: Supabase Storage for document uploads and media files

### Core Features Architecture

#### Academic Library System
- Books and monographs management with metadata (author, institution, subject)
- Category-based organization with search and filtering capabilities
- Download tracking and view analytics
- Public and private content visibility controls

#### Study Groups Platform
- Group creation with subject, level, and institutional tagging
- Membership management with role-based permissions
- Real-time messaging within groups
- Activity tracking and engagement metrics

#### Document Generation System
- Template-based document creation for CVs, letters, and academic papers
- User-specific document history and management
- Export functionality for generated documents
- Integration with user profile data

#### Social Networking Features
- Follow system supporting users, groups, pages, and entities
- Activity feeds with content from followed entities
- Notification system for social interactions
- User statistics and engagement metrics

#### Communication System
- Real-time chat functionality for direct messaging
- Group-based messaging within study groups
- Message history and conversation management
- Online status and presence indicators

### UI/UX Design Patterns
- **Design System**: HSL-based color system with CSS custom properties
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Component Architecture**: Reusable components with variant-based styling
- **Loading States**: Skeleton loaders and loading indicators for better UX
- **Error Handling**: Toast notifications and error boundaries

### Performance Optimizations
- **Code Splitting**: Route-based code splitting for optimal bundle sizes
- **Query Optimization**: React Query for efficient data fetching and caching
- **Image Optimization**: Lazy loading and responsive images
- **Bundle Optimization**: Vite's tree-shaking and module federation

### Development Tooling
- **TypeScript**: Strict type checking with custom configurations
- **ESLint**: Code linting with React and TypeScript rules
- **PostCSS**: CSS processing with Tailwind CSS integration
- **Development Server**: Vite dev server with hot module replacement

## External Dependencies

### Core Services
- **Supabase**: Backend-as-a-Service providing authentication, database, storage, and real-time subscriptions
- **Neon Database**: Serverless PostgreSQL database for production deployment
- **Vercel/Netlify**: Potential hosting platforms for static site deployment

### UI Libraries
- **Radix UI**: Headless component library for accessible UI primitives
- **Lucide React**: Icon library with consistent SVG icons
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **shadcn/ui**: Pre-built component library built on Radix UI and Tailwind

### Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **React Query**: Server state management and data fetching
- **React Router**: Client-side routing
- **Framer Motion**: Animation library
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation (via @hookform/resolvers)

### Utility Libraries
- **date-fns**: Date manipulation and formatting with Portuguese locale support
- **clsx**: Conditional CSS class composition
- **class-variance-authority**: Component variant management

### Third-party Integrations
- **WebSocket Support**: For real-time chat and notifications via Supabase
- **File Upload**: Supabase Storage for document and media uploads
- **Email Services**: Supabase Auth for email confirmation and notifications
- **Analytics**: Potential integration points for user engagement tracking