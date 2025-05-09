// jest.setup.js
// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock environment variables if needed
// process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
// process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'your-test-anon-key';

// Mock next/navigation for testing components that use useRouter, etc.
// jest.mock('next/navigation', () => ({
//   useRouter: () => ({
//     push: jest.fn(),
//     replace: jest.fn(),
//     prefetch: jest.fn(),
//     back: jest.fn(),
//     // Add other methods/properties if needed
//   }),
//   useParams: () => ({ 
//       // Provide mock params if needed for specific tests
//   }),
//   // Mock other hooks as needed
// }));

// Mock Supabase client (basic example)
// jest.mock('@/lib/supabase/client', () => ({
//   createClient: jest.fn(() => ({
//     auth: {
//       getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
//       // Mock other auth methods
//     },
//     from: jest.fn(() => ({
//       select: jest.fn().mockReturnThis(),
//       insert: jest.fn().mockReturnThis(),
//       update: jest.fn().mockReturnThis(),
//       delete: jest.fn().mockReturnThis(),
//       eq: jest.fn().mockReturnThis(),
//       single: jest.fn().mockResolvedValue({ data: null, error: null }),
//       maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
//       // Add other query builder methods as needed
//     })),
//     // Mock other Supabase client properties/methods
//   })),
// })); 