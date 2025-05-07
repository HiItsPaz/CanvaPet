# CanvaPet Project Manual Setup Guide

This document outlines the manual setup steps required to complete your CanvaPet project configuration.

## Verification Steps

### Test Supabase Connection
1. Ensure your `.env.local` file is properly configured with your Supabase credentials
2. Run the Next.js development server:
   ```bash
   npm run dev
   ```
3. Open your browser to `http://localhost:3000`
4. Check the browser console for any Supabase connection errors
5. If no errors appear, your connection is successful

### Verify Database Tables
1. Insert test data through the Supabase Table Editor
2. Verify that your application can retrieve the data

### Testing with RLS Policies
Row Level Security (RLS) policies restrict data access based on the authenticated user. For development/testing, use one of these approaches:

1. **Using the Service Role (Recommended for Development)**
   - Store your service role key in `.env.local` as `SUPABASE_SERVICE_KEY`
   - Create an admin client that bypasses RLS:
     ```javascript
     // Create admin client that bypasses RLS
     const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
     ```
   - Run the verification script:
     ```bash
     node scripts/admin-test.js
     ```

2. **Testing as an Authenticated User**
   - Sign up/in with a test user account
   - Use this authenticated session for data operations
   - Ensure test data is owned by this user

3. **Temporarily Modifying RLS Policies (Use with Caution)**
   - In Supabase dashboard, navigate to Database → Tables → [table] → Policies
   - Create temporary permissive policies for development
   - **IMPORTANT:** Remember to remove or restrict these policies before production

## Security Considerations

1. Add `.env.local` to your `.gitignore` file if not already included
2. Never commit service role keys to version control
3. Consider setting up separate Supabase projects for development and production
4. For production deployment:
   - Add environment variables to your hosting platform (Vercel, Netlify, etc.)
   - Enable additional security features in Supabase Auth settings
   - Review and tighten RLS policies as needed

---

Once you've completed these setup steps, you'll be ready to proceed with implementing the authentication flow and other features of the CanvaPet application. 