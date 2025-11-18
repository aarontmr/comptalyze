# 🔒 SECURITY OVERVIEW - Comptalyze

**Date de l'audit :** 2025-01-27  
**Version de l'application :** 0.1.0  
**Auditeur :** Security Audit Bot

---

## 📋 Vue d'ensemble de l'application

### Description
Comptalyze est une application SaaS destinée aux micro-entrepreneurs français pour l'automatisation de la comptabilité et la gestion des cotisations URSSAF. L'application propose des plans gratuits, Pro et Premium avec des fonctionnalités différenciées.

### Stack technique

#### Frontend
- **Framework :** Next.js 16.0.1 (App Router)
- **UI :** React 19.2.0, Tailwind CSS 4
- **Animations :** Framer Motion
- **Charts :** Recharts

#### Backend
- **Runtime :** Node.js (via Next.js API Routes)
- **Base de données :** Supabase (PostgreSQL)
- **Authentification :** Supabase Auth
- **ORM :** Supabase Client (pas d'ORM traditionnel)

#### Services tiers
- **Paiements :** Stripe (abonnements, webhooks)
- **Emails :** Resend
- **IA :** OpenAI (ComptaBot, conseils Premium)
- **Analytics :** Google Analytics 4, Google Tag Manager, Meta Pixel
- **Protection :** Google reCAPTCHA v2

#### Infrastructure
- **Hébergement :** Vercel (supposé)
- **CDN :** Vercel Edge Network
- **Variables d'environnement :** Gérées via Vercel Dashboard

---

## 🎯 Zones critiques de sécurité

### 1. Authentification & Autorisation
- **Système :** Supabase Auth (JWT tokens)
- **Protection des routes :** Mix de protection client et serveur
- **RBAC :** Gestion des plans (free/pro/premium) via `user_metadata`
- **Zones sensibles :**
  - Routes API `/api/*` - Vérification token Bearer
  - Dashboard `/dashboard/*` - Protection côté client uniquement
  - Routes admin `/api/admin/*` - **⚠️ NON PROTÉGÉES**

### 2. Paiements & Webhooks
- **Provider :** Stripe
- **Webhook :** `/api/stripe/webhook` - Signature vérifiée ✅
- **Idempotence :** Table `webhook_events` pour éviter les doublons ✅
- **Sensibilité :** CRITIQUE - Gestion des abonnements et paiements

### 3. Base de données
- **Provider :** Supabase (PostgreSQL)
- **RLS (Row Level Security) :** Activé sur les tables sensibles ✅
- **Requêtes :** Utilisation de Supabase Client (requêtes paramétrées) ✅
- **Multi-tenant :** Isolation par `user_id` dans toutes les requêtes ✅

### 4. Intégrations tierces
- **Shopify :** OAuth flow avec state CSRF
- **Stripe Connect :** OAuth flow avec state CSRF
- **OpenAI :** API key côté serveur uniquement ✅
- **Resend :** API key côté serveur uniquement ✅

### 5. Données utilisateur
- **Factures :** Stockées dans `invoices` avec RLS
- **CA Records :** Historique des calculs URSSAF
- **Abonnements :** Gérés via Stripe + table `subscriptions`
- **Export de données :** Route `/api/export-data` - **⚠️ À VÉRIFIER**

### 6. Rate Limiting
- **Middleware :** Rate limiting en mémoire (Map)
- **Routes protégées :** Login (5/min), Signup (3/heure), API AI (20/min)
- **Limitation :** En mémoire uniquement (non distribué) - ⚠️ À améliorer en production

### 7. Headers de sécurité
- **CSP :** Configuré dans `middleware.ts` ✅
- **Autres headers :** X-Frame-Options, X-Content-Type-Options, Referrer-Policy ✅
- **CSP :** Utilise `'unsafe-inline'` et `'unsafe-eval'` pour Stripe - ⚠️ À optimiser

### 8. Validation des données
- **État actuel :** Validation basique (type checking, length)
- **Bibliothèque :** Aucune bibliothèque de validation (Zod/Yup/Joi) détectée ⚠️
- **Sanitization :** Manquante pour certains inputs ⚠️

---

## 🔍 Points d'attention identifiés

### 🔴 CRITIQUE
1. **Routes admin non protégées** (`/api/admin/*`)
2. **Route delete-account** accepte userId depuis body sans vérification d'authentification
3. **Route export-data** sans authentification
4. **Routes d'intégration** acceptent userId depuis query params sans vérification

### 🟠 ÉLEVÉ
1. **Validation des données** - Pas de bibliothèque de validation (Zod recommandé)
2. **Protection dashboard** - Côté client uniquement, pas de protection serveur stricte
3. **Rate limiting** - En mémoire uniquement (non distribué)
4. **CSP** - Utilise `'unsafe-inline'` et `'unsafe-eval'`

### 🟡 MOYEN
1. **dangerouslySetInnerHTML** - Utilisé pour JSON-LD (acceptable) et contenu utilisateur (à vérifier)
2. **Logs** - Vérifier qu'aucun secret n'est loggé
3. **Variables d'environnement** - Vérifier qu'aucune secrète n'est exposée côté client

### 🟢 FAIBLE
1. **Documentation sécurité** - À améliorer
2. **Tests de sécurité** - À ajouter

---

## ✅ Points positifs

1. ✅ **Webhook Stripe** - Signature vérifiée et idempotence gérée
2. ✅ **RLS activé** - Protection au niveau base de données
3. ✅ **Requêtes paramétrées** - Utilisation de Supabase Client (pas de SQL brut)
4. ✅ **Headers de sécurité** - CSP et autres headers configurés
5. ✅ **Rate limiting** - Présent sur les routes sensibles
6. ✅ **Isolation multi-tenant** - Toutes les requêtes filtrent par `user_id`
7. ✅ **Secrets côté serveur** - Variables sensibles non exposées côté client

---

## 📊 Statistiques

- **Routes API :** ~52 routes
- **Routes protégées :** ~45 routes (avec auth)
- **Routes non protégées :** ~7 routes (health, webhook, admin)
- **Tables avec RLS :** Toutes les tables sensibles
- **Variables d'environnement :** ~25 variables (toutes documentées dans `env.example`)

---

## 🔄 Prochaines étapes recommandées

1. **Immédiat :** Protéger les routes admin
2. **Court terme :** Ajouter validation Zod sur toutes les routes API
3. **Court terme :** Améliorer la protection serveur du dashboard
4. **Moyen terme :** Migrer rate limiting vers Redis/Upstash
5. **Moyen terme :** Optimiser CSP (réduire unsafe-inline/eval)
6. **Long terme :** Ajouter tests de sécurité automatisés
7. **Long terme :** Audit de sécurité externe

---

**Note :** Ce document est un aperçu général. Pour les détails des vulnérabilités et leurs corrections, voir `SECURITY_REPORT.md`.

