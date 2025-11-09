# 🔍 Guide : Vérifier et corriger les métadonnées de votre compte

## 🎯 Objectif

Vérifier que votre compte Premium manuel a les bonnes métadonnées pour que le badge "Essai gratuit" ne s'affiche pas.

---

## ✅ Étape 1 : Vérifier les métadonnées actuelles

### Dans la console du navigateur :

1. **Ouvrez votre application** dans le navigateur
2. **Appuyez sur F12** pour ouvrir les DevTools
3. **Allez dans l'onglet "Console"**
4. **Collez ce code** :

```javascript
// Récupérer la session actuelle
const { data: { session } } = await window.supabase.auth.getSession();

if (!session) {
  console.log('❌ Pas de session active');
} else {
  const metadata = session.user.user_metadata;
  
  console.log('📊 Métadonnées du compte :');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email:', session.user.email);
  console.log('User ID:', session.user.id);
  console.log('');
  console.log('🎫 Plan actuel :');
  console.log('  is_premium:', metadata.is_premium);
  console.log('  is_pro:', metadata.is_pro);
  console.log('  subscription_plan:', metadata.subscription_plan);
  console.log('  subscription_status:', metadata.subscription_status);
  console.log('');
  console.log('💳 Stripe :');
  console.log('  stripe_subscription_id:', metadata.stripe_subscription_id || 'null');
  console.log('');
  console.log('🆓 Essai gratuit :');
  console.log('  premium_trial_active:', metadata.premium_trial_active);
  console.log('  premium_trial_ends_at:', metadata.premium_trial_ends_at);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Diagnostic automatique
  console.log('');
  console.log('🔍 DIAGNOSTIC :');
  
  const hasStripe = !!metadata.stripe_subscription_id;
  const hasActiveStatus = metadata.subscription_status === 'active';
  const hasPlanSet = metadata.subscription_plan === 'premium' || metadata.subscription_plan === 'pro';
  
  const isPaidOrManual = hasStripe || hasActiveStatus || hasPlanSet;
  
  if (isPaidOrManual) {
    console.log('✅ Compte reconnu comme Premium/Pro payant ou manuel');
    console.log('✅ Le badge "Essai gratuit" NE DEVRAIT PAS s\'afficher');
  } else {
    console.log('⚠️  Compte NON reconnu comme payant/manuel');
    console.log('⚠️  Le badge "Essai gratuit" pourrait s\'afficher');
    console.log('');
    console.log('💡 Solutions :');
    console.log('   1. Ajouter subscription_plan = "premium"');
    console.log('   2. OU ajouter subscription_status = "active"');
    console.log('   3. OU ajouter un stripe_subscription_id');
  }
}
```

---

## 📊 Interpréter les résultats

### ✅ Configuration CORRECTE pour compte Premium manuel

Vous devriez voir **au moins UNE** de ces valeurs :

```
✅ subscription_plan: "premium"
✅ subscription_status: "active"
✅ stripe_subscription_id: "sub_xxx..."
```

**Exemple de sortie correcte :**

```
📊 Métadonnées du compte :
━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: votre@email.com
User ID: abc123...

🎫 Plan actuel :
  is_premium: true
  is_pro: false
  subscription_plan: "premium"  ← ✅ BON
  subscription_status: "active"  ← ✅ BON

💳 Stripe :
  stripe_subscription_id: null  ← OK pour compte manuel

🆓 Essai gratuit :
  premium_trial_active: true     ← Sera ignoré
  premium_trial_ends_at: "2025-11-15..."  ← Sera ignoré
━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 DIAGNOSTIC :
✅ Compte reconnu comme Premium/Pro payant ou manuel
✅ Le badge "Essai gratuit" NE DEVRAIT PAS s'afficher
```

---

### ❌ Configuration INCORRECTE

Si vous voyez :

```
🎫 Plan actuel :
  is_premium: true
  subscription_plan: null        ← ❌ Manquant
  subscription_status: null      ← ❌ Manquant

💳 Stripe :
  stripe_subscription_id: null  ← ❌ Manquant

🆓 Essai gratuit :
  premium_trial_active: true
  premium_trial_ends_at: "2025-11-15..."

🔍 DIAGNOSTIC :
⚠️  Compte NON reconnu comme payant/manuel
⚠️  Le badge "Essai gratuit" pourrait s'afficher
```

**→ Il faut corriger les métadonnées !**

---

## 🔧 Étape 2 : Corriger les métadonnées

### Option A : Via Supabase Dashboard (Plus simple)

