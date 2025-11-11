# ✅ CHECKLIST GO/NO-GO - CAMPAGNES GOOGLE ADS

> **Validation complète avant lancement des campagnes marketing**

---

## 📋 Instructions

- [ ] Cochez chaque item après vérification
- [ ] **Tous les items doivent être validés** avant de lancer les campagnes Google Ads
- [ ] En cas de ❌, corriger avant de continuer
- [ ] Délai de validation : **24-48h** après déploiement

---

## 🎯 1. LANDING PAGES

### 1.1 Accessibilité

- [ ] `/simulateur-urssaf` est accessible (HTTP 200)
- [ ] `/logiciel-micro-entreprise` est accessible (HTTP 200)
- [ ] `/facturation-auto-entrepreneur` est accessible (HTTP 200)

**Commande de test :**
```bash
curl -I https://comptalyze.com/simulateur-urssaf
curl -I https://comptalyze.com/logiciel-micro-entreprise
curl -I https://comptalyze.com/facturation-auto-entrepreneur
```

### 1.2 Contenu above-the-fold

- [ ] H1 visible et aligné à l'intent sur `/simulateur-urssaf`
- [ ] H1 visible et aligné à l'intent sur `/logiciel-micro-entreprise`
- [ ] H1 visible et aligné à l'intent sur `/facturation-auto-entrepreneur`
- [ ] CTA primaire ("Passer à Premium") visible sans scroll
- [ ] Trust bullets visibles (sans CB, 100% français, export comptable, assistant IA)
- [ ] Trust badges visibles (données URSSAF, +10M€ CA)

### 1.3 Performance

- [ ] LCP (mobile) < 2.5s sur `/simulateur-urssaf` (testé avec Lighthouse)
- [ ] LCP (mobile) < 2.5s sur `/logiciel-micro-entreprise`
- [ ] LCP (mobile) < 2.5s sur `/facturation-auto-entrepreneur`

**Commande de test :**
```bash
npm run test:e2e -- --grep "Performance - LCP"
```

