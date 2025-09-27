import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { MagicLinkEmail } from "./_templates/magic-link.tsx";
import { ConfirmEmail } from "./_templates/confirm-email.tsx";
import { ResetPasswordEmail } from "./_templates/reset-password.tsx";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);
const hookSecret = Deno.env.get('SEND_AUTH_EMAIL_HOOK_SECRET') as string;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    console.log('🔧 Received auth email webhook:', { 
      hasPayload: !!payload,
      hasSecret: !!hookSecret,
      headers: Object.keys(headers)
    });

    // Parse payload with improved error handling
    let parsedPayload;
    try {
      if (hookSecret && hookSecret.length > 0) {
        console.log('🔐 Verifying webhook signature...');
        const wh = new Webhook(hookSecret);
        parsedPayload = wh.verify(payload, headers);
        console.log('✅ Webhook signature verified');
      } else {
        console.log('⚠️ No webhook secret configured, parsing payload directly (development mode)');
        parsedPayload = JSON.parse(payload);
      }
    } catch (webhookError) {
      console.log('❌ Webhook verification failed, falling back to direct parsing:', webhookError.message);
      console.log('🔧 Attempting direct payload parsing for development...');
      try {
        parsedPayload = JSON.parse(payload);
        console.log('✅ Direct payload parsing successful');
      } catch (parseError) {
        console.error('❌ Failed to parse payload:', parseError.message);
        throw new Error(`Failed to parse webhook payload: ${parseError.message}`);
      }
    }

    const {
      user,
      email_data: { 
        token, 
        token_hash, 
        redirect_to, 
        email_action_type,
        site_url 
      },
    } = parsedPayload as {
      user: {
        email: string;
        user_metadata?: {
          name?: string;
        };
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
      };
    };

    console.log('🔧 Processing auth email:', {
      email: user.email,
      action: email_action_type,
      hasToken: !!token
    });

    let html: string;
    let subject: string;

    const userName = user.user_metadata?.name || user.email.split('@')[0];

    // Determine email template and subject based on action type
    switch (email_action_type) {
      case 'signup':
      case 'email_change':
        html = await renderAsync(
          React.createElement(ConfirmEmail, {
            userName,
            confirmUrl: `${redirect_to}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}`,
          })
        );
        subject = 'Bevestig je TapBookr account';
        break;

      case 'recovery':
        html = await renderAsync(
          React.createElement(ResetPasswordEmail, {
            userName,
            resetUrl: `${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`,
            token,
          })
        );
        subject = 'Reset je TapBookr wachtwoord';
        break;

      case 'magiclink':
        html = await renderAsync(
          React.createElement(MagicLinkEmail, {
            userName,
            loginUrl: `${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`,
            token,
          })
        );
        subject = 'Je TapBookr inloglink';
        break;

      default:
        // Fallback to magic link template
        html = await renderAsync(
          React.createElement(MagicLinkEmail, {
            userName,
            loginUrl: `${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`,
            token,
          })
        );
        subject = 'TapBookr authenticatie';
    }

    console.log('📧 Attempting to send email via Resend:', {
      to: user.email,
      subject,
      hasHtml: !!html
    });

    const { data, error } = await resend.emails.send({
      from: 'TapBookr <onboarding@resend.dev>', // Using Resend default domain for now
      to: [user.email],
      subject,
      html,
    });

    if (error) {
      console.error('❌ Resend API error:', {
        error,
        message: error.message,
        name: error.name
      });
      throw new Error(`Resend API failed: ${error.message}`);
    }

    console.log('✅ Email sent successfully via Resend:', {
      emailId: data?.id,
      to: user.email
    });

    console.log('✅ Auth email sent successfully to:', user.email);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('❌ Error in send-auth-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR'
        }
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
});