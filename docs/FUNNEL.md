# 📊 FUNNEL MARKETING & CONVERSION TRACKING - COMPTALYZE

> **Guide complet du funnel Google Ads → Signup avec attribution multi-touch**

---

## 📌 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du funnel](#architecture-du-funnel)
3. [Landing pages intent-specific](#landing-pages-intent-specific)
4. [Tracking & Attribution](#tracking--attribution)
5. [Conversions](#conversions)
6. [Mode invité (Guest Limiter)](#mode-invité-guest-limiter)
7. [Vérification & Debugging](#vérification--debugging)
8. [Dashboards & Reporting](#dashboards--reporting)

---

## 🎯 Vue d'ensemble

### Objectif

Diagnostiquer et corriger les problèmes de conversion **Google Ads → Signups** en implémentant :

- ✅ **Landing pages intent-specific** pour chaque type de recherche
- ✅ **Tracking multi-canal** (GA4, Google Ads, Meta Pixel, GTM)
- ✅ **Attribution complète** (UTM, gclid, fbclid)
- ✅ **Consent Mode v2** conforme RGPD
- ✅ **Mode invité** (3 simulations gratuites sans compte)
- ✅ **Tests E2E** pour garantir le bon fonctionnement

### Stack technique

- **Next.js 16** (App Router, TypeScript)
- **Supabase** (Auth, Postgres, RLS)
- **Google Analytics 4** (GA4)
- **Google Tag Manager** (GTM)
- **Meta Pixel** (Facebook)
- **Playwright** (Tests E2E)

---

## 🏗️ Architecture du funnel

### Flow utilisateur

```
Google Ads Click
    ↓
Landing page intent-specific (/simulateur-urssaf, /logiciel-micro-entreprise, etc.)
    ↓ (UTM + gclid persisted in localStorage)
Guest mode: 3 simulations gratuites
    ↓
Modal signup (after 3 simulations or CTA click)
    ↓
/signup (attribution data sent via URL params)
    ↓
Email verification (Supabase Auth)
    ↓
/success (conversion events fired)
    ↓
Dashboard (user logged in)
```

### Tracking à chaque étape

| Étape | Event GA4 | Event GTM | Conversion Ads | Meta Pixel |
|-------|-----------|-----------|----------------|------------|
| Landing page | `page_view` | `pageview` | — | `PageView` |
| CTA click | `cta_click` | `cta_click` | — | — |
| Signup start | `signup_started` | `signup_started` | — | — |
| Signup complete | `signup_complete` | `signup_complete` | ✅ `conversion` | ✅ `CompleteRegistration` |

---

## 🎯 Landing pages intent-specific

### Mapping Intent → Landing

| Intent | Keywords | Landing page | H1 |
|--------|----------|--------------|-----|
| Calcul URSSAF | "simulateur urssaf", "calcul cotisations" | `/simulateur-urssaf` | "Calculez vos cotisations URSSAF en 10 secondes" |
| Logiciel général | "logiciel micro-entreprise", "logiciel comptable" | `/logiciel-micro-entreprise` | "Le logiciel comptable 100% micro-entreprise" |
| Facturation | "facturation auto-entrepreneur", "créer facture" | `/facturation-auto-entrepreneur` | "Créez vos factures conformes en 2 clics" |

### Structure d'une landing page

Toutes les landing pages suivent ce template :

1. **Above-the-fold** (< 1 scroll)
   - H1 aligné à l'intent
   - Subhead problème → solution
   - CTA primaire ("Passer à Premium")
   - Trust bullets (sans CB, 100% français, export comptable, assistant IA)
   - Trust badges (données URSSAF officielles, +10M€ CA déclaré)

2. **Dashboard preview** (image ou GIF)

3. **"Comment ça marche"** (3 étapes)

4. **FAQ courte** (4 questions)

5. **CTA final** (répétition du CTA above-the-fold)

6. **Footer** (liens légaux)

### Fichiers créés

```
app/
  simulateur-urssaf/
    page.tsx
  logiciel-micro-entreprise/
    page.tsx
  facturation-auto-entrepreneur/
    page.tsx
```

---

## 📡 Tracking & Attribution

### AnalyticsProvider

Le composant `AnalyticsProvider` centralise tous les outils de tracking :

- **GA4** (Google Analytics 4)
- **GTM** (Google Tag Manager)
- **Meta Pixel** (Facebook)
- **Consent Mode v2** (par défaut denied, granted après acceptation cookies)

**Fichier :** `app/components/AnalyticsProvider.tsx`

#### Intégration

```tsx
// app/layout.tsx
import AnalyticsProvider from "@/app/components/AnalyticsProvider";
import CookieConsent from "@/app/components/CookieConsent";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
```

### Persistence des UTM

Les paramètres UTM et Click IDs sont automatiquement stockés dans `localStorage` :

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `gclid` (Google Click ID)
- `fbclid` (Facebook Click ID)
- `landing_slug` (page d'atterrissage)
- `referrer` (HTTP referrer)

**Fichier :** `lib/attributionUtils.ts`

#### Utilisation

```typescript
import { getAttributionData } from "@/lib/attributionUtils";

const attribution = getAttributionData();
// {
//   utmSource: "google",
//   utmMedium: "cpc",
//   utmCampaign: "simulateur-urssaf-lancement",
//   gclid: "Cj0KCQiA...",
//   landingSlug: "/simulateur-urssaf"
// }
```

### Base de données (Supabase)

#### Migration SQL

Exécutez la migration suivante pour créer les tables :

```bash
psql $DATABASE_URL < supabase_migration_marketing_attribution.sql
```

Ou via Supabase Dashboard : **SQL Editor** → Coller le contenu de `supabase_migration_marketing_attribution.sql` → **Run**.

#### Tables créées

**1) `marketing_signups`**

Table de tracking des signups avec attribution complète.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Référence à `auth.users` |
| `email` | TEXT | Email de l'utilisateur |
| `utm_source` | TEXT | Source marketing |
| `utm_medium` | TEXT | Medium marketing |
| `utm_campaign` | TEXT | Campagne |
| `utm_content` | TEXT | Contenu |
| `utm_term` | TEXT | Terme |
| `gclid` | TEXT | Google Click ID |
| `fbclid` | TEXT | Facebook Click ID |
| `landing_slug` | TEXT | Page d'atterrissage |
| `referrer` | TEXT | HTTP referrer |
| `created_at` | TIMESTAMPTZ | Date de création |

**2) Champs ajoutés à `user_profiles`**

Les mêmes champs d'attribution sont ajoutés à `user_profiles` pour un accès rapide.

---

## 🎯 Conversions

### Page /success

La page `/success` (après signup ou paiement) déclenche **tous** les événements de conversion :

1. **Database tracking** : insertion dans `marketing_signups` via server action
2. **Google Ads conversion** : `gtag('event', 'conversion', { send_to: 'AW-XXX/YYY' })`
3. **GA4 event** : `gtag('event', 'signup_complete')`
4. **GTM event** : `dataLayer.push({ event: 'signup_complete' })`
5. **Meta Pixel** : `fbq('track', 'CompleteRegistration')`

**Fichier modifié :** `app/success/page.tsx`

### Configuration Google Ads

1. **Créer une conversion dans Google Ads** :
   - Google Ads → **Tools & Settings** → **Conversions**
   - **+ New conversion action**
   - Type : **Website**
   - Goal : **Submit lead form**
   - Value : **Use different values for each conversion** (optionnel)
   - Conversion name : `Signup_Complete`

2. **Récupérer Conversion ID et Label** :
   - Dans Tag setup → **Use Google Tag Manager**
   - Notez `AW-XXXXXXXXXX` (Conversion ID) et `XXXXXXXXXXX` (Conversion Label)

3. **Ajouter à `.env.local`** :

```bash
NEXT_PUBLIC_GOOGLE_ADS_CONV_ID=AW-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL=XXXXXXXXXXX
```

### Configuration Meta Pixel

1. **Créer un Pixel dans Meta Events Manager** :
   - [business.facebook.com/events_manager](https://business.facebook.com/events_manager)
   - **Data Sources** → **Add** → **Web**
   - Nom : `Comptalyze Pixel`

2. **Récupérer Pixel ID** :
   - Dans **Pixel Settings**
   - Notez le **Pixel ID** (16 chiffres)

3. **Ajouter à `.env.local`** :

```bash
NEXT_PUBLIC_META_PIXEL_ID=1234567890123456
```

---

## 🎁 Mode invité (Guest Limiter)

### Fonctionnement

- **3 simulations gratuites** sans compte
- Le compteur est stocké dans `localStorage` (`guest_simulation_count`)
- Après 3 simulations → **modal de signup obligatoire**
- Après signup → compteur remis à zéro

### Fichiers

- **Utilitaire** : `lib/guestLimiter.ts`
- **Modal** : `app/components/GuestLimitModal.tsx`

### Intégration dans UrssafCalculator

```tsx
import { useState } from "react";
import { 
  getGuestSimulationCount, 
  incrementGuestSimulation, 
  canSimulateAsGuest 
} from "@/lib/guestLimiter";
import GuestLimitModal from "@/app/components/GuestLimitModal";

export default function UrssafCalculator({ user }) {
  const [showGuestModal, setShowGuestModal] = useState(false);
  const { remaining } = getGuestSimulationCount();

  const handleSimulate = () => {
    // Si l'utilisateur est connecté, pas de limite
    if (user) {
      // ... faire le calcul
      return;
    }

    // Mode invité : vérifier la limite
    if (!canSimulateAsGuest()) {
      setShowGuestModal(true);
      return;
    }

    // Incrémenter le compteur
    const success = incrementGuestSimulation();
    if (!success) {
      setShowGuestModal(true);
      return;
    }

    // Avertissement avant la dernière simulation
    const updated = getGuestSimulationCount();
    if (updated.remaining === 1) {
      setShowGuestModal(true);
    }

    // ... faire le calcul
  };

  return (
    <div>
      {/* ... */}
      <button onClick={handleSimulate}>Calculer</button>

      {showGuestModal && (
        <GuestLimitModal
          onClose={() => setShowGuestModal(false)}
          remaining={remaining}
        />
      )}
    </div>
  );
}
```

---

## 🐛 Vérification & Debugging

### 1) Vérifier GA4

**Temps réel** :
- Google Analytics → **Reports** → **Realtime**
- Cliquez sur un CTA de votre site
- Vérifiez que l'événement `signup_complete` apparaît

**Debug View** :
- Installez [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
- Ouvrez la console → Vérifiez les logs `gtag`

### 2) Vérifier Google Ads conversion

**Tag Assistant** :
- Installez [Tag Assistant](https://tagassistant.google.com/)
- Connectez votre site
- Faites un signup test
- Vérifiez que la conversion `AW-XXX/YYY` est déclenchée

**Dans Google Ads** :
- Google Ads → **Tools** → **Conversions**
- Cliquez sur votre conversion → **Recent conversions**
- Délai : **24-48h** pour voir les conversions

### 3) Vérifier Meta Pixel

**Meta Pixel Helper** :
- Installez [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
- Visitez votre site → Faites un signup
- Vérifiez que `CompleteRegistration` est déclenché

**Events Manager** :
- [business.facebook.com/events_manager](https://business.facebook.com/events_manager)
- **Test Events** → Vérifiez en temps réel

### 4) Vérifier GTM

**Preview Mode** :
- Google Tag Manager → **Preview**
- Entrez l'URL de votre site
- Vérifiez que les tags se déclenchent correctement

### 5) Vérifier la base de données

**Supabase SQL Editor** :

```sql
-- Vérifier les signups récents
SELECT *
FROM marketing_signups
ORDER BY created_at DESC
LIMIT 10;

-- Signups par source
SELECT 
  utm_source, 
  COUNT(*) as signups
FROM marketing_signups
GROUP BY utm_source
ORDER BY signups DESC;

-- Signups par landing page
SELECT 
  landing_slug, 
  COUNT(*) as signups
FROM marketing_signups
GROUP BY landing_slug
ORDER BY signups DESC;
```

---

## 📈 Dashboards & Reporting

### GA4 - Rapports personnalisés

**Exploration 1 : Funnel Acquisition**

1. GA4 → **Explore** → **Funnel exploration**
2. Étapes :
   - Étape 1 : `page_view` (landing pages)
   - Étape 2 : `cta_click`
   - Étape 3 : `signup_started`
   - Étape 4 : `signup_complete`
3. Dimensions : `utm_source`, `utm_campaign`, `landing_page`

**Exploration 2 : Attribution par source**

1. **Explore** → **Free form**
2. Dimensions : `utm_source`, `utm_medium`, `utm_campaign`
3. Metrics : `conversions`, `conversion_rate`

### Google Ads - Dashboard de conversion

1. Google Ads → **Campaigns** → Votre campagne
2. **Columns** → **Modify columns**
3. Ajouter : `Conversions`, `Conv. rate`, `Cost / conv.`

### Supabase - Dashboard Metabase (optionnel)

Connectez Metabase à votre base Supabase pour créer des dashboards SQL :

**Exemple de requête** :

```sql
SELECT 
  DATE(created_at) as date,
  utm_source,
  utm_campaign,
  COUNT(*) as signups
FROM marketing_signups
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), utm_source, utm_campaign
ORDER BY date DESC;
```

---

## ✅ Checklist GO/NO-GO

Avant de lancer les campagnes Google Ads, vérifiez cette checklist :

### 🔹 Landing pages

- [ ] `/simulateur-urssaf` live et accessible
- [ ] `/logiciel-micro-entreprise` live et accessible
- [ ] `/facturation-auto-entrepreneur` live et accessible
- [ ] CTA above-the-fold sur toutes les pages
- [ ] H1 aligné à l'intent de recherche
- [ ] Trust badges et bullets présents
- [ ] LCP (mobile) < 2.5s (testez avec Lighthouse)

### 🔹 Tracking

- [ ] GA4 ID configuré dans `.env.local`
- [ ] GTM ID configuré dans `.env.local`
- [ ] Meta Pixel ID configuré dans `.env.local`
- [ ] Google Ads Conversion ID + Label configurés
- [ ] AnalyticsProvider intégré dans `app/layout.tsx`
- [ ] CookieConsent visible et fonctionnel

### 🔹 Conversions

- [ ] `/success` page accessible
- [ ] Google Ads conversion se déclenche sur `/success` (testé avec Tag Assistant)
- [ ] Meta Pixel `CompleteRegistration` se déclenche sur `/success`
- [ ] GA4 `signup_complete` event visible dans Realtime
- [ ] GTM `signup_complete` event visible dans Preview Mode

### 🔹 Base de données

- [ ] Migration SQL exécutée avec succès
- [ ] Table `marketing_signups` créée
- [ ] Champs UTM ajoutés à `user_profiles`
- [ ] Row Level Security (RLS) activée
- [ ] Test d'insertion manuelle dans `marketing_signups` réussi

### 🔹 Mode invité

- [ ] Guest Limiter : exactement 3 simulations autorisées
- [ ] Modal s'affiche après la 3ème simulation
- [ ] Redirection vers `/signup` avec UTM params préservés
- [ ] Compteur remis à zéro après signup

### 🔹 Tests E2E

- [ ] Test Playwright : visite `/simulateur-urssaf` → voir CTA
- [ ] Test Playwright : 3 simulations invité → 4ème bloquée avec modal
- [ ] Test Playwright : signup mock → land sur `/success` → conversions déclenchées
- [ ] Test Playwright : vérifier insertion dans `marketing_signups`

---

## 🚀 Prochaines étapes

Une fois la checklist validée :

1. **Lancer une campagne test Google Ads** (budget 10-20€/jour)
   - 1 groupe d'annonces par intent (simulateur, logiciel, facturation)
   - Lien vers la landing page correspondante avec UTM params :
     ```
     https://comptalyze.com/simulateur-urssaf?utm_source=google&utm_medium=cpc&utm_campaign=simulateur-urssaf-lancement&gclid={gclid}
     ```

2. **Monitorer les conversions** (24-48h)
   - Google Ads : vérifier que les conversions remontent
   - GA4 : vérifier le funnel
   - Supabase : vérifier les rows dans `marketing_signups`

3. **Optimiser** (après 100+ clics)
   - Identifier les landing pages à fort taux de conversion
   - A/B tester les headlines et CTA
   - Ajuster les enchères par campagne

4. **Scaler** (après validation)
   - Augmenter le budget progressivement
   - Dupliquer les campagnes gagnantes
   - Tester de nouveaux mots-clés

---

## 📞 Support

Pour toute question ou problème :

- **Email** : support@comptalyze.com
- **Slack** (interne) : #growth-marketing
- **Documentation** : [Notion Growth Wiki](https://notion.so/comptalyze/growth)

---

**Dernière mise à jour** : 2025-01-11
**Version** : 1.0.0
**Auteur** : Comptalyze Growth Team

