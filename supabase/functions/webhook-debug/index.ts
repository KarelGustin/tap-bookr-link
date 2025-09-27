import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = Math.random().toString(36).substring(7);
  console.log(`🔍 [${requestId}] Debug webhook received at ${new Date().toISOString()}`);
  
  try {
    // Log all headers
    const headers = Object.fromEntries(req.headers.entries());
    console.log(`📋 [${requestId}] Headers:`, headers);
    
    // Log request details
    console.log(`🌐 [${requestId}] Method: ${req.method}`);
    console.log(`🔗 [${requestId}] URL: ${req.url}`);
    
    // Try to read body
    const body = await req.text();
    console.log(`📝 [${requestId}] Body length: ${body.length}`);
    console.log(`📝 [${requestId}] Body preview: ${body.substring(0, 200)}...`);
    
    // Check environment variables
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    console.log(`🔑 [${requestId}] Webhook secret configured: ${!!webhookSecret}`);
    console.log(`🔑 [${requestId}] Stripe key configured: ${!!stripeKey}`);
    
    // Check for Stripe signature
    const signature = req.headers.get('stripe-signature');
    console.log(`✍️ [${requestId}] Stripe signature present: ${!!signature}`);
    
    if (signature) {
      console.log(`✍️ [${requestId}] Signature preview: ${signature.substring(0, 50)}...`);
    }
    
    return new Response(JSON.stringify({
      success: true,
      requestId,
      timestamp: new Date().toISOString(),
      message: 'Webhook debug completed - check logs for details'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
    
  } catch (error) {
    console.error(`❌ [${requestId}] Debug webhook error:`, error);
    
    return new Response(JSON.stringify({
      error: (error as Error).message,
      requestId,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});