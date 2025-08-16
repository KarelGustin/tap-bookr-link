# 🧪 Test Subscription Flow

## 🎯 **Wat er moet gebeuren na Stripe betaling:**

### **1. Database Updates (Automatisch via Webhook)**
```sql
-- profiles tabel wordt bijgewerkt:
UPDATE profiles SET
  subscription_status = 'active',
  status = 'published',
  subscription_id = 'sub_...',
  updated_at = NOW()
WHERE id = 'profile_id';
```

### **2. Frontend Redirect (Automatisch)**
- User wordt automatisch naar `/dashboard` gestuurd
- Success message toont: "🎉 Betaling Succesvol!"
- Website is live op `tapbookr.com/{handle}`

## 🔍 **Hoe te testen:**

### **Stap 1: Test Stripe Checkout**
1. Ga naar onboarding step 7
2. Klik op "Ga live met jouw eigen website!"
3. Voltooi Stripe betaling met test card: `4242 4242 4242 4242`

### **Stap 2: Check Database**
```sql
-- Check of profile is bijgewerkt
SELECT 
  handle,
  status,
  subscription_status,
  subscription_id,
  updated_at
FROM profiles 
WHERE user_id = 'your_user_id';
```

**Verwacht resultaat:**
- `status = 'published'`
- `subscription_status = 'active'`
- `subscription_id` is niet null

### **Stap 3: Check Webhook Logs**
1. Ga naar Supabase Dashboard → Edge Functions → stripe-webhook
2. Bekijk logs voor: `"✅ Profile {id} is now published with active subscription"`

### **Stap 4: Test Frontend Redirect**
1. Log uit en log opnieuw in
2. User moet automatisch naar dashboard worden gestuurd
3. Success message moet verschijnen

## 🚨 **Troubleshooting:**

### **Webhook wordt niet getriggerd:**
- Check Stripe Dashboard → Webhooks
- Controleer of endpoint URL correct is: `https://your-project.supabase.co/functions/v1/stripe-webhook`

### **Database wordt niet bijgewerkt:**
- Check webhook logs in Supabase
- Controleer of `STRIPE_WEBHOOK_SECRET` correct is ingesteld

### **Frontend redirect werkt niet:**
- Check browser console voor errors
- Controleer of real-time updates werken
- Verifieer dat `useSubscriptionStatus` hook correct werkt

## ✅ **Success Criteria:**
- [ ] Stripe betaling voltooid
- [ ] Webhook ontvangen en verwerkt
- [ ] Database bijgewerkt: `status = 'published'`, `subscription_status = 'active'`
- [ ] User wordt automatisch naar dashboard gestuurd
- [ ] Success message toont
- [ ] Website is live op `tapbookr.com/{handle}`