**Outil externe :**
- [PageSpeed Insights](https://pagespeed.web.dev/) → Tester les 3 URLs en mobile

---

## 📡 2. TRACKING & ANALYTICS

### 2.1 Configuration des outils

- [ ] `NEXT_PUBLIC_GA4_ID` défini dans `.env.local` ou Vercel
- [ ] `NEXT_PUBLIC_GTM_ID` défini dans `.env.local` ou Vercel
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` défini dans `.env.local` ou Vercel
- [ ] `NEXT_PUBLIC_GOOGLE_ADS_CONV_ID` défini dans `.env.local` ou Vercel
- [ ] `NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL` défini dans `.env.local` ou Vercel

### 2.2 GA4 - Base Tag

- [ ] GA4 tag se charge sur toutes les pages
- [ ] Event `page_view` visible dans GA4 Realtime après visite de `/simulateur-urssaf`

**Vérification :**
1. Ouvrir [Google Analytics](https://analytics.google.com/)
2. **Reports** → **Realtime**
3. Visiter `https://comptalyze.com/simulateur-urssaf` dans un autre onglet
4. Vérifier que l'event `page_view` apparaît

### 2.3 Google Tag Manager (GTM)

- [ ] GTM container se charge sur toutes les pages
- [ ] Event `pageview` visible dans GTM Preview Mode

**Vérification :**
1. Ouvrir [Google Tag Manager](https://tagmanager.google.com/)
2. **Preview** → Entrer l'URL de production
3. Visiter `/simulateur-urssaf`
4. Vérifier que l'event `pageview` est déclenché

### 2.4 Meta Pixel

- [ ] Meta Pixel se charge sur toutes les pages
- [ ] Event `PageView` visible dans Meta Pixel Helper

**Vérification :**
1. Installer [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Visiter `https://comptalyze.com/simulateur-urssaf`
3. Cliquer sur l'extension → Vérifier que `PageView` est détecté

---

## 🎯 3. CONVERSIONS

### 3.1 Page /success

- [ ] `/success` est accessible (après signup ou paiement)
- [ ] Message "Paiement réussi !" ou "Inscription réussie" s'affiche

### 3.2 Google Ads Conversion

- [ ] Event `conversion` se déclenche sur `/success`
- [ ] `send_to` contient le bon Conversion ID/Label

**Vérification avec Tag Assistant :**
1. Installer [Tag Assistant](https://tagassistant.google.com/)
2. Faire un signup test ou visiter `/success?session_id=test`
3. Vérifier que la conversion `AW-XXX/YYY` est déclenchée

**Vérification dans Google Ads :**
- Google Ads → **Tools** → **Conversions**
- Attendre **24-48h** après un signup réel
- Vérifier qu'une conversion apparaît dans "Recent conversions"

### 3.3 GA4 Conversion Event

- [ ] Event `signup_complete` se déclenche sur `/success`
- [ ] Event visible dans GA4 Realtime

**Vérification :**
1. Ouvrir GA4 → **Realtime**
2. Visiter `/success?session_id=test` (ou faire un signup test)
3. Vérifier que `signup_complete` apparaît

### 3.4 Meta Pixel Conversion

- [ ] Event `CompleteRegistration` se déclenche sur `/success`
- [ ] Event visible dans Meta Pixel Helper

**Vérification :**
1. Activer Meta Pixel Helper
2. Visiter `/success?session_id=test`
3. Vérifier que `CompleteRegistration` est détecté

### 3.5 GTM Conversion Event

- [ ] Event `signup_complete` visible dans GTM dataLayer
- [ ] Event visible dans GTM Preview Mode

**Vérification :**
1. Activer GTM Preview Mode
2. Visiter `/success?session_id=test`
3. Vérifier que `signup_complete` est dans le dataLayer

---

## 🗄️ 4. BASE DE DONNÉES

### 4.1 Migration SQL

- [ ] Migration `supabase_migration_marketing_attribution.sql` exécutée
- [ ] Table `marketing_signups` créée
- [ ] Champs UTM ajoutés à `user_profiles`

**Vérification :**
```sql
-- Dans Supabase SQL Editor
SELECT * FROM marketing_signups LIMIT 1;

SELECT 
  id, 
  utm_source, 
  utm_medium, 
  utm_campaign, 
  gclid 
FROM user_profiles 
WHERE utm_source IS NOT NULL 
LIMIT 1;
```

### 4.2 RLS (Row Level Security)

- [ ] RLS activée sur `marketing_signups`
- [ ] Policies créées (users can read own, service role can insert)

**Vérification :**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'marketing_signups';
-- rowsecurity devrait être 'true'
```

### 4.3 Test d'insertion

- [ ] Insertion manuelle dans `marketing_signups` réussie

**Test :**
```sql
INSERT INTO marketing_signups (
  email, 
  utm_source, 
  utm_medium, 
  utm_campaign, 
  gclid, 
  landing_slug
) VALUES (
  'test-checklist@comptalyze.com',
  'google',
  'cpc',
  'test-checklist',
  'test-gclid-123',
  '/simulateur-urssaf'
) RETURNING *;
```

---

## 🎁 5. MODE INVITÉ

### 5.1 Guest Limiter

- [ ] Exactement **3 simulations** autorisées sans compte
- [ ] Modal s'affiche après la 3ème simulation
- [ ] Message "Limite atteinte !" affiché
- [ ] Bouton "Créer mon compte" redirige vers `/signup` avec UTM params

**Test manuel :**
1. Ouvrir un navigateur privé
2. Aller sur le simulateur (sans login)
3. Faire 3 simulations → Compter les simulations
4. Tenter une 4ème → Modal devrait apparaître

### 5.2 Redirection vers signup avec attribution

- [ ] Modal contient un lien vers `/signup`
- [ ] UTM params sont préservés dans l'URL de signup

**Vérification :**
1. Ouvrir Dev Tools → **Application** → **Local Storage**
2. Ajouter manuellement : `utm_source=test`, `utm_campaign=checklist`
3. Déclencher le modal
4. Cliquer sur "Créer mon compte"
5. Vérifier que l'URL contient `?utm_source=test&utm_campaign=checklist`

---

## 🍪 6. COOKIE CONSENT

### 6.1 Banner visible

- [ ] Banner "Cookies et confidentialité" s'affiche après 1 seconde sur première visite
- [ ] Boutons "Accepter" et "Refuser" visibles

**Test :**
1. Ouvrir un navigateur privé
2. Aller sur `https://comptalyze.com`
3. Attendre 1-2 secondes
4. Vérifier que le banner apparaît en bas

### 6.2 Consent Mode v2

- [ ] Par défaut, `ad_storage` et `analytics_storage` sont à `denied`
- [ ] Après acceptation, ils passent à `granted`

**Vérification avec Dev Tools :**
```javascript
// Dans la console, après acceptation
console.log(window.dataLayer);
// Doit contenir un event "consent_update" avec granted
```

---

## 🧪 7. TESTS E2E

### 7.1 Playwright configuré

- [ ] Playwright installé (`npm install @playwright/test`)
- [ ] Configuration dans `playwright.config.ts`

### 7.2 Tests passent

- [ ] Test "Landing pages intent-specific" ✅
- [ ] Test "UTM & Attribution Persistence" ✅
- [ ] Test "Mode invité - Guest Limiter" ✅ (ou skip si simulateur behind auth)
- [ ] Test "Signup avec attribution" ✅
- [ ] Test "Conversions tracking sur /success" ✅
- [ ] Test "Cookie Consent Banner" ✅
- [ ] Test "Performance - LCP" ✅

**Commande :**
```bash
npm run test:e2e
```

---

## 🚀 8. DÉPLOIEMENT

### 8.1 Variables d'environnement (Vercel)

- [ ] Toutes les variables `NEXT_PUBLIC_*` définies dans Vercel
- [ ] Variables déployées sur **Production** (pas seulement Preview)

**Vérification :**
1. Ouvrir Vercel Dashboard → Votre projet
2. **Settings** → **Environment Variables**
3. Vérifier que les variables suivantes existent pour **Production** :
   - `NEXT_PUBLIC_GA4_ID`
   - `NEXT_PUBLIC_GTM_ID`
   - `NEXT_PUBLIC_META_PIXEL_ID`
   - `NEXT_PUBLIC_GOOGLE_ADS_CONV_ID`
   - `NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL`

### 8.2 Build réussi

- [ ] Build Vercel passe sans erreur
- [ ] Pas d'erreurs TypeScript ou ESLint

**Vérification :**
```bash
npm run build
```

### 8.3 Redéploiement après changement d'env

- [ ] Si les variables d'environnement ont été modifiées, **redéployer** la production

---

## 📊 9. DASHBOARDS & REPORTING

### 9.1 Google Ads

- [ ] Colonne "Conversions" visible dans le dashboard Campaigns
- [ ] Conversion `Signup_Complete` listée dans Tools > Conversions

### 9.2 GA4

- [ ] Exploration "Funnel Acquisition" créée (optionnel mais recommandé)
- [ ] Dimensions : `utm_source`, `utm_campaign`, `landing_page`

### 9.3 Supabase

- [ ] Requête SQL de reporting sauvegardée (voir `docs/FUNNEL.md`)
- [ ] Accès lecture à la table `marketing_signups` pour l'équipe marketing

---

## ✅ VALIDATION FINALE

### Responsable : _______________________

### Date de validation : _____ / _____ / _____

### Signature : _______________________

---

## 🔴 SI UN ITEM EST ❌

**NE PAS LANCER LES CAMPAGNES GOOGLE ADS** avant d'avoir corrigé.

### Procédure de correction :

1. Identifier l'item en échec
2. Consulter `docs/FUNNEL.md` pour les instructions
3. Corriger le problème
4. Re-tester
5. Cocher l'item
6. Continuer la checklist

---

## 🎉 SI TOUS LES ITEMS SONT ✅

**VOUS POUVEZ LANCER LES CAMPAGNES GOOGLE ADS !**

### Prochaines étapes :

1. Créer les campagnes Google Ads (1 par intent)
2. Configurer les URLs avec UTM params :
   ```
   https://comptalyze.com/simulateur-urssaf?utm_source=google&utm_medium=cpc&utm_campaign=simulateur-urssaf-lancement&gclid={gclid}
   ```
3. Budget test : **10-20€/jour** pendant 7 jours
4. Monitorer les conversions dans Google Ads (délai 24-48h)
5. Optimiser selon les résultats

---

**Dernière mise à jour** : 2025-01-11  
**Version** : 1.0.0  
**Contact** : support@comptalyze.com

