import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('Testing connection to:', supabaseUrl)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  const { data, error } = await supabase.from('properties').select('count', { count: 'exact', head: true })
  if (error) {
    console.error('Connection failed:', error.message)
    process.exit(1)
  }
  console.log('Connection successful! Table exists and is accessible.')
}

test()
