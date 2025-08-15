# Onboarding Persistence Setup

Deze implementatie zorgt ervoor dat gebruikers de onboarding moeten afmaken voordat ze toegang krijgen tot het dashboard.

## Database Setup

Voer de volgende SQL uit in je Supabase SQL Editor:

```sql
-- Add onboarding tracking columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1;

-- Update existing profiles to mark them as completed if they have a handle and status is published
UPDATE profiles 
SET onboarding_completed = TRUE, onboarding_step = 8 
WHERE handle IS NOT NULL AND handle != '' AND status = 'published';

-- Update existing profiles to mark them as not completed if they don't have a handle
UPDATE profiles 
SET onboarding_completed = FALSE, onboarding_step = 1 
WHERE handle IS NULL OR handle = '';
```

## Hoe het werkt

### 1. Route Protection
- **Dashboard**: Vereist dat onboarding is voltooid (`requireOnboarding={true}`)
- **Edit**: Vereist dat onboarding is voltooid (`requireOnboarding={true}`)
- **Profile**: Vereist dat onboarding is voltooid (`requireOnboarding={true}`)
- **Onboarding**: Vereist dat onboarding NIET is voltooid (`requireOnboarding={false}`)

### 2. Automatische Redirects
- Gebruikers worden automatisch naar de onboarding gestuurd als ze proberen toegang te krijgen tot beschermde routes
- Gebruikers worden automatisch naar het dashboard gestuurd als ze proberen toegang te krijgen tot de onboarding terwijl deze al is voltooid

### 3. Progress Tracking
- Elke stap wordt opgeslagen in de database (`onboarding_step`)
- De onboarding wordt gemarkeerd als voltooid wanneer de gebruiker publiceert (`onboarding_completed = true`)

### 4. Login Flow
- Na login wordt gecontroleerd of de onboarding is voltooid
- Gebruikers worden naar de juiste plek gestuurd op basis van hun status

## Bestanden

### Nieuwe bestanden:
- `src/hooks/use-onboarding-status.ts` - Hook voor onboarding status controle
- `src/components/ProtectedRoute.tsx` - Route guard component
- `supabase/migrations/20250101000003_add_onboarding_tracking.sql` - Database migratie

### Aangepaste bestanden:
- `src/App.tsx` - Router configuratie met route guards
- `src/pages/Onboarding.tsx` - Onboarding status updates
- `src/pages/Dashboard.tsx` - Onboarding status check
- `src/pages/Login.tsx` - Onboarding status check na login
- `src/pages/Edit.tsx` - Onboarding status check
- `src/pages/Profile.tsx` - Onboarding status check

## Testen

1. Voer de SQL migratie uit in Supabase
2. Log in met een bestaande gebruiker
3. Controleer of je naar de onboarding wordt gestuurd als deze niet is voltooid
4. Voltooi de onboarding
5. Controleer of je toegang krijgt tot het dashboard
6. Probeer terug te gaan naar de onboarding - je zou naar het dashboard moeten worden gestuurd

## Troubleshooting

### Linter Errors
Als je linter errors ziet over `onboarding_completed` kolom niet bestaand, voer dan eerst de SQL migratie uit.

### Redirect Loops
Als je redirect loops ervaart, controleer dan:
1. Of de database kolommen correct zijn aangemaakt
2. Of de `onboarding_completed` waarde correct wordt ingesteld
3. Of er geen conflicten zijn tussen verschillende route guards
