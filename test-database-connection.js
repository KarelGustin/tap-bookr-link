// Test script to verify database connection and policies
// Run this in your browser console on the onboarding page

async function testDatabaseConnection() {
  console.log('🧪 Testing database connection and policies...');
  
  try {
    // Test 1: Check if we can read from profiles table
    console.log('📖 Test 1: Reading from profiles table...');
    const { data: readTest, error: readError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    console.log('✅ Read test result:', { data: readTest, error: readError });
    
    // Test 2: Check if we can insert a test record
    console.log('📝 Test 2: Inserting test record...');
    const testHandle = 'test-handle-' + Date.now();
    const { data: insertTest, error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: 'test-user-id',
        handle: testHandle,
        status: 'draft'
      })
      .select('id');
    
    console.log('✅ Insert test result:', { data: insertTest, error: insertError });
    
    // Test 3: Clean up test record
    if (insertTest?.[0]?.id) {
      console.log('🧹 Test 3: Cleaning up test record...');
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', insertTest[0].id);
      
      console.log('✅ Cleanup result:', { error: deleteError });
    }
    
    // Test 4: Check current user
    console.log('👤 Test 4: Checking current user...');
    const { data: { user } } = await supabase.auth.getUser();
    console.log('✅ Current user:', user);
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDatabaseConnection();
