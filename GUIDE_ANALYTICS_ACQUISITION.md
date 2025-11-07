# 📊 Guide - Suivi des Acquisitions et Analytics

## Vue d'ensemble

Ce guide explique comment configurer et utiliser le système de suivi des sources d'acquisition et des événements clés pour Comptalyze.

## 🎯 Objectifs

- Suivre les sources d'acquisition (UTM parameters)
- Capturer les événements clés : `signup_started`, `signup_completed`, `record_created`, `upgrade_clicked`, `upgrade_completed`
- Afficher un rapport simple dans `/admin/metrics`
- Voir le nombre de signups par source et le taux de conversion free→pay

## 📋 Fichiers Créés

### 1. Migration Supabase
- **`supabase_migration_analytics_events.sql`** : Table pour stocker les événements et les sources UTM

### 2. Librairie Analytics
- **`lib/analytics.ts`** : Utilitaires pour capturer les UTM params et tracker les événements

### 3. Composants
- **`app/components/AnalyticsProvider.tsx`** : Provider pour initialiser l'analytics

### 4. Page Admin
- **`app/admin/metrics/page.tsx`** : Dashboard de métriques avec rapports

## 🚀 Installation

### Étape 1 : Exécuter la migration Supabase

1. Ouvrez votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez le contenu de `supabase_migration_analytics_events.sql`
4. Exécutez la requête
5. Vérifiez que la table `analytics_events` a été créée

### Étape 2 : Configurer Umami Analytics (Optionnel mais recommandé)

#### Option A : Umami Cloud (EU)

