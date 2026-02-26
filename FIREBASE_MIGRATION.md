# Firebase Migratie Instructies

Dit project is gemigreerd van Supabase naar Firebase. Volg deze stappen om het project op te zetten.

## 1. Firebase Project Setup

1. Ga naar [Firebase Console](https://console.firebase.google.com)
2. Maak een nieuw project aan of selecteer een bestaand project
3. Noteer je project ID

## 2. Firebase Services Inschakelen

### Firestore Database
1. Ga naar Firestore Database in Firebase Console
2. Klik op "Create database"
3. Kies "Start in test mode" (we gebruiken security rules)
4. Selecteer een locatie (bijv. `europe-west1`)

### Firebase Storage
1. Ga naar Storage in Firebase Console
2. Klik op "Get started"
3. Start in test mode
4. Maak de volgende buckets aan:
   - `avatars` (public)
   - `media` (public)

### Firebase Authentication
1. Ga naar Authentication in Firebase Console
2. Klik op "Get started"
3. Enable "Email/Password" provider

## 3. Firebase Configuratie

1. Ga naar Project Settings > General
2. Scroll naar "Your apps" en klik op het web icoon (`</>`)
3. Registreer je app (geef het een naam)
4. Kopieer de Firebase configuratie

## 4. Environment Variabelen

Maak een `.env` bestand in de root van het project met:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe Configuration (behouden)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
STRIPE_PRICE_ID=price_your_monthly_subscription_price_id

# App Configuration
VITE_APP_URL=http://localhost:8080
```

## 5. Security Rules Deployen

### Firestore Rules
1. Ga naar Firestore Database > Rules
2. Kopieer de inhoud van `firestore.rules`
3. Plak in de Firebase Console
4. Klik op "Publish"

### Storage Rules
1. Ga naar Storage > Rules
2. Kopieer de inhoud van `storage.rules`
3. Plak in de Firebase Console
4. Klik op "Publish"

## 6. Dependencies Installeren

```bash
npm install
```

Dit installeert automatisch Firebase (staat al in package.json).

## 7. Cloud Functions (Optioneel - Later)

De Supabase Edge Functions moeten nog worden gemigreerd naar Firebase Cloud Functions. Dit wordt later gedaan.

Voor nu werken de belangrijkste functies (auth, database, storage) al.

## 8. Data Migratie

Als je bestaande data uit Supabase hebt:
1. Exporteer data uit Supabase
2. Converteer naar Firestore format
3. Importeer in Firestore via Firebase Console of script

## Belangrijke Wijzigingen

- **Auth**: Gebruikt nu Firebase Auth in plaats van Supabase Auth
- **Database**: Gebruikt Firestore in plaats van PostgreSQL
- **Storage**: Gebruikt Firebase Storage in plaats van Supabase Storage
- **Real-time**: Gebruikt Firestore listeners in plaats van Supabase Realtime

## Troubleshooting

### Build Errors
Als je build errors krijgt over Firebase imports:
```bash
npm install firebase
```

### Auth Errors
Zorg dat Firebase Authentication is ingeschakeld en Email/Password provider is enabled.

### Storage Errors
Zorg dat Storage buckets zijn aangemaakt en security rules zijn gepubliceerd.

### Database Errors
Zorg dat Firestore Database is aangemaakt en security rules zijn gepubliceerd.
