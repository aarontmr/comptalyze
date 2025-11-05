# 📚 Guide : Tutoriel d'Onboarding Interactif

## 🎯 Objectif

Le tutoriel d'onboarding guide les nouveaux utilisateurs à travers les fonctionnalités principales de Comptalyze. Il s'adapte automatiquement selon le plan de l'utilisateur (Gratuit, Pro, Premium).

## ✨ Fonctionnalités

### Affichage automatique

Le tutoriel s'affiche automatiquement dans ces situations :
- ✅ **Première inscription** : L'utilisateur vient de créer son compte
- ✅ **Première connexion** : L'utilisateur se connecte pour la première fois
- ✅ **Utilisateurs existants** : Les utilisateurs qui n'ont jamais vu le tutoriel

### Adaptation selon le plan

Le tutoriel affiche différentes étapes selon le plan de l'utilisateur :

#### Plan Gratuit (6 étapes)
1. **Bienvenue** - Introduction générale
2. **Aperçu du dashboard** - Vue d'ensemble
3. **Statistiques** - Cartes de stats (CA, net, cotisations)
4. **Simulateur URSSAF** - Calcul des cotisations
5. **Navigation** - Menu latéral
6. **C'est parti** - Message de fin

#### Plan Pro (7 étapes)
Toutes les étapes du plan Gratuit +
5. **Gestion des factures** - Création et envoi de factures

#### Plan Premium (8 étapes)
Toutes les étapes du plan Pro +
6. **Statistiques avancées** - Graphiques et analyses

## 🔧 Architecture technique

### Composants

**OnboardingTutorial.tsx** (`app/components/OnboardingTutorial.tsx`)
- Composant principal du tutoriel
- Gère l'affichage, la navigation entre les étapes
- Filtre les étapes selon le plan de l'utilisateur
- Enregistre la complétion dans les métadonnées utilisateur

**DashboardLayout.tsx** (`app/dashboard/layout.tsx`)
- Intègre le tutoriel dans le layout du dashboard
- Le tutoriel s'affiche au-dessus de tous les autres éléments

### Attributs data-tutorial

Pour que le tutoriel puisse pointer vers les bons éléments, ajoutez l'attribut `data-tutorial` :

```tsx
<h1 data-tutorial="overview">Aperçu</h1>
<div data-tutorial="stats-cards">...</div>
<Link data-tutorial="calculator">...</Link>
<Link data-tutorial="invoices">...</Link>
<Link data-tutorial="statistics">...</Link>
<aside data-tutorial="navigation">...</aside>
```

### Étapes du tutoriel

Chaque étape est définie dans `allSteps` avec :

```typescript
interface TutorialStep {
  id: string;                    // Identifiant unique
  title: string;                 // Titre de l'étape
  description: string;           // Description détaillée
  icon: React.ComponentType;     // Icône Lucide
  targetSelector?: string;       // Sélecteur CSS de l'élément ciblé
  position?: "top" | "bottom" | "left" | "right" | "center";
  requiresPro?: boolean;         // Étape réservée aux Pro/Premium
  requiresPremium?: boolean;     // Étape réservée aux Premium uniquement
}
```

### Logique de filtrage

```typescript
const steps = allSteps.filter((step) => {
  // Les étapes Premium sont affichées uniquement aux utilisateurs Premium
  if (step.requiresPremium && !subscription.isPremium) return false;
  
  // Les étapes Pro sont affichées aux utilisateurs Pro ET Premium
  if (step.requiresPro && !subscription.isPro && !subscription.isPremium) return false;
  
  // Les autres étapes sont affichées à tous
  return true;
});
```

## 📝 Enregistrement de la complétion

Lorsque l'utilisateur termine ou ferme le tutoriel, les métadonnées suivantes sont enregistrées :

```typescript
{
  onboarding_completed: true,
  onboarding_completed_at: "2025-11-05T10:30:00.000Z"
}
```

Ces métadonnées sont stockées dans `user.user_metadata` via Supabase Auth.

## 🎨 Personnalisation

### Ajouter une nouvelle étape

1. **Ajoutez l'étape dans `allSteps`** :

```typescript
{
  id: "mon-etape",
  title: "Ma nouvelle étape",
  description: "Description de ma nouvelle fonctionnalité",
  icon: MonIcone,
  targetSelector: "[data-tutorial='mon-element']",
  position: "bottom",
  requiresPro: true, // Optionnel
}
```

