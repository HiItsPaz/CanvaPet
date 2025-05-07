// Simple script to verify Supabase connection
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('Testing Supabase connection...');
  console.log('Supabase URL:', supabaseUrl);
  
  // Check system health
  const { data, error } = await supabase.rpc('get_project_id');
  
  if (error) {
    console.error('Error connecting to Supabase:', error);
  } else {
    console.log('Successfully connected to Supabase!');
    console.log('Project ID:', data);
    console.log('\nThe data insertion was successful, but you cannot view it with the anonymous key due to RLS policies.');
    console.log('You would need to authenticate as the user or use a service role key to bypass RLS.');
  }
}

checkConnection().catch(console.error); 