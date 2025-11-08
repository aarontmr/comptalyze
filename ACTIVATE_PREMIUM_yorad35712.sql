-- ✅ Activation du statut Premium pour yorad35712@nyfhk.com
-- À exécuter dans Supabase SQL Editor

-- 1. Mettre à jour les métadonnées utilisateur pour activer Premium
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          COALESCE(raw_user_meta_data, '{}'::jsonb),
          '{subscription_plan}',
          '"premium"'
        ),
        '{is_pro}',
        'true'
      ),
      '{is_premium}',
      'true'
    ),
    '{subscription_status}',
    '"active"'
  ),
  '{stripe_customer_id}',
  '"cus_manual_premium"'
)
WHERE email = 'yorad35712@nyfhk.com';

-- 2. Créer ou mettre à jour l'enregistrement dans la table subscriptions
INSERT INTO public.subscriptions (user_id, status, price_id, stripe_subscription_id, stripe_customer_id, created_at, updated_at)
SELECT 
  id as user_id,
  'active' as status,
  'price_premium_manual' as price_id,
  'sub_manual_premium_' || id as stripe_subscription_id,
  'cus_manual_premium' as stripe_customer_id,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users
WHERE email = 'yorad35712@nyfhk.com'
ON CONFLICT (user_id) 
DO UPDATE SET
  status = 'active',
  price_id = 'price_premium_manual',
  updated_at = NOW();

-- 3. Vérifier que ça a fonctionné
SELECT 
  id,
  email,
  raw_user_meta_data->>'subscription_plan' as plan,
  raw_user_meta_data->>'is_premium' as is_premium,
  raw_user_meta_data->>'subscription_status' as status
FROM auth.users
WHERE email = 'yorad35712@nyfhk.com';

-- ✅ Résultat attendu :
-- plan: "premium"
-- is_premium: "true"
-- status: "active"

