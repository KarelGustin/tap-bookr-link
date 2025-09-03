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

    // If no webhook secret is configured, skip verification (for development)
    let parsedPayload;
    if (hookSecret) {
      const wh = new Webhook(hookSecret);
      parsedPayload = wh.verify(payload, headers);
    } else {
      console.log('⚠️ No webhook secret configured, parsing payload directly');
      parsedPayload = JSON.parse(payload);
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
            confirmUrl: `${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`,
            token,
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

    const { error } = await resend.emails.send({
      from: 'TapBookr <noreply@tapbookr.com>',
      to: [user.email],
      subject,
      html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw error;
    }

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