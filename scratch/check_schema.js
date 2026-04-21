import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qannteujbnyjtnfsbqil.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbm50ZXVqYm55anRuZnNicWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjAwNDQsImV4cCI6MjA5MTkzNjA0NH0.4bU8BanXy8hkwiYb_DTxvalAi_tVEKgwrBe-4FCYDyk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'properties' });
  // If rpc doesn't exist, try a simple select from a non-existent column to see the error message which often contains column names in some DBs, or just select * and check keys.
  
  const { data: sample } = await supabase.from('properties').select('*').limit(1);
  if (sample && sample[0]) {
    console.log('Columns in properties table:', Object.keys(sample[0]));
  }
}

checkSchema();
