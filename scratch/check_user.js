import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qannteujbnyjtnfsbqil.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbm50ZXVqYm55anRuZnNicWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjAwNDQsImV4cCI6MjA5MTkzNjA0NH0.4bU8BanXy8hkwiYb_DTxvalAi_tVEKgwrBe-4FCYDyk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkUserProfile() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'kaguviautopartszw@gmail.com')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('User Profile:', profiles);
}

checkUserProfile();
