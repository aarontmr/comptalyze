# 🎯 Activer Premium - Méthodes disponibles

## ⚠️ Si "Raw user meta data" est en lecture seule

Si vous ne pouvez pas modifier le champ "Raw user meta data" dans l'interface Supabase, utilisez plutôt la **méthode via l'API** (voir `ACTIVER_PREMIUM_API.md`).

---

# 🎯 Activer Premium via l'interface Supabase (si le champ est modifiable)

## 📋 Méthode la plus simple

### Étape 1 : Modifier les métadonnées utilisateur

1. Dans Supabase, allez dans **Authentication** > **Users**
2. Trouvez votre utilisateur (recherchez par email)
3. Cliquez sur les **3 points** (⋮) à droite de votre utilisateur
4. Sélectionnez **"Edit user"** ou **"Edit"**

### Étape 2 : Modifier Raw user meta data

1. Dans la section **"Raw user meta data"**, vous verrez un JSON (peut être vide `{}`)
2. **Remplacez ou ajoutez** ce contenu :

```json
{
  "subscription_plan": "premium",
  "is_pro": true,
  "is_premium": true,
  "subscription_status": "active"
}
```

3. Si vous avez déjà des métadonnées, **fusionnez-les** avec celles-ci. Exemple :

**Avant :**
```json
{
  "name": "Mon Nom"
}
```

**Après :**
```json
{
  "name": "Mon Nom",
  "subscription_plan": "premium",
  "is_pro": true,
  "is_premium": true,
  "subscription_status": "active"
}
```

4. Cliquez sur **"Save"** ou **"Update"**

### Étape 3 : Créer l'enregistrement dans subscriptions (optionnel mais recommandé)

1. Dans Supabase, allez dans **SQL Editor**
2. Créez une nouvelle requête
3. Copiez-collez ce script (remplacez l'email) :

```sql
INSERT INTO public.subscriptions (user_id, status, price_id, stripe_subscription_id, stripe_customer_id)
SELECT 
  id as user_id,
  'active' as status,
  'premium_test' as price_id,
  'sub_test_premium' as stripe_subscription_id,
  'cus_test_premium' as stripe_customer_id
FROM auth.users
WHERE email = 'VOTRE_EMAIL_ICI'
ON CONFLICT (user_id) 
DO UPDATE SET
  status = 'active',
  price_id = 'premium_test',
  updated_at = NOW();
```

4. Remplacez `'VOTRE_EMAIL_ICI'` par votre email
5. Cliquez sur **"Run"**

### Étape 4 : Recharger l'application

1. **Déconnectez-vous** de votre application Comptalyze
2. **Reconnectez-vous** (les métadonnées seront rechargées)
3. Vous devriez maintenant avoir accès aux fonctionnalités Premium !

## ✅ Vérification

Vous devriez voir :
- ✅ Le toggle "Recevoir un rappel par e-mail tous les 2 du mois" dans le dashboard
- ✅ La carte "Conseil IA (Premium)" dans le calculateur
- ✅ Le bouton "Exporter en PDF par e-mail"

## 🔙 Revenir au plan gratuit

Pour revenir au plan gratuit :

1. **Interface Supabase** : Modifiez les métadonnées utilisateur et remplacez par :
   ```json
   {
     "subscription_plan": null,
     "is_pro": false,
     "is_premium": false,
     "subscription_status": null
   }
   ```

2. **SQL Editor** : Exécutez :
   ```sql
   DELETE FROM public.subscriptions
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'VOTRE_EMAIL_ICI');
   ```

3. Déconnectez-vous et reconnectez-vous

