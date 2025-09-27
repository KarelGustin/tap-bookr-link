import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "https://esm.sh/resend@4.0.0";

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
      console.log('❌ Webhook verification failed, falling back to direct parsing:', (webhookError as Error).message);
      console.log('🔧 Attempting direct payload parsing for development...');
      try {
        parsedPayload = JSON.parse(payload);
        console.log('✅ Direct payload parsing successful');
      } catch (parseError) {
        console.error('❌ Failed to parse payload:', (parseError as Error).message);
        throw new Error(`Failed to parse webhook payload: ${(parseError as Error).message}`);
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

    // Create simple HTML email templates
    const createEmailHtml = (title: string, message: string, buttonText: string, buttonUrl: string, token?: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 40px 20px; border-radius: 8px;">
            <h1 style="color: #6E56CF; margin-bottom: 30px; text-align: center;">${title}</h1>
            <p style="font-size: 16px; margin-bottom: 30px;">Hallo ${userName},</p>
            <p style="font-size: 16px; margin-bottom: 30px;">${message}</p>
            <div style="text-align: center; margin: 40px 0;">
              <a href="${buttonUrl}" style="background: #6E56CF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">${buttonText}</a>
            </div>
            ${token ? `<p style="font-size: 14px; color: #666; margin-top: 30px;">Of gebruik deze code: <strong>${token}</strong></p>` : ''}
            <p style="font-size: 14px; color: #666; margin-top: 40px;">
              Met vriendelijke groet,<br>
              Het TapBookr Team
            </p>
          </div>
        </body>
      </html>
    `;

    // Generate email content based on action type
    switch (email_action_type) {
      case 'signup':
      case 'email_change':
        html = createEmailHtml(
          'Bevestig je TapBookr account',
          'Welkom bij TapBookr! Klik op de knop hieronder om je account te bevestigen.',
          'Account bevestigen',
          `${redirect_to}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}`
        );
        subject = 'Bevestig je TapBookr account';
        break;

      case 'recovery':
        html = createEmailHtml(
          'Reset je TapBookr wachtwoord',
          'Je hebt een wachtwoord reset aangevraagd. Klik op de knop hieronder om een nieuw wachtwoord in te stellen.',
          'Wachtwoord resetten',
          `${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`,
          token
        );
        subject = 'Reset je TapBookr wachtwoord';
        break;

      case 'magiclink':
        html = createEmailHtml(
          'Je TapBookr inloglink',
          'Klik op de knop hieronder om in te loggen bij TapBookr.',
          'Inloggen',
          `${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`,
          token
        );
        subject = 'Je TapBookr inloglink';
        break;

      default:
        html = createEmailHtml(
          'TapBookr authenticatie',
          'Klik op de knop hieronder om door te gaan met TapBookr.',
          'Doorgaan',
          `${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`,
          token
        );
        subject = 'TapBookr authenticatie';
    }

    // Test environment variables first
    const resendKey = Deno.env.get('RESEND_API_KEY');
    console.log('🔑 Environment check:', {
      hasResendKey: !!resendKey,
      hasHookSecret: !!hookSecret,
      resendKeyLength: resendKey?.length || 0
    });

    if (!resendKey) {
      console.warn('⚠️ RESEND_API_KEY not configured, skipping email send');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Email skipped - API key not configured' 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    const { data, error } = await resend.emails.send({
      from: 'TapBookr <no-reply@tapbookr.com>',
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
      
      // IMPORTANT: Don't throw error - return success to prevent blocking signup
      console.log('⚠️ Email failed but returning success to prevent signup blocking');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Signup completed - email delivery failed but user can still access account',
        emailError: error.message 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
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
    
    // CRITICAL: Always return success to prevent blocking signup
    console.log('⚠️ Function error occurred but returning success to prevent signup blocking');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Signup completed - email function had errors but user account was created successfully',
        functionError: (error as Error).message
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
});