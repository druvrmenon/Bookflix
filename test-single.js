const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(url, key);

async function test() {
  try {
    const { data, error } = await supabase.from('non_existent_table_xyz').select('*').single();
    console.log('Result:', { data, error });
  } catch (e) {
    console.error('Thrown error:', e);
  }
}

test();
