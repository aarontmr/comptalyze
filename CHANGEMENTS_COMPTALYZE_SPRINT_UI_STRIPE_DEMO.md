## Synthèse des changements (Animations, UX, Freemium, Stripe, Démo)

- **Animations & micro‑interactions**
  - Consolidation des animations avec `FadeIn`, `Stagger`, `ScaleOnHover` (Framer Motion) sur la landing, le pricing et plusieurs cartes de dashboard.
  - Respect de `prefers-reduced-motion` dans les composants d’animation pour l’accessibilité.

- **Landing & parcours de conversion**
  - Hero clarifié : promesse en une phrase, CTA principal **« Créer un compte gratuit »** (sans carte) et CTA secondaire orienté démo.
  - Mise en avant du calculateur URSSAF en démo publique, app previews, features et sections éducatives alignées avec les vraies fonctionnalités (URSSAF, TVA, factures, exports, IA, calendrier).
  - Suppression de la section « Évolution continue » jugée non essentielle pour la conversion.

- **Mode démo**
  - Bandeau explicite **Mode démo – données fictives** dans `UrssafCalculatorDemo` (aucune donnée réelle, rien n’est sauvegardé).
  - Nouvelle page `/demo` permettant de tester le calculateur URSSAF, voir un aperçu de dashboard et une facture exemple, avec CTA vers inscription/pricing.

- **Dashboard UX & freemium**
  - Ajout de `Breadcrumbs` et d’en-têtes cohérents (ex. `Calcul URSSAF`, `Export comptable`, `Charges déductibles`).
  - Pour les utilisateurs Free :
    - Pages `factures`, `export` et `charges` affichent désormais des **préviews de fonctionnalités verrouillées** (via `FeaturePreview` + `PlanBadge`) avec CTA d’upgrade Pro/Premium.
  - Pour Pro/Premium :
    - Pages enrichies en états vides plus parlants et actions principales claires (Créer une facture, Ajouter une charge, lancer un export).

- **Parcours freemium & pricing**
  - CTA et textes harmonisés : **« Créer un compte gratuit »**, **« Passer à Pro »**, **« Passer à Premium »**.
  - Section de **comparaison des plans** ajoutée sur la page `pricing` (Free / Pro / Premium) avec la liste des fonctionnalités clés.
  - Rappel explicite : Free = 3 simulations URSSAF sans carte; Pro/Premium = simulations illimitées, TVA, factures, exports, IA, calendrier, alertes.

- **Stripe – flux de paiement intégré**
  - Tous les boutons d’upgrade (landing, pricing, dashboard, `SubscriptionButtons`, `PlanGate`, etc.) redirigent vers le nouveau flux `/checkout/[plan]` (mensuel/annuel).
  - Conservation de la logique existante côté backend et webhooks ; aucune modification des env vars ni des tables Stripe/Supabase.
  - Les plans annuels gèrent toujours l’option de **renouvellement automatique** via la case à cocher en checkout.

- **Responsive & polish**
  - Vérifications manuelles des principaux breakpoints (mobile, tablette, desktop) sur landing, pricing, dashboard et page de checkout.
  - Ajustements mineurs sur les grilles, overflows de tables (scroll horizontal) et alignement des CTA.
  - Validation lint sur les fichiers modifiés, pas d’introduction de nouveaux `any` ni de régressions TypeScript.












