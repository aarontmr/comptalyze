/**
 * Mapping des articles liés pour le maillage interne SEO
 * Chaque article référence 3-5 articles connexes pour améliorer le SEO
 */

export interface RelatedArticleMap {
  [slug: string]: string[];
}

/**
 * Mapping sémantique des articles liés par clusters thématiques :
 * - Cluster URSSAF : déclaration, cotisations, calendrier
 * - Cluster Aides : ACRE
 * - Cluster Facturation : factures conformes
 */
export const relatedArticlesMap: RelatedArticleMap = {
  // Article sur la déclaration URSSAF
  'declaration-urssaf-micro-entrepreneur-2025': [
    'calculer-cotisations-urssaf-2025',
    'calendrier-fiscal-micro-entrepreneur-2025',
    'acre-2025-guide-complet',
    'facturation-micro-entrepreneur-2025',
  ],

  // Article sur le calcul des cotisations
  'calculer-cotisations-urssaf-2025': [
    'declaration-urssaf-micro-entrepreneur-2025',
    'acre-2025-guide-complet',
    'calendrier-fiscal-micro-entrepreneur-2025',
    'facturation-micro-entrepreneur-2025',
  ],

  // Article sur la facturation
  'facturation-micro-entrepreneur-2025': [
    'declaration-urssaf-micro-entrepreneur-2025',
    'calculer-cotisations-urssaf-2025',
    'calendrier-fiscal-micro-entrepreneur-2025',
    'acre-2025-guide-complet',
  ],

  // Article sur l'ACRE
  'acre-2025-guide-complet': [
    'calculer-cotisations-urssaf-2025',
    'declaration-urssaf-micro-entrepreneur-2025',
    'calendrier-fiscal-micro-entrepreneur-2025',
    'facturation-micro-entrepreneur-2025',
  ],

  // Article sur le calendrier fiscal
  'calendrier-fiscal-micro-entrepreneur-2025': [
    'declaration-urssaf-micro-entrepreneur-2025',
    'calculer-cotisations-urssaf-2025',
    'acre-2025-guide-complet',
    'facturation-micro-entrepreneur-2025',
  ],
};

/**
 * Récupère les slugs des articles liés pour un article donné
 * @param currentSlug Le slug de l'article actuel
 * @param limit Nombre maximum d'articles liés à retourner (par défaut 3)
 * @returns Liste des slugs des articles liés
 */
export function getRelatedArticleSlugs(
  currentSlug: string,
  limit: number = 3
): string[] {
  const related = relatedArticlesMap[currentSlug] || [];
  return related.slice(0, limit);
}

/**
 * Vérifie si deux articles sont liés
 * @param slug1 Premier article
 * @param slug2 Second article
 * @returns true si les articles sont liés
 */
export function areArticlesRelated(slug1: string, slug2: string): boolean {
  const relatedToSlug1 = relatedArticlesMap[slug1] || [];
  return relatedToSlug1.includes(slug2);
}


