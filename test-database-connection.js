// Test script to diagnose Supabase connection issues
// Run this with: node test-database-connection.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rllgepvklxqyhegrqodw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbGdlcHZrbHhxeWhlZ3Jxb2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTA1NzEsImV4cCI6MjA3MDQ4NjU3MX0.TyuQteVpZZCpcx9XO6qV48r4_bIn6eXWMo4HNKU1En8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', SUPABASE_URL);
  console.log('Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
  
  try {
    // Test 1: Basic connection
    console.log('\n📡 Test 1: Basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Basic connection failed:', testError);
      console.log('Error code:', testError.code);
      console.log('Error message:', testError.message);
      console.log('Error details:', testError.details);
      console.log('Error hint:', testError.hint);
    } else {
      console.log('✅ Basic connection successful');
      console.log('Data returned:', testData);
    }
    
    // Test 2: Check table structure
    console.log('\n📊 Test 2: Table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'profiles' });
    
    if (tableError) {
      console.log('⚠️ Could not get table info (this is normal for anon users)');
    } else {
      console.log('✅ Table info:', tableInfo);
    }
    
    // Test 3: Check RLS status
    console.log('\n🔒 Test 3: RLS status...');
    const { data: rlsInfo, error: rlsError } = await supabase
      .rpc('check_rls_status', { table_name: 'profiles' });
    
    if (rlsError) {
      console.log('⚠️ Could not check RLS status (this is normal for anon users)');
    } else {
      console.log('✅ RLS info:', rlsInfo);
    }
    
    // Test 4: Try to create a test profile (should fail for anon users)
    console.log('\n➕ Test 4: Try to insert (should fail for anon users)...');
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: 'test-user-id',
        handle: 'test-handle-' + Date.now(),
        status: 'draft'
      })
      .select();
    
    if (insertError) {
      console.log('⚠️ Insert failed as expected for anon user:', insertError.message);
    } else {
      console.log('❌ Insert succeeded (this might indicate a security issue)');
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

// Run the test
testConnection();
