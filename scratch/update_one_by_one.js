import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qannteujbnyjtnfsbqil.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbm50ZXVqYm55anRuZnNicWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjAwNDQsImV4cCI6MjA5MTkzNjA0NH0.4bU8BanXy8hkwiYb_DTxvalAi_tVEKgwrBe-4FCYDyk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const REAL_USER_ID = '758f451e-e867-4003-a96c-80c826ede2b7';
const REAL_USER_EMAIL = 'kaguviautopartszw@gmail.com';

async function updateOneByOne() {
  const { data, error } = await supabase
    .from('properties')
    .select('id, manager_id, manager_name');
    
  if (error) { console.error('Error fetching:', error); return; }
  
  let updatedCount = 0;
  for (const prop of data) {
    if (prop.manager_id === null && (prop.manager_name === 'simba' || prop.manager_name === 'Simba')) {
      const { error: upErr, data: upData } = await supabase
        .from('properties')
        .update({ manager_id: REAL_USER_ID, manager_email: REAL_USER_EMAIL })
        .eq('id', prop.id)
        .select();
        
      if (upErr) {
        console.error('Failed to update', prop.id, upErr);
      } else if (upData && upData.length === 0) {
         console.error('Update returned no rows for', prop.id, 'Maybe RLS blocked it?');
      } else {
        updatedCount++;
        console.log('Successfully updated', prop.id);
      }
    }
  }
  console.log(`Updated ${updatedCount} properties.`);
}

updateOneByOne();
