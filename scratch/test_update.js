import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qannteujbnyjtnfsbqil.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbm50ZXVqYm55anRuZnNicWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjAwNDQsImV4cCI6MjA5MTkzNjA0NH0.4bU8BanXy8hkwiYb_DTxvalAi_tVEKgwrBe-4FCYDyk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const REAL_USER_ID = '758f451e-e867-4003-a96c-80c826ede2b7';
const REAL_USER_EMAIL = 'kaguviautopartszw@gmail.com';

async function testUpdate() {
  const { data, error, count } = await supabase
    .from('properties')
    .update({ 
      manager_id: REAL_USER_ID, 
      manager_email: REAL_USER_EMAIL 
    })
    .is('manager_id', null)
    .ilike('manager_name', 'simba')
    .select(); // Add select() to return the updated rows and see if any error occurs

  console.log('Update Error:', error);
  console.log('Updated Rows:', data);
}

testUpdate();
