# Technical Context

## Technology Stack

### Frontend
- **Next.js**: Core framework using App Router
- **React**: UI component library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Component library built on Radix UI
- **Zustand**: State management
- **React Query**: Data fetching and caching
- **Framer Motion**: Animation library

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Supabase**: Backend-as-a-Service for database and auth
- **PostgreSQL**: Relational database (via Supabase)
- **Edge Functions**: Serverless functions for specific operations

### Authentication & Authorization
- **Supabase Auth**: User authentication system
- **Next.js Middleware**: Route protection and session validation
- **Row-Level Security (RLS)**: Database access control

### Storage & Media
- **Supabase Storage**: File storage for user uploads
- **Sharp**: Image processing library
- **Canvas API**: Browser-based rendering for pet customization

### AI & Machine Learning
- **OpenAI API**: For generating pet portraits
- **Replicate**: Alternative AI service for specific models
- **TensorFlow.js**: Client-side ML for basic image processing

### E-commerce & Payment
- **Printify API**: Print-on-demand service integration
- **Stripe**: Payment processing
- **Webhooks**: For order status updates and notifications

### DevOps & Infrastructure
- **Vercel**: Hosting and deployment
- **GitHub Actions**: CI/CD pipelines
- **ESLint & Prettier**: Code quality and formatting
- **Jest & Cypress**: Testing frameworks

## Development Environment
- Node.js v18+
- npm or yarn package manager
- TypeScript configuration
- Environment variables for API keys and endpoints
- Supabase CLI for local development

## Architectural Decisions

### Server Components vs. Client Components
- Server Components for data-fetching and static content
- Client Components for interactive elements
- "use client" directive to mark client components

### Database Schema Design
- Normalized schema for core entities
- JSON fields for flexible, schema-less data where appropriate
- Foreign key relationships with proper constraints
- RLS policies for secure access

### API Strategy
- REST-based API for third-party services
- Internal API routes for secure operations
- Server Actions for form submissions

### State Management
- Server state with React Query
- UI state with React hooks and contexts
- Global application state with Zustand

### Deployment Strategy
- Continuous deployment with Vercel
- Environment-based configuration
- Feature-branch previews

## Performance Considerations
- Image optimization and lazy loading
- Code splitting and dynamic imports
- Server-side rendering for initial page load
- Edge caching for static assets
- Optimistic UI updates

## Security Measures
- HTTPS for all communications
- Authentication with secure tokens
- Input validation and sanitization
- CSRF protection
- Rate limiting on sensitive endpoints
- Content Security Policy implementation 