1. **Allez sur** [supabase.com](https://supabase.com)
2. **Ouvrez votre projet**
3. **Cliquez sur "Authentication"** dans le menu gauche
4. **Cliquez sur "Users"**
5. **Trouvez votre utilisateur** (cherchez par email)
6. **Cliquez sur les 3 points** → **"Edit user"**
7. **Dans "User Metadata (JSON)"**, modifiez/ajoutez :

```json
{
  "is_premium": true,
  "subscription_plan": "premium",
  "subscription_status": "active"
}
```

8. **Cliquez sur "Save"**
9. **Déconnectez-vous et reconnectez-vous** dans l'application

---

### Option B : Via SQL Editor

1. **Dans Supabase**, allez dans **"SQL Editor"**
2. **Créez une nouvelle query**
3. **Collez ce code** (remplacez l'email) :

```sql
-- Mettre à jour les métadonnées pour un compte Premium manuel
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{is_premium}',
      'true'
    ),
    '{subscription_plan}',
    '"premium"'
  ),
  '{subscription_status}',
  '"active"'
)
WHERE email = 'VOTRE_EMAIL@exemple.com';

-- Vérifier que ça a fonctionné
SELECT 
  email,
  raw_user_meta_data->>'is_premium' as is_premium,
  raw_user_meta_data->>'subscription_plan' as plan,
  raw_user_meta_data->>'subscription_status' as status
FROM auth.users
WHERE email = 'VOTRE_EMAIL@exemple.com';
```

4. **Exécutez** (bouton "Run")
5. **Vérifiez** que la deuxième requête affiche les bonnes valeurs

---

### Option C : Via script Node.js

Créer un fichier `scripts/fix-manual-premium.js` :

```javascript
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixManualPremiumAccount(email) {
  console.log(`🔍 Recherche de l'utilisateur : ${email}`);
  
  // Récupérer l'utilisateur
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }
  
  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.error('❌ Utilisateur non trouvé');
    return;
  }

  console.log('✅ Utilisateur trouvé:', user.id);
  console.log('📊 Métadonnées actuelles:', user.user_metadata);

  // Mettre à jour
  const { data, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      user_metadata: {
        ...user.user_metadata,
        is_premium: true,
        subscription_plan: 'premium',
        subscription_status: 'active',
      }
    }
  );

  if (updateError) {
    console.error('❌ Erreur lors de la mise à jour:', updateError);
  } else {
    console.log('✅ Compte mis à jour avec succès !');
    console.log('📊 Nouvelles métadonnées:', data.user.user_metadata);
    console.log('');
    console.log('🔄 Déconnectez-vous et reconnectez-vous pour voir les changements');
  }
}

// Usage
const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/fix-manual-premium.js email@exemple.com');
  process.exit(1);
}

fixManualPremiumAccount(email);
```

**Exécution :**
```bash
node scripts/fix-manual-premium.js votre@email.com
```

---

## 🔄 Étape 3 : Vérifier que ça fonctionne

1. **Déconnectez-vous** de l'application
2. **Reconnectez-vous** (pour recharger les métadonnées)
3. **Allez sur le dashboard**
4. **Vérifiez** :
   - ✅ Pas de badge "Essai gratuit"
   - ✅ Badge "Premium" normal affiché
   - ✅ Toutes les fonctionnalités accessibles

---

## 🧪 Test rapide dans la console

Après avoir corrigé, testez à nouveau :

```javascript
const { data: { session } } = await window.supabase.auth.getSession();
const metadata = session.user.user_metadata;

console.log('Vérification :');
console.log('subscription_plan:', metadata.subscription_plan);  // Devrait être "premium"
console.log('subscription_status:', metadata.subscription_status);  // Devrait être "active"

// Test de la logique
const isPaidOrManual = 
  !!metadata.stripe_subscription_id || 
  metadata.subscription_status === 'active' || 
  metadata.subscription_plan === 'premium' || 
  metadata.subscription_plan === 'pro';

console.log('');
console.log(isPaidOrManual 
  ? '✅ Compte reconnu comme Premium' 
  : '❌ Compte NON reconnu');
```

---

## ⚠️ Notes importantes

### Pour un compte Premium MANUEL, vous DEVEZ avoir :

**Obligatoire (au moins UN) :**
- `subscription_plan: "premium"` **OU**
- `subscription_status: "active"` **OU**
- `stripe_subscription_id: "sub_xxx"`

**Recommandé :**
```json
{
  "is_premium": true,
  "subscription_plan": "premium",
  "subscription_status": "active"
}
```

### À NE PAS utiliser pour comptes manuels :

```json
{
  "premium_trial_active": true,  // ← Seulement pour vrais trials
  "premium_trial_ends_at": "..."  // ← Seulement pour vrais trials
}
```

---

## 🆘 Toujours des problèmes ?

### Si le badge s'affiche encore après correction :

1. **Videz le cache du navigateur** (`Ctrl+Shift+R`)
2. **Déconnectez-vous et reconnectez-vous**
3. **Vérifiez dans un onglet privé**
4. **Vérifiez que les métadonnées ont bien été sauvegardées** dans Supabase
5. **Relancez le serveur** (`Ctrl+C` puis `npm run dev`)

---

## ✅ Résultat attendu

Une fois les métadonnées corrigées :

- ✅ `subscription_plan: "premium"` ou `subscription_status: "active"` présent
- ✅ Badge "Essai gratuit" **N'APPARAÎT PLUS**
- ✅ Badge "Premium" normal affiché
- ✅ Toutes fonctionnalités Premium accessibles
- ✅ Pas de limite de temps

---

**Besoin d'aide ? Partagez la sortie de la console et je vous aiderai ! 🚀**

