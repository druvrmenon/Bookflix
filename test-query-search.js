const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const search = "Sardana, Devashish";
  let query = supabase.from('books').select('*')
  query = query.or(`title.ilike."%${search}%",author.ilike."%${search}%"`)
    
  const { data, error } = await query
  console.log('Data count:', data ? data.length : 0)
  console.log('Error:', error)
}
test()
