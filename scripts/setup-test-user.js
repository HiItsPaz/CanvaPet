const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTestUser() {
  // Create test user
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'testpassword123'
  });
  
  if (error) {
    console.error('Error creating test user:', error);
    return;
  }
  
  console.log('Created test user with ID:', data.user.id);
  console.log('IMPORTANT: Save this ID to use in your test data');
  
  // Note: The user will need to confirm email before the account is active
  console.log('Check your email for confirmation link or configure auto-confirm in Supabase dashboard');
}

setupTestUser().catch(console.error);