2. **Ajoutez l'attribut `data-tutorial` sur l'élément ciblé** :

```tsx
<div data-tutorial="mon-element">
  Mon contenu
</div>
```

### Modifier le design

Le tutoriel utilise le design system de Comptalyze :
- Fond : `#16181d`
- Bordures : `#2b2f36`
- Gradient : `linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)`
- Overlay : `rgba(0, 0, 0, 0.85)` avec `backdrop-filter: blur(4px)`

## 🧪 Test

### Tester le tutoriel

1. **Créez un nouveau compte** ou **supprimez** la métadonnée `onboarding_completed` :

```javascript
// Dans la console du navigateur (F12)
const { data } = await supabase.auth.getUser();
await supabase.auth.updateUser({
  data: {
    ...data.user.user_metadata,
    onboarding_completed: false
  }
});
// Rechargez la page
```

2. **Naviguez vers le dashboard** : `/dashboard`

3. **Vérifiez que le tutoriel s'affiche** avec les bonnes étapes selon votre plan

### Tester les différents plans

Pour tester les étapes Pro/Premium, modifiez votre plan :

```javascript
// Passer en Pro
await supabase.auth.updateUser({
  data: { is_pro: true }
});

// Passer en Premium
await supabase.auth.updateUser({
  data: { 
    is_pro: true,
    is_premium: true 
  }
});
```

## 🚀 Déploiement

Le tutoriel est automatiquement déployé avec l'application. Aucune configuration supplémentaire n'est nécessaire.

## 🔄 Réinitialisation pour un utilisateur

Si vous souhaitez qu'un utilisateur revoie le tutoriel :

1. Allez dans **Supabase Dashboard** > **Authentication** > **Users**
2. Cliquez sur l'utilisateur
3. Dans **User Metadata**, supprimez ou modifiez `onboarding_completed`
4. Sauvegardez

L'utilisateur verra à nouveau le tutoriel lors de sa prochaine connexion.

## 📊 Tableau récapitulatif des étapes

| Étape | ID | Plan Gratuit | Plan Pro | Plan Premium |
|-------|-----|-------------|----------|--------------|
| 1. Bienvenue | welcome | ✅ | ✅ | ✅ |
| 2. Aperçu | overview | ✅ | ✅ | ✅ |
| 3. Statistiques | stats-cards | ✅ | ✅ | ✅ |
| 4. Simulateur | calculator | ✅ | ✅ | ✅ |
| 5. Factures | invoices | ❌ | ✅ | ✅ |
| 6. Stats avancées | statistics | ❌ | ❌ | ✅ |
| 7. Navigation | navigation | ✅ | ✅ | ✅ |
| 8. C'est parti | complete | ✅ | ✅ | ✅ |
| **Total** | | **6 étapes** | **7 étapes** | **8 étapes** |

## 💡 Bonnes pratiques

1. **Gardez les descriptions courtes** : 2-3 phrases maximum par étape
2. **Utilisez des verbes d'action** : "Cliquez", "Explorez", "Découvrez"
3. **Testez le positionnement** : Vérifiez que les tooltips sont bien visibles
4. **Vérifiez la responsivité** : Le tutoriel doit fonctionner sur tous les écrans
5. **Adaptez au plan** : Les fonctionnalités premium doivent être clairement indiquées

## ❓ Dépannage

### Le tutoriel ne s'affiche pas

1. Vérifiez que `onboarding_completed !== true` dans les métadonnées utilisateur
2. Vérifiez la console du navigateur pour les erreurs
3. Vérifiez que les attributs `data-tutorial` sont bien présents sur les éléments

### Un élément n'est pas surligné

1. Vérifiez que l'attribut `data-tutorial` existe sur l'élément
2. Vérifiez le sélecteur CSS dans `targetSelector`
3. Attendez que le DOM soit chargé (le tutoriel attend 500ms)

### Les étapes ne correspondent pas au plan

1. Vérifiez que `getUserSubscription(user)` retourne les bonnes valeurs
2. Vérifiez les métadonnées `is_pro` et `is_premium` de l'utilisateur
3. Vérifiez les propriétés `requiresPro` et `requiresPremium` des étapes

## 🎉 Résultat

Avec ce système, chaque utilisateur bénéficie d'un tutoriel personnalisé qui :
- S'affiche automatiquement à la première utilisation
- S'adapte à son plan d'abonnement
- Guide de manière interactive vers les fonctionnalités clés
- Ne s'affiche qu'une seule fois (sauf réinitialisation)

