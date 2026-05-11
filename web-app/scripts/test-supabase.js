const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase.from('cars').select('id, name');
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Successfully fetched cars:', data.length);
    data.forEach(car => console.log(`- ${car.name}`));
  }
}

test();
