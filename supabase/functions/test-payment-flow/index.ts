import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestId = Math.random().toString(36).substring(7)
  console.log(`🧪 [${requestId}] Payment flow test started at ${new Date().toISOString()}`)

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header provided')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    if (userError) throw new Error(`Authentication error: ${userError.message}`)
    
    const user = userData.user
    if (!user?.id) throw new Error('User not authenticated')

    console.log(`🧪 [${requestId}] Testing payment flow for user: ${user.id} (${user.email})`)

    const testResults = {
      user_authenticated: true,
      profile_exists: false,
      stripe_customer_exists: false,
      webhook_endpoint_configured: false,
      environment_variables: {
        stripe_secret_key: false,
        stripe_webhook_secret: false,
        stripe_price_id: false
      },
      issues: [] as string[],
      recommendations: [] as string[]
    }

    // Test 1: Check if profile exists
    console.log(`🧪 [${requestId}] Test 1: Checking profile existence`)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      testResults.issues.push('User profile not found in database')
      testResults.recommendations.push('Complete the onboarding process first')
    } else {
      testResults.profile_exists = true
      console.log(`🧪 [${requestId}] ✅ Profile found: ${profile.id}`)
    }

    // Test 2: Check environment variables
    console.log(`🧪 [${requestId}] Test 2: Checking environment variables`)
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const stripePriceId = Deno.env.get('STRIPE_PRICE_ID')

    testResults.environment_variables.stripe_secret_key = !!stripeSecretKey
    testResults.environment_variables.stripe_webhook_secret = !!stripeWebhookSecret
    testResults.environment_variables.stripe_price_id = !!stripePriceId

    if (!stripeSecretKey) {
      testResults.issues.push('STRIPE_SECRET_KEY environment variable not set')
      testResults.recommendations.push('Configure Stripe secret key in Supabase secrets')
    }

    if (!stripeWebhookSecret) {
      testResults.issues.push('STRIPE_WEBHOOK_SECRET environment variable not set')
      testResults.recommendations.push('Configure Stripe webhook secret in Supabase secrets')
    }

    if (!stripePriceId) {
      testResults.issues.push('STRIPE_PRICE_ID environment variable not set')
      testResults.recommendations.push('Configure Stripe price ID in Supabase secrets')
    }

    // Test 3: Check Stripe customer if profile exists
    if (profile && stripeSecretKey) {
      console.log(`🧪 [${requestId}] Test 3: Checking Stripe customer`)
      
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
      })

      if (profile.stripe_customer_id) {
        try {
          const customer = await stripe.customers.retrieve(profile.stripe_customer_id)
          testResults.stripe_customer_exists = true
          console.log(`🧪 [${requestId}] ✅ Stripe customer found: ${customer.id}`)

          // Check for active subscriptions
          const subscriptions = await stripe.subscriptions.list({
            customer: profile.stripe_customer_id,
            status: 'active',
            limit: 1,
          })

          if (subscriptions.data.length > 0) {
            console.log(`🧪 [${requestId}] ✅ Active subscription found: ${subscriptions.data[0].id}`)
          } else {
            testResults.issues.push('No active subscription found for customer')
            testResults.recommendations.push('Complete payment process or check webhook processing')
          }

        } catch (error) {
          testResults.issues.push(`Stripe customer not found: ${(error as Error).message}`)
          testResults.recommendations.push('Customer may have been deleted from Stripe dashboard')
        }
      } else {
        testResults.issues.push('No Stripe customer ID in profile')
        testResults.recommendations.push('Complete the checkout process to create Stripe customer')
      }
    }

    // Test 4: Test webhook endpoint accessibility
    console.log(`🧪 [${requestId}] Test 4: Testing webhook endpoint`)
    try {
      const webhookUrl = `${supabaseUrl}/functions/v1/stripe-webhook`
      const testResponse = await fetch(webhookUrl, {
        method: 'OPTIONS',
        headers: corsHeaders
      })
      
      if (testResponse.ok) {
        testResults.webhook_endpoint_configured = true
        console.log(`🧪 [${requestId}] ✅ Webhook endpoint accessible`)
      } else {
        testResults.issues.push('Webhook endpoint not accessible')
        testResults.recommendations.push('Check Supabase function deployment')
      }
    } catch (error) {
      testResults.issues.push(`Webhook endpoint test failed: ${(error as Error).message}`)
      testResults.recommendations.push('Verify Supabase function deployment and CORS configuration')
    }

    // Test 5: Database permissions
    console.log(`🧪 [${requestId}] Test 5: Testing database permissions`)
    try {
      const { error: permissionError } = await supabase
        .from('subscriptions')
        .select('count')
        .limit(1)

      if (permissionError) {
        testResults.issues.push(`Database permission error: ${permissionError.message}`)
        testResults.recommendations.push('Check RLS policies and service role permissions')
      } else {
        console.log(`🧪 [${requestId}] ✅ Database permissions OK`)
      }
    } catch (error) {
      testResults.issues.push(`Database permission test failed: ${(error as Error).message}`)
    }

    // Generate summary
    const summary = {
      total_tests: 5,
      passed_tests: [
        testResults.user_authenticated,
        testResults.profile_exists,
        testResults.stripe_customer_exists,
        testResults.webhook_endpoint_configured,
        testResults.environment_variables.stripe_secret_key && 
        testResults.environment_variables.stripe_webhook_secret && 
        testResults.environment_variables.stripe_price_id
      ].filter(Boolean).length,
      health_score: 0,
      status: 'unknown'
    }

    summary.health_score = Math.round((summary.passed_tests / summary.total_tests) * 100)
    
    if (summary.health_score >= 80) {
      summary.status = 'healthy'
    } else if (summary.health_score >= 60) {
      summary.status = 'warning'
    } else {
      summary.status = 'critical'
    }

    const result = {
      success: true,
      test_id: requestId,
      timestamp: new Date().toISOString(),
      summary,
      details: testResults,
      next_steps: testResults.issues.length === 0 
        ? ['Payment flow is configured correctly', 'Ready for production use'] 
        : testResults.recommendations
    }

    console.log(`🧪 [${requestId}] Test completed. Health score: ${summary.health_score}% (${summary.status})`)

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Test error:`, error)
    
    return new Response(JSON.stringify({ 
      success: false,
      test_id: requestId,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})