1. Créez un compte sur [Umami Cloud](https://cloud.umami.is)
2. Créez un nouveau site
3. Récupérez votre **Website ID**

#### Option B : Auto-hébergement Umami

Si vous préférez héberger Umami vous-même :

1. Suivez la [documentation Umami](https://umami.is/docs/install)
2. Déployez sur Railway, Vercel, ou votre propre serveur
3. Récupérez votre URL d'instance et Website ID

#### Configuration des variables d'environnement

Ajoutez dans votre `.env.local` :

```bash
# Umami Analytics (Optionnel)
NEXT_PUBLIC_UMAMI_WEBSITE_ID=votre-website-id-ici
NEXT_PUBLIC_UMAMI_SRC=https://cloud.umami.is/script.js  # Ou votre URL auto-hébergée
```

**Note** : Si vous ne configurez pas Umami, le système continuera de fonctionner et stockera les événements dans Supabase uniquement.

### Étape 3 : Configuration terminée ✅

Le système est maintenant opérationnel ! Les événements seront automatiquement trackés.

## 📊 Utilisation

### 1. Capturer les sources UTM

Les paramètres UTM sont automatiquement capturés lors de la première visite. Exemple d'URL :

```
https://comptalyze.com/?utm_source=google&utm_medium=cpc&utm_campaign=lancement_2024
```

Les UTM sont stockés dans `localStorage` et associés à tous les événements de l'utilisateur.

### 2. Événements trackés automatiquement

| Événement | Quand | Où |
|-----------|-------|-----|
| `signup_started` | L'utilisateur commence l'inscription | `app/signup/page.tsx` |
| `signup_completed` | Inscription réussie | `app/signup/page.tsx` |
| `record_created` | Création d'un enregistrement CA ou facture | `app/components/UrssafCalculator.tsx`, `app/factures/nouvelle/page.tsx` |
| `upgrade_clicked` | Clic sur bouton d'upgrade | `app/components/SubscriptionButtons.tsx` |
| `upgrade_completed` | Paiement réussi | `app/api/webhook/route.ts` |

### 3. Consulter les métriques

Accédez à `/admin/metrics` (réservé aux admins) pour voir :

- **Total des signups** par source UTM
- **Taux de conversion free → payant** par source
- **Résumé des événements**
- **Évolution temporelle**

## 🔍 Vérifier que ça fonctionne

### Test 1 : Vérifier la capture UTM

1. Ouvrez la console développeur de votre navigateur
2. Visitez : `http://localhost:3000/?utm_source=test&utm_medium=email&utm_campaign=test2024`
3. Vérifiez dans la console : `✅ Paramètres UTM capturés: { utm_source: 'test', ... }`
4. Ouvrez le localStorage et cherchez `comptalyze_utm_params`

### Test 2 : Vérifier le tracking d'événements

1. Inscrivez-vous avec un nouveau compte
2. Vérifiez la console : `✅ Événement tracké: signup_started` puis `✅ Événement tracké: signup_completed`
3. Dans Supabase, ouvrez la table `analytics_events` et vérifiez les nouvelles entrées

### Test 3 : Vérifier le dashboard

1. Assurez-vous que votre compte a le flag `is_admin = true` dans `user_profiles`
2. Visitez `/admin/metrics`
3. Vous devriez voir vos métriques

## 🔧 Dépannage

### Les événements ne sont pas enregistrés

1. Vérifiez que la table `analytics_events` existe dans Supabase
2. Vérifiez les politiques RLS :
   ```sql
   -- Dans Supabase SQL Editor
   SELECT * FROM pg_policies WHERE tablename = 'analytics_events';
   ```
3. Vérifiez la console du navigateur pour les erreurs

### Les UTM ne sont pas capturés

1. Vérifiez que le composant `AnalyticsProvider` est bien dans le layout
2. Ouvrez le localStorage du navigateur et cherchez `comptalyze_utm_params`
3. Effacez le localStorage pour tester à nouveau : 
   ```javascript
   localStorage.removeItem('comptalyze_utm_params')
   ```

### La page /admin/metrics ne s'affiche pas

1. Vérifiez que vous êtes admin dans Supabase :
   ```sql
   SELECT * FROM user_profiles WHERE user_id = 'votre-user-id';
   ```
2. Mettez à jour si nécessaire :
   ```sql
   UPDATE user_profiles SET is_admin = true WHERE user_id = 'votre-user-id';
   ```

### Les vues ne retournent pas de données

Si les vues `analytics_signups_by_source` ou `analytics_conversion_funnel` ne fonctionnent pas :

1. Vérifiez qu'elles existent :
   ```sql
   SELECT * FROM information_schema.views 
   WHERE table_name IN ('analytics_signups_by_source', 'analytics_conversion_funnel');
   ```
2. Recréez-les en réexécutant la migration

## 📈 Analyses Avancées

### Requêtes SQL utiles

#### Voir tous les événements d'un utilisateur
```sql
SELECT * FROM analytics_events 
WHERE user_id = 'user-id-ici' 
ORDER BY created_at DESC;
```

#### Taux de conversion par source
```sql
SELECT * FROM analytics_conversion_funnel 
ORDER BY conversion_rate_percent DESC;
```

#### Événements des 7 derniers jours
```sql
SELECT event_name, COUNT(*) as count, DATE(created_at) as date
FROM analytics_events 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_name, DATE(created_at)
ORDER BY date DESC, count DESC;
```

#### Sources les plus performantes
```sql
SELECT 
  COALESCE(utm_source, 'direct') as source,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_events
FROM analytics_events 
WHERE event_name = 'signup_completed'
GROUP BY utm_source
ORDER BY unique_users DESC;
```

## 🎨 Personnalisation

### Ajouter de nouveaux événements

1. Ajoutez le type dans `lib/analytics.ts` :
   ```typescript
   export type AnalyticsEvent =
     | 'signup_started'
     | 'signup_completed'
     | 'record_created'
     | 'upgrade_clicked'
     | 'upgrade_completed'
     | 'votre_nouvel_evenement';  // ← Ajoutez ici
   ```

2. Appelez `trackEvent` où vous le souhaitez :
   ```typescript
   import { trackEvent } from '@/lib/analytics';
   
   await trackEvent('votre_nouvel_evenement', {
     custom_data: 'valeur',
   });
   ```

### Modifier les rapports

Éditez `app/admin/metrics/page.tsx` pour personnaliser les tableaux et graphiques.

## 🔒 Sécurité et RGPD

### Données collectées

- ID de session anonyme (généré côté client)
- User ID (uniquement après inscription)
- Paramètres UTM
- Événements d'interaction
- Page visitée et referrer
- User-agent (pour statistiques techniques)
- Pas d'IP stockée par défaut

### Conformité RGPD

Le système est conçu pour être conforme au RGPD :

1. Les données sont stockées dans votre propre base Supabase (contrôle total)
2. Les UTM sont stockés uniquement dans le localStorage (pas de cookies)
3. Umami est hébergé en EU et respecte le RGPD
4. Les utilisateurs peuvent demander la suppression de leurs données

### Effacer les données d'un utilisateur

```sql
DELETE FROM analytics_events WHERE user_id = 'user-id-ici';
```

## 📚 Ressources

- [Documentation Umami](https://umami.is/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [UTM Parameters Guide](https://support.google.com/analytics/answer/1033863)

## ✅ Checklist de déploiement

- [ ] Migration Supabase exécutée
- [ ] Variables d'environnement configurées (Umami optionnel)
- [ ] Test de capture UTM effectué
- [ ] Test d'événement signup effectué
- [ ] Page /admin/metrics accessible
- [ ] Au moins un admin configuré dans user_profiles
- [ ] Documentation RGPD mise à jour (si nécessaire)

---

## 🎉 Félicitations !

Votre système de suivi des acquisitions est maintenant opérationnel. Vous pouvez suivre vos sources de trafic et optimiser vos campagnes marketing ! 🚀

