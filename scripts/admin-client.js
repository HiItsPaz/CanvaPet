const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

// Create admin client that bypasses RLS
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = adminSupabase;
