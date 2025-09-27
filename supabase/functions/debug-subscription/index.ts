import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

    console.log(`🔧 Debug request for user: ${user.id} (${user.email})`)

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      throw new Error(`Profile error: ${profileError.message}`)
    }

    // Get subscription data if exists
    let subscription = null
    if (profile.stripe_customer_id) {
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_customer_id', profile.stripe_customer_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (subError) {
        console.error('Subscription query error:', subError)
      } else {
        subscription = subData
      }
    }

    // Debug info
    const debugInfo = {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile: {
        id: profile.id,
        handle: profile.handle,
        name: profile.name,
        status: profile.status,
        subscription_status: profile.subscription_status,
        stripe_customer_id: profile.stripe_customer_id,
        subscription_id: profile.subscription_id,
        onboarding_completed: profile.onboarding_completed,
        onboarding_step: profile.onboarding_step,
        grace_period_ends_at: profile.grace_period_ends_at,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      },
      subscription: subscription ? {
        id: subscription.id,
        stripe_subscription_id: subscription.stripe_subscription_id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        created_at: subscription.created_at,
        updated_at: subscription.updated_at
      } : null,
      analysis: {
        has_stripe_customer: !!profile.stripe_customer_id,
        has_subscription_record: !!subscription,
        profile_published: profile.status === 'published',
        subscription_active: profile.subscription_status === 'active',
        onboarding_complete: profile.onboarding_completed,
        issues: [] as string[]
      }
    }

    // Analyze issues
    if (!profile.stripe_customer_id) {
      debugInfo.analysis.issues.push('No Stripe customer ID - user needs to complete checkout')
    }
    
    if (profile.stripe_customer_id && !subscription) {
      debugInfo.analysis.issues.push('Has Stripe customer but no subscription record - webhook may have failed')
    }
    
    if (profile.subscription_status === 'inactive' && subscription?.status === 'active') {
      debugInfo.analysis.issues.push('Profile subscription_status is inactive but subscription record shows active - sync issue')
    }
    
    if (profile.status === 'draft' && profile.subscription_status === 'active') {
      debugInfo.analysis.issues.push('Profile is draft but has active subscription - should be published')
    }

    console.log('🔧 Debug info generated:', debugInfo.analysis)

    return new Response(
      JSON.stringify(debugInfo, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Debug error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})