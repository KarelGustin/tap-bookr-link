// Simple test for the get-stripe-subscription function
const testRequest = {
  method: 'POST',
  url: 'http://localhost:8000/functions/v1/get-stripe-subscription',
  body: JSON.stringify({ profileId: 'test-profile-id' })
}

console.log('Test request:', testRequest)

// Test the function locally
if (typeof Deno !== 'undefined') {
  console.log('Running in Deno environment')
  
  // Test environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
  
  console.log('Environment variables check:', {
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseServiceKey: !!supabaseServiceKey,
    hasStripeSecretKey: !!stripeSecretKey
  })
} else {
  console.log('Not running in Deno environment')
}
