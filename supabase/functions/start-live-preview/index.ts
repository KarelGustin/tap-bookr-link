import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    // Get the request body
    const { profileId } = await req.json()

    console.log('🔧 Start live preview request for profile:', profileId)

    if (!profileId) {
      throw new Error('Profile ID is required')
    }

    // Initialize Supabase client with service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Set the profile status to 'published' and set preview expiration to 15 minutes
    const previewExpiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        status: 'published',
        preview_expires_at: previewExpiresAt.toISOString(),
        preview_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)
      .select('id, handle, status, preview_expires_at')
      .single();

    if (error) {
      console.error('🔧 Error starting live preview:', error)
      throw new Error(`Failed to start live preview: ${error.message}`)
    }

    console.log('✅ Live preview started successfully for profile:', data)

    return new Response(
      JSON.stringify({ 
        success: true,
        profileId: profileId,
        status: 'published',
        previewExpiresAt: previewExpiresAt.toISOString(),
        message: 'Live preview started successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('🔧 Error in start-live-preview:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})