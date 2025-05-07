const adminSupabase = require('./admin-client');

async function testAdminAccess() {
  // This will bypass RLS and get all records
  const { data: profiles, error: profilesError } = await adminSupabase
    .from('profiles')
    .select('*')
    .limit(5);
  
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
  } else {
    console.log('Profiles (bypassing RLS):', JSON.stringify(profiles, null, 2));
  }
  
  const { data: pets, error: petsError } = await adminSupabase
    .from('pets')
    .select('*')
    .limit(5);
  
  if (petsError) {
    console.error('Error fetching pets:', petsError);
  } else {
    console.log('Pets (bypassing RLS):', JSON.stringify(pets, null, 2));
  }
}

testAdminAccess().catch(console.error);
