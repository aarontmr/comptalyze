# 📧 Aperçu de l'Email et du PDF

## 📨 Email que les clients reçoivent

**Sujet** : `[Comptalyze] Votre export PDF`

**Expéditeur** : `Comptalyze <no-reply@comptalyze.com>` (ou l'email configuré dans `COMPANY_FROM_EMAIL`)

**Contenu de l'email** :

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│          Export PDF Comptalyze                           │
│          (Titre en vert #00D084)                         │
│                                                           │
│  Bonjour,                                                │
│                                                           │
│  Vous trouverez ci-joint votre relevé Comptalyze       │
│  pour l'année 2024.                                      │
│                                                           │
│  Ce document contient tous vos enregistrements de      │
│  chiffre d'affaires avec les cotisations URSSAF          │
│  calculées.                                              │
│                                                           │
│                                                           │
│  Cordialement,                                           │
│  L'équipe Comptalyze                                      │
│                                                           │
│                                                           │
│  [Accéder à mon tableau de bord]                         │
│  (Lien en bleu #2E6CF6)                                  │
│                                                           │
└─────────────────────────────────────────────────────────┘

📎 Pièce jointe : comptalyze-export-2024.pdf
```

**Style visuel** :
- Fond blanc
- Texte en gris foncé (#333)
- Titre en vert Comptalyze (#00D084)
- Lien en bleu (#2E6CF6)
- Largeur maximale : 600px
- Police : Arial

---

## 📄 PDF que les clients reçoivent

### Page 1 - En-tête

```
┌─────────────────────────────────────────────────────────┐
│ ╔═════════════════════════════════════════════════════╗ │
│ ║  [Fond sombre #0e0f12 - Bande en haut de 100px]    ║ │
│ ║                                                       ║ │
│ ║  Comptalyze                    Relevé 2024          ║ │
│ ║  (Vert #00D084, 24pt)         (Blanc, 16pt)         ║ │
│ ╚═════════════════════════════════════════════════════╝ │
│                                                           │
│  Relevé Comptalyze – 2024                                │
│  (Bleu #2E6CF6, 18pt, gras)                              │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Mois    │ Activité        │ CA (€) │ Cotis. │ Net │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ Janvier │ Prestation svc  │ 5 000,00│ 1 060,00│3980│   │
│  │ Février │ Prestation svc  │ 6 500,00│ 1 378,00│5122│   │
│  │ Mars    │ Prestation svc  │ 7 200,00│ 1 526,40│5674│   │
│  │ Avril   │ Prestation svc  │ 5 800,00│ 1 229,60│4570│   │
│  │ Mai     │ Prestation svc  │ 8 000,00│ 1 696,00│6304│   │
│  │ Juin    │ Prestation svc  │ 7 500,00│ 1 590,00│5910│   │
│  ├─────────────────────────────────────────────────┤   │
│  │ TOTAL   │                  │39 000,00│ 8 479,00│30380│   │
│  │         │                  │         │         │(vert)│   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│                                                           │
│                                                           │
│                    Généré le 15/01/2025 • Comptalyze      │
│                    (Pied de page, gris, centré)          │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Structure du PDF

**Format** : A4 (210mm x 297mm)
**Marges** : 50px de chaque côté

**Éléments** :

1. **En-tête sombre** (haut de page, 100px de hauteur)
   - Fond : #0e0f12 (noir/gris très foncé)
   - "Comptalyze" : Vert #00D084, 24pt, gras
   - "Relevé [ANNÉE]" : Blanc, 16pt

2. **Titre principal** (sous l'en-tête)
   - "Relevé Comptalyze – [ANNÉE]"
   - Couleur : #2E6CF6 (bleu)
   - Taille : 18pt, gras

3. **Tableau des enregistrements**
   - **En-têtes** : Gras, 10pt, couleur #0e0f12
   - Colonnes :
     - **Mois** : Nom du mois en français (Janvier, Février, etc.)
     - **Activité** : Type d'activité (ex: "Prestation de services")
     - **CA (€)** : Chiffre d'affaires, aligné à droite
     - **Cotisations (€)** : Cotisations URSSAF, aligné à droite
     - **Net (€)** : Revenu net, aligné à droite
   - **Lignes** : Gris clair (#cccccc) pour séparer
   - **Données** : 9pt, couleur #333333

4. **Ligne de séparation** (avant les totaux)
   - Ligne horizontale grise

5. **Totaux** (dernière ligne)
   - "TOTAL" : Gras, 11pt, couleur #0e0f12
   - Total CA : Aligné à droite
   - Total Cotisations : Aligné à droite
   - **Total Net** : En vert #00D084 (couleur de la marque), aligné à droite

6. **Pied de page** (bas de page)
   - "Généré le [DATE] • Comptalyze"
   - Couleur : #999999 (gris clair)
   - Taille : 8pt
   - Centré

### Pagination automatique

Si le tableau est trop long :
- Une nouvelle page est créée automatiquement
- L'en-tête sombre n'est pas répété sur les pages suivantes
- Les totaux apparaissent toujours à la fin

### Format des nombres

- Format français : `1 234,56 €`
- Toujours 2 décimales
- Espace comme séparateur de milliers
- Virgule comme séparateur décimal

---

## 📊 Exemple de données dans le PDF

Si un client a enregistré ces données pour 2024 :

| Mois | Activité | CA | Cotisations | Net |
|------|----------|----|------------|-----|
| Janvier | Prestation de services | 5 000,00 € | 1 060,00 € | 3 940,00 € |
| Février | Prestation de services | 6 500,00 € | 1 378,00 € | 5 122,00 € |
| Mars | Prestation de services | 7 200,00 € | 1 526,40 € | 5 673,60 € |

**Le PDF affichera** :
```
TOTAL                           18 700,00 €    3 964,40 €    14 735,60 €
                                                           (en vert)
```

---

## 🎨 Couleurs utilisées

- **Vert Comptalyze** : #00D084 (pour le logo et le total net)
- **Bleu Comptalyze** : #2E6CF6 (pour le titre)
- **Fond sombre** : #0e0f12 (pour l'en-tête)
- **Texte** : #333333 (pour les données)
- **Séparateurs** : #cccccc (gris clair)
- **Pied de page** : #999999 (gris moyen)

---

## ✅ Points importants

1. **Format professionnel** : Le PDF est prêt pour impression ou archivage
2. **Données complètes** : Tous les enregistrements de l'année sélectionnée
3. **Totaux automatiques** : CA, cotisations et net calculés automatiquement
4. **Format français** : Dates et nombres au format français
5. **Identification claire** : Logo et nom de marque visibles
6. **Date de génération** : Le PDF indique quand il a été généré

---

## 📱 Ce que le client voit

1. **Dans sa boîte email** :
   - Un email propre et professionnel
   - Lien vers le dashboard
   - Pièce jointe PDF

2. **En ouvrant le PDF** :
   - Document A4 formatable
   - Tableau clair et lisible
   - Totaux mis en évidence
   - Design cohérent avec la marque Comptalyze

3. **Utilisation possible** :
   - Impression pour archivage
   - Envoi à un expert-comptable
   - Déclaration fiscale
   - Suivi personnel

---

## 🔄 Personnalisation possible

Si vous voulez améliorer le design, vous pouvez modifier :
- Les couleurs dans `app/api/export-pdf/route.ts`
- Le texte de l'email
- Ajouter un logo (si vous avez une image)
- Modifier la mise en page du tableau

Les modifications se font dans la fonction `generatePDF()` du fichier `app/api/export-pdf/route.ts`.













