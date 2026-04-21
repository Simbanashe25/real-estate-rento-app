import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qannteujbnyjtnfsbqil.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbm50ZXVqYm55anRuZnNicWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjAwNDQsImV4cCI6MjA5MTkzNjA0NH0.4bU8BanXy8hkwiYb_DTxvalAi_tVEKgwrBe-4FCYDyk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkCount() {
  const { count: total, error: e1 } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true });

  const { count: nullCount, error: e2 } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .is('manager_id', null);

  if (e1 || e2) {
    console.error('Error:', e1 || e2);
    return;
  }

  console.log('Total Properties in DB:', total);
  console.log('Properties with NULL manager_id:', nullCount);
}

checkCount();
