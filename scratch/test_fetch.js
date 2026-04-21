import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qannteujbnyjtnfsbqil.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbm50ZXVqYm55anRuZnNicWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjAwNDQsImV4cCI6MjA5MTkzNjA0NH0.4bU8BanXy8hkwiYb_DTxvalAi_tVEKgwrBe-4FCYDyk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const REAL_USER_ID = '758f451e-e867-4003-a96c-80c826ede2b7';
const safeName = 'simba';

async function testFetch() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .or(`manager_id.eq.${REAL_USER_ID},and(manager_id.is.null,manager_name.ilike.%${safeName}%)`)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Fetch error:', error);
  } else {
    console.log(`Fetched ${data.length} listings using the new logic.`);
  }
}

testFetch();
