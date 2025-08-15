# 🚀 Stripe Betalingsintegratie Setup

Deze gids helpt je bij het opzetten van de Stripe betalingsintegratie voor je Bookr applicatie.

## 📋 Vereisten

- Stripe account (gratis aan te maken op [stripe.com](https://stripe.com))
- Supabase project met Edge Functions ingeschakeld
- De database migraties zijn al uitgevoerd

## 🔑 Stripe Configuratie

### 1. Maak een Stripe Product aan

1. Ga naar je [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigeer naar **Products** → **Add Product**
3. Vul in:
   - **Name**: `Bookr Premium Subscription`
   - **Description**: `Monthly subscription for keeping your Bookr page online`
   - **Pricing**: `€9.00` per month
   - **Billing**: `Recurring`
   - **Billing cycle**: `Monthly`

### 2. Noteer je Price ID

Na het aanmaken van het product, kopieer de **Price ID** (begint met `price_`). Je hebt deze nodig voor de environment variables.

### 3. Configureer Webhooks

1. Ga naar **Developers** → **Webhooks**
2. Klik op **Add endpoint**
3. Vul in:
   - **Endpoint URL**: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - **Events to send**: Selecteer deze events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

4. Kopieer de **Webhook Secret** (begint met `whsec_`)

## 🌍 Environment Variables

Voeg deze variabelen toe aan je Supabase project:

### Supabase Dashboard → Settings → Edge Functions

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID=price_your_monthly_price_id
```

### Frontend (.env.local)

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## 🚀 Edge Functions Deployen

### 1. Deploy de Edge Functions

```bash
# Ga naar je project directory
cd supabase/functions

# Deploy alle functions
supabase functions deploy stripe-create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy stripe-customer-portal
```

### 2. Controleer de deployment

Ga naar je Supabase Dashboard → Edge Functions om te zien of alle functions succesvol zijn gedeployed.

## 🧪 Testen

### 1. Test de Checkout Flow

1. Start je applicatie
2. Ga door de onboarding
3. Klik op "Start Abonnement" in Step 7
4. Je wordt doorgestuurd naar Stripe Checkout
5. Gebruik test creditcard: `4242 4242 4242 4242`

### 2. Test de Webhooks

1. Maak een test abonnement aan
2. Controleer in je Supabase logs of de webhook events worden ontvangen
3. Controleer of de database wordt bijgewerkt

## 🔍 Troubleshooting

### Webhook Events niet ontvangen

- Controleer of de webhook URL correct is
- Controleer of de webhook secret overeenkomt
- Controleer de Supabase Edge Function logs

### Database Updates falen

- Controleer of de RLS policies correct zijn ingesteld
- Controleer of alle benodigde kolommen bestaan
- Controleer de database logs

### Frontend Errors

- Controleer of alle environment variables zijn ingesteld
- Controleer de browser console voor errors
- Controleer of de Edge Functions correct zijn gedeployed

## 📚 Belangrijke Bestanden

- `supabase/functions/stripe-create-checkout/` - Maakt checkout sessions aan
- `supabase/functions/stripe-webhook/` - Verwerkt webhook events
- `supabase/functions/stripe-customer-portal/` - Beheert customer portal
- `src/services/stripeService.ts` - Frontend service voor Stripe integratie
- `src/pages/Dashboard.tsx` - Toont subscription status en beheer

## 🔒 Beveiliging

- **Nooit** deel je `STRIPE_SECRET_KEY` in de frontend code
- Gebruik altijd HTTPS voor webhook endpoints
- Valideer webhook signatures in productie
- Implementeer rate limiting voor de Edge Functions

## 📱 Ondersteunde Betaalmethoden

- **Credit Cards**: Visa, Mastercard, American Express
- **iDEAL**: Nederlandse banken
- **Automatische verlenging**: Maandelijkse betalingen
- **Grace period**: 3 dagen offline bij gefaalde betalingen

## 🎯 Volgende Stappen

1. **Productie Setup**: Wissel naar live Stripe keys
2. **Analytics**: Voeg betalingsanalytics toe
3. **Email Notifications**: Stuur bevestigingsemails
4. **Dunning Management**: Automatische herinneringen bij gefaalde betalingen

---

**💡 Tip**: Test altijd eerst met Stripe test keys voordat je naar productie gaat!
