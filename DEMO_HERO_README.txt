═══════════════════════════════════════════════════════════════════
  DÉMO HERO COMPTALYZE - Installation & Usage
═══════════════════════════════════════════════════════════════════

📁 FICHIERS CRÉÉS
─────────────────

demo/
  ├── hero-preview.html           Page de démo autonome (animations CSS/JS)
  ├── README.md                   Documentation technique complète
  └── integration-examples.html   7 exemples d'intégration copy-paste

scripts/
  ├── config.json                 Configuration (durée, couleurs, tailles)
  ├── render-preview.mjs          Enregistrement avec Puppeteer
  ├── trim-and-gif.mjs            Variante depuis vidéo existante
  ├── optimize-gif.mjs            Optimisation GIF (gifsicle)
  └── check-demo-deps.mjs         Vérification dépendances

docs/
  ├── QUICKSTART_DEMO.md          Démarrage rapide (5 min)
  ├── GUIDE_DEMO_HERO.md          Guide complet + troubleshooting
  └── DEMO_COMPLETE.md            Documentation exhaustive

package.json
  ✅ Ajout de 5 nouvelles commandes npm
  ✅ Ajout de puppeteer + mime-types

.gitignore
  ✅ Exclusion des fichiers générés (MP4, GIF, etc.)

═══════════════════════════════════════════════════════════════════
  ⚡ DÉMARRAGE RAPIDE
═══════════════════════════════════════════════════════════════════

1️⃣  INSTALLER FFMPEG (une seule fois)
   
   Windows :  choco install ffmpeg
   macOS   :  brew install ffmpeg
   Linux   :  sudo apt install ffmpeg

2️⃣  INSTALLER LES DÉPENDANCES NPM

   npm install

3️⃣  VÉRIFIER QUE TOUT EST PRÊT

   npm run check-demo

4️⃣  GÉNÉRER LA DÉMO

   npm run demo:build

5️⃣  RÉSULTAT

   ✅ public/hero-demo.mp4  (6-8 Mo, 1280×720)
   ✅ public/hero-demo.gif  (1.5-2 Mo, optimisé)

═══════════════════════════════════════════════════════════════════
  📦 COMMANDES NPM
═══════════════════════════════════════════════════════════════════

npm run check-demo              Vérifier les dépendances
npm run demo:record             Enregistrer (sans optimiser)
npm run demo:optimize           Optimiser un GIF existant
npm run demo:build              ✨ Tout générer (recommandé)
npm run demo:fromRaw <fichier>  Depuis une vidéo existante

═══════════════════════════════════════════════════════════════════
  🎨 PRÉVISUALISER
═══════════════════════════════════════════════════════════════════

npx serve .
→ http://localhost:3000/demo/hero-preview.html

═══════════════════════════════════════════════════════════════════
  🔧 INTÉGRATION (copier-coller)
═══════════════════════════════════════════════════════════════════

<video
  className="w-full rounded-2xl shadow-2xl"
  autoPlay
  muted
  loop
  playsInline
  aria-label="Démo de Comptalyze"
>
  <source src="/hero-demo.mp4" type="video/mp4" />
</video>

Plus d'exemples : demo/integration-examples.html

═══════════════════════════════════════════════════════════════════
  ⚙️  PERSONNALISER
═══════════════════════════════════════════════════════════════════

Couleur     : scripts/config.json → "primaryColor"
Durée       : scripts/config.json → "durationSec"
Textes      : demo/hero-preview.html (lignes 93-155)
Animations  : demo/hero-preview.html (script JS ligne 177+)

═══════════════════════════════════════════════════════════════════
  📚 DOCUMENTATION
═══════════════════════════════════════════════════════════════════

Débutant    →  QUICKSTART_DEMO.md
Complet     →  GUIDE_DEMO_HERO.md
Technique   →  DEMO_COMPLETE.md
Exemples    →  demo/integration-examples.html

═══════════════════════════════════════════════════════════════════
  🐛 PROBLÈME ?
═══════════════════════════════════════════════════════════════════

1. Exécuter : npm run check-demo
2. Lire les logs dans la console
3. Consulter : GUIDE_DEMO_HERO.md section "Dépannage"

═══════════════════════════════════════════════════════════════════

✨ Prêt en 3 commandes :
   1. npm install
   2. npm run check-demo
   3. npm run demo:build

═══════════════════════════════════════════════════════════════════




























