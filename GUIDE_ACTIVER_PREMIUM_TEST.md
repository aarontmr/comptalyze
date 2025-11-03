# 🎯 Guide : Activer Premium pour les tests

## 📋 Méthode recommandée : Via l'interface Supabase

⚠️ **Le script SQL ne peut pas modifier directement `user_metadata`**. Utilisez plutôt l'interface Supabase (voir `ACTIVER_PREMIUM_INTERFACE.md` pour les détails).

### Méthode rapide (via l'interface)

1. Dans Supabase, allez dans **Authentication** > **Users**
2. Trouvez votre utilisateur (par email)
3. Cliquez sur les **3 points** (⋮) > **"Edit user"**
4. Dans **"Raw user meta data"**, ajoutez/modifiez :
   ```json
   {
     "subscription_plan": "premium",
     "is_pro": true,
     "is_premium": true,
     "subscription_status": "active"
   }
   ```
5. Cliquez sur **"Save"**

### Étape 2 : Créer l'enregistrement dans subscriptions (optionnel)

1. Dans Supabase SQL Editor, exécutez (remplacez l'email) :
   ```sql
   INSERT INTO public.subscriptions (user_id, status, price_id, stripe_subscription_id, stripe_customer_id)
   SELECT id, 'active', 'premium_test', 'sub_test_premium', 'cus_test_premium'
   FROM auth.users WHERE email = 'VOTRE_EMAIL_ICI'
   ON CONFLICT (user_id) DO UPDATE SET status = 'active', price_id = 'premium_test';
   ```

### Étape 3 : Vérifier que ça fonctionne

1. **Déconnectez-vous** de votre application
2. **Reconnectez-vous** (pour que les nouvelles métadonnées soient chargées)
3. Vous devriez maintenant voir :
   - Le toggle "Recevoir un rappel par e-mail tous les 2 du mois"
   - La carte "Conseil IA (Premium)"
   - Le bouton "Exporter en PDF"

## 🔄 Méthode alternative (via l'interface Supabase)

### Via Authentication > Users

1. Dans Supabase, allez dans **Authentication** > **Users**
2. Trouvez votre utilisateur (par email)
3. Cliquez sur les **3 points** à droite de votre utilisateur
4. Sélectionnez **"Edit user"**
5. Dans **"Raw user meta data"**, ajoutez :
   ```json
   {
     "subscription_plan": "premium",
     "is_pro": true,
     "is_premium": true,
     "subscription_status": "active"
   }
   ```
6. Cliquez sur **"Save"**

## 🧪 Tester les fonctionnalités Premium

Une fois Premium activé, vous pouvez tester :

### 1. Conseils IA
- La carte "Conseil IA (Premium)" devrait apparaître
- Elle charge automatiquement un conseil basé sur vos enregistrements

### 2. Export PDF
- Cliquez sur "Exporter en PDF par e-mail"
- Vous devriez recevoir un email avec le PDF (si RESEND_API_KEY est configuré)

### 3. Rappels mensuels
- Le toggle "Recevoir un rappel par e-mail tous les 2 du mois" devrait être visible
- Vous pouvez l'activer/désactiver

## ⚠️ Important

- Cette méthode est pour **les tests uniquement**
- En production, utilisez Stripe pour gérer les abonnements
- Les métadonnées seront réinitialisées si vous vous réinscrivez via Stripe

## 🔙 Désactiver Premium (retour au plan gratuit)

Pour revenir au plan gratuit, exécutez ce script (remplacez l'email) :

```sql
UPDATE auth.users
SET 
  user_metadata = COALESCE(user_metadata, '{}'::jsonb) || '{
    "subscription_plan": null,
    "is_pro": false,
    "is_premium": false,
    "subscription_status": null
  }'::jsonb
WHERE email = 'VOTRE_EMAIL_ICI';

DELETE FROM public.subscriptions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'VOTRE_EMAIL_ICI');
```

Puis déconnectez-vous et reconnectez-vous.

