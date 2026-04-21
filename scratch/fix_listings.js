import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qannteujbnyjtnfsbqil.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbm50ZXVqYm55anRuZnNicWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjAwNDQsImV4cCI6MjA5MTkzNjA0NH0.4bU8BanXy8hkwiYb_DTxvalAi_tVEKgwrBe-4FCYDyk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const REAL_USER_ID = '758f451e-e867-4003-a96c-80c826ede2b7';
const REAL_USER_EMAIL = 'kaguviautopartszw@gmail.com';

async function fixListings() {
  console.log('Starting data repair...');
  
  // Update properties where manager_name is 'simba' and manager_id is null
  const { data, error, count } = await supabase
    .from('properties')
    .update({ 
      manager_id: REAL_USER_ID, 
      manager_email: REAL_USER_EMAIL 
    })
    .is('manager_id', null)
    .ilike('manager_name', 'simba');

  if (error) {
    console.error('Repair Error:', error);
    return;
  }

  console.log(`Successfully repaired listings!`);
  
  // Also check for any with 'your-email@gmail.com'
  const { error: error2 } = await supabase
    .from('properties')
    .update({ 
      manager_id: REAL_USER_ID, 
      manager_email: REAL_USER_EMAIL 
    })
    .eq('manager_email', 'your-email@gmail.com');
    
  if (error2) console.error('Secondary Repair Error:', error2);
  else console.log('Secondary repair (legacy emails) complete.');
}

fixListings();
