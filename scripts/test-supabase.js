// Simple script to test Supabase connection
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  // Fetch profiles data
  console.log('Fetching profiles data...');
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(5);
  
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
  } else {
    console.log('Profiles data:', JSON.stringify(profilesData, null, 2));
  }
  
  // Fetch pets data
  console.log('\nFetching pets data...');
  const { data: petsData, error: petsError } = await supabase
    .from('pets')
    .select('*')
    .limit(5);
  
  if (petsError) {
    console.error('Error fetching pets:', petsError);
  } else {
    console.log('Pets data:', JSON.stringify(petsData, null, 2));
  }
  
  console.log('\nTest completed!');
}

testConnection().catch(console.error); 