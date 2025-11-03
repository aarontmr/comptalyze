-- Script pour activer Premium sur votre compte (pour les tests)
-- ⚠️ Remplacez 'VOTRE_EMAIL_ICI' par votre email de connexion Comptalyze
-- Exemple : WHERE email = 'monemail@example.com';

-- IMPORTANT : Les métadonnées utilisateur doivent être modifiées via l'API Admin de Supabase
-- Ce script crée uniquement l'enregistrement dans la table subscriptions
-- Pour les métadonnées, utilisez l'interface Supabase (voir GUIDE_ACTIVER_PREMIUM_TEST.md)

-- Méthode : Créer un enregistrement dans la table subscriptions avec Premium
-- Remplacez 'VOTRE_EMAIL_ICI' par votre email
INSERT INTO public.subscriptions (user_id, status, price_id, stripe_subscription_id, stripe_customer_id)
SELECT 
  id as user_id,
  'active' as status,
  'premium_test' as price_id, -- Valeur de test acceptée par lib/plan.ts
  'sub_test_premium' as stripe_subscription_id,
  'cus_test_premium' as stripe_customer_id
FROM auth.users
WHERE email = 'VOTRE_EMAIL_ICI'
ON CONFLICT (user_id) 
DO UPDATE SET
  status = 'active',
  price_id = 'premium_test',
  updated_at = NOW();

-- Méthode 2 : Créer un enregistrement dans la table subscriptions (plus propre)
-- Remplacez 'VOTRE_EMAIL_ICI' par votre email
INSERT INTO public.subscriptions (user_id, status, price_id, stripe_subscription_id, stripe_customer_id)
SELECT 
  id as user_id,
  'active' as status,
  'premium_test' as price_id, -- Valeur de test
  'sub_test_premium' as stripe_subscription_id,
  'cus_test_premium' as stripe_customer_id
FROM auth.users
WHERE email = 'VOTRE_EMAIL_ICI'
ON CONFLICT (user_id) 
DO UPDATE SET
  status = 'active',
  price_id = 'premium_test',
  updated_at = NOW();

-- Vérification : Vérifiez que ça a fonctionné
SELECT 
  u.email,
  u.user_metadata->>'subscription_plan' as plan_from_metadata,
  u.user_metadata->>'is_premium' as is_premium_metadata,
  s.status as subscription_status,
  s.price_id
FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
WHERE u.email = 'VOTRE_EMAIL_ICI';

