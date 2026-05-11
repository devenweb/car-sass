const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kudlhuakeegskajyxwxo.supabase.co'
const supabaseAnonKey = 'sb_publishable_f52n5yEm1cTM7d0iHxer3g_56i2Ddzp'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testFetch() {
  const { data, error } = await supabase.from('cars').select('name, category')
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Cars:', JSON.stringify(data, null, 2))
  }
}

testFetch()
