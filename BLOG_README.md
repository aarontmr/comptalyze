# Blog Comptalyze - Documentation

## Architecture

Le blog utilise **Next.js 16 avec MDX** pour créer des articles optimisés pour le SEO et les performances.

### Structure des fichiers

```
├── app/blog/
│   ├── [slug]/
│   │   ├── page.tsx          # Page dynamique pour chaque article
│   │   └── not-found.tsx     # Page 404 personnalisée
│   ├── layout.tsx            # Layout commun
│   └── page.tsx              # Liste des articles
├── content/blog/
│   └── *.mdx                 # Articles en MDX
├── app/components/
│   └── TableOfContents.tsx   # Sommaire sticky
├── lib/
│   └── mdx-utils.ts          # Utilitaires MDX
└── mdx-components.tsx        # Styles des composants MDX
```

## Fonctionnalités

### ✅ MDX avec support complet
- Markdown étendu avec composants React
- Plugins : remark-gfm, rehype-slug, rehype-autolink-headings
- Styles personnalisés pour chaque élément

### ✅ Table des matières (TOC)
- Extraction automatique des H2 et H3
- Navigation smooth scroll
- Sticky sur desktop (disparaît sur mobile)
- Surlignage de la section active

### ✅ SEO Optimisé
- Métadonnées dynamiques par article
- Structured Data (Schema.org Article)
- FAQ Structured Data pour les articles concernés
- Sitemap.xml mis à jour
- Open Graph et Twitter Cards

### ✅ Performance
- Pages statiques générées au build (SSG)
- Code splitting automatique
- Images optimisées
- Lazy loading des composants

## Créer un nouvel article

### 1. Créer le fichier MDX

Créez un fichier dans `content/blog/` :

```mdx
---
title: "Titre de l'article"
description: "Description pour le SEO (150-160 caractères)"
category: "Catégorie"
readTime: "X min"
date: "2025-01-15"
keywords: ["mot-clé 1", "mot-clé 2", "mot-clé 3"]
author: "Comptalyze"
---

Votre contenu ici...

## Section H2

### Sous-section H3

Texte avec **gras** et *italique*.

<div style={{ padding: '2rem', background: 'linear-gradient(...)' }}>
  Composant personnalisé
</div>
```

### 2. Ajouter l'article à la liste

Mettez à jour `app/blog/page.tsx` pour inclure le nouvel article dans la liste.

### 3. Mettre à jour le sitemap

Ajoutez l'URL dans `sitemap.xml` :

```xml
<url>
  <loc>https://comptalyze.com/blog/votre-slug</loc>
  <lastmod>2025-11-07</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

### 4. Build et test

```bash
npm run build
npm run start
```

## Composants disponibles dans MDX

### Liens internes
```mdx
[Voir les tarifs](/pricing)
```

### Call-to-Action personnalisé
```mdx
<div style={{
  marginTop: '3rem',
  padding: '2rem',
  borderRadius: '1rem',
  background: 'linear-gradient(135deg, rgba(0, 208, 132, 0.1) 0%, rgba(46, 108, 246, 0.1) 100%)',
  border: '1px solid rgba(0, 208, 132, 0.3)',
  textAlign: 'center'
}}>
  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
    Titre du CTA
  </h3>
  <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
    Description
  </p>
  <a
    href="/signup"
    style={{
      display: 'inline-block',
      padding: '1rem 2rem',
      borderRadius: '0.75rem',
      background: 'linear-gradient(135deg, #00D084, #2E6CF6)',
      color: 'white',
      fontWeight: 600,
      textDecoration: 'none',
      boxShadow: '0 4px 20px rgba(0, 208, 132, 0.3)'
    }}
  >
    Texte du bouton
  </a>
</div>
```

### Citations
```mdx
> **Conseil** : Texte de la citation
```

### Code
```mdx
`code inline`

\`\`\`javascript
// Bloc de code
const example = "Hello";
\`\`\`
```

## Optimisations SEO

### Métadonnées essentielles
- ✅ Title unique (50-60 caractères)
- ✅ Description (150-160 caractères)
- ✅ Keywords pertinents
- ✅ Open Graph (Facebook, LinkedIn)
- ✅ Twitter Cards
- ✅ Canonical URL

### Structured Data
- ✅ Schema.org Article
- ✅ Author et Publisher
- ✅ DatePublished et DateModified
- ✅ FAQ (si applicable)

### Performance Lighthouse
- ✅ SSG (Static Site Generation)
- ✅ Lazy loading
- ✅ Code splitting
- ✅ Images optimisées
- ✅ CSS minimal
- ✅ Pas de JavaScript bloquant

**Objectif** : Score Lighthouse > 90 en Performance, SEO, Accessibility, Best Practices

## Liens internes stratégiques

Chaque article doit contenir **au moins 2 CTA** vers :
1. `/signup` - Inscription gratuite
2. `/pricing` - Tarifs

Exemple dans l'article URSSAF :
- CTA 1 : Après la section calculs → "Calculez automatiquement"
- CTA 2 : En fin d'article → "Gérez votre micro-entreprise"

## Maintenance

### Mettre à jour un article
1. Modifiez le fichier `.mdx`
2. Changez la date `dateModified` dans le structured data si nécessaire
3. Rebuild : `npm run build`

### Supprimer un article
1. Supprimez le fichier `.mdx`
2. Retirez l'entrée de `app/blog/page.tsx`
3. Retirez l'URL du `sitemap.xml`
4. Rebuild

## Bonnes pratiques

### Contenu
- ✅ Titres H2/H3 clairs et descriptifs
- ✅ Paragraphes courts (3-4 lignes max)
- ✅ Listes à puces pour la lisibilité
- ✅ Exemples concrets et chiffres
- ✅ Liens internes pertinents
- ✅ FAQ pour les questions fréquentes

### SEO
- ✅ URL courte et descriptive (slug)
- ✅ Mot-clé principal dans le titre H1
- ✅ Mots-clés secondaires dans les H2
- ✅ Images avec alt text (si applicable)
- ✅ Liens externes vers sources fiables

### UX
- ✅ Temps de lecture indiqué
- ✅ Sommaire pour navigation rapide
- ✅ CTA bien visibles
- ✅ Design cohérent avec la marque
- ✅ Responsive (mobile-first)

## Article de référence : Déclaration URSSAF 2025

L'article **"Déclaration URSSAF Micro-Entrepreneur 2025"** est un exemple complet incluant :
- 12 sections H2 avec sous-sections H3
- Sommaire auto-généré avec 20+ entrées
- FAQ intégrée avec 10 questions
- 2 CTA stratégiquement placés
- Structured Data Article + FAQPage
- Exemples de calculs concrets
- Liens vers signup et pricing

**URL** : `/blog/declaration-urssaf-micro-entrepreneur-2025`

## Support

Pour toute question sur le système de blog :
- Consultez `mdx-components.tsx` pour les styles
- Consultez `lib/mdx-utils.ts` pour les utilitaires
- Consultez `app/blog/[slug]/page.tsx` pour le rendu

## Checklist avant publication

- [ ] Métadonnées complètes (title, description, keywords)
- [ ] Date correcte
- [ ] Au moins 2 CTA vers signup/pricing
- [ ] Liens internes pertinents
- [ ] Structured Data ajouté si FAQ
- [ ] Sitemap mis à jour
- [ ] Liste blog mise à jour
- [ ] Test en local (npm run dev)
- [ ] Build réussi (npm run build)
- [ ] Lighthouse > 90 sur tous les scores

