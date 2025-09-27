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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find profiles where grace period has expired
    const now = new Date().toISOString()
    const { data: expiredProfiles, error } = await supabase
      .from('profiles')
      .select('id, handle, subscription_status')
      .lt('grace_period_ends_at', now)
      .eq('subscription_status', 'past_due')
      .eq('status', 'published')

    if (error) {
      console.error('Error querying expired grace periods:', error)
      throw error
    }

    if (!expiredProfiles || expiredProfiles.length === 0) {
      console.log('No profiles with expired grace periods found')
      return new Response(
        JSON.stringify({ message: 'No expired grace periods found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log(`Found ${expiredProfiles.length} profiles with expired grace periods`)

    // Set expired profiles to draft (offline)
    const profileIds = expiredProfiles.map(p => p.id)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        status: 'draft',
        subscription_status: 'unpaid',
        grace_period_ends_at: null,
        updated_at: now
      })
      .in('id', profileIds)

    if (updateError) {
      console.error('Error updating expired profiles:', updateError)
      throw updateError
    }

    console.log(`Successfully set ${expiredProfiles.length} profiles offline`)

    // Log the affected profiles
    expiredProfiles.forEach(profile => {
      console.log(`Profile ${profile.handle} (${profile.id}) set offline due to expired grace period`)
    })

    return new Response(
      JSON.stringify({ 
        message: `Set ${expiredProfiles.length} profiles offline`,
        affectedProfiles: expiredProfiles.map(p => ({ id: p.id, handle: p.handle }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error checking grace periods:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
