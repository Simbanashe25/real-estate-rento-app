import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qannteujbnyjtnfsbqil.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbm50ZXVqYm55anRuZnNicWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjAwNDQsImV4cCI6MjA5MTkzNjA0NH0.4bU8BanXy8hkwiYb_DTxvalAi_tVEKgwrBe-4FCYDyk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase
    .from('properties')
    .select('id, title, verified, status')
    .limit(10);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Sample Data:', JSON.stringify(data, null, 2));
  }
}

test();
