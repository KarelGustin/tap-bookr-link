# Environment Setup Instructies

## Maak .env bestand aan

Maak een `.env` bestand in de root van het project (naast `package.json`) met de volgende inhoud:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBkcK9g6YR2Q6Gi56sz1PqDN2Cm5EqJ_cg
VITE_FIREBASE_AUTH_DOMAIN=tapbookr.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tapbookr
VITE_FIREBASE_STORAGE_BUCKET=tapbookr.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=404090593403
VITE_FIREBASE_APP_ID=1:404090593403:web:1f7398d7ba33dbfdca02de
VITE_FIREBASE_MEASUREMENT_ID=G-6V5C0YQNQ0

# Stripe Configuration (vul aan met jouw Stripe keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
STRIPE_PRICE_ID=price_your_monthly_subscription_price_id

# App Configuration
VITE_APP_URL=http://localhost:8080
```

## Na het aanmaken van .env:

1. Herstart je dev server: `npm run dev`
2. Check de browser console - je zou moeten zien: `✅ Firebase initialized`
3. Test de app!
