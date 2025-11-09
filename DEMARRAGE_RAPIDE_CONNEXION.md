# ⚡ Démarrage Rapide : Résoudre "Failed to fetch"

## 🎯 Vous avez l'erreur "Failed to fetch" ? Voici la solution !

### 🔴 Si vous êtes UTILISATEUR de l'application

**L'application ne peut pas se connecter au serveur.**

#### Solution rapide (2 minutes) :

1. **Vérifiez votre connexion internet**
   - Ouvrez un navigateur et allez sur Google.com
   - Si ça ne marche pas → Reconnectez-vous au WiFi ou activez la 4G/5G

2. **Rechargez votre téléphone**
   - Votre batterie est à 14% - le mode économie d'énergie peut bloquer les connexions
   - Branchez votre téléphone et désactivez le mode économie

3. **Redémarrez l'application**
   - Fermez complètement Comptalyze (pas juste en arrière-plan)
   - Relancez-la
   - Réessayez de vous connecter

4. **Changez de réseau**
   - Si WiFi → Essayez en 4G/5G
   - Si 4G/5G → Essayez en WiFi
   - Certains réseaux d'entreprise/école bloquent l'accès

5. **En dernier recours : Videz le cache**
   - Android : Paramètres → Apps → Comptalyze → Stockage → Vider le cache
   - iOS : Désinstallez et réinstallez l'app

---

### 🟢 Si vous êtes DÉVELOPPEUR

**La configuration Supabase n'est probablement pas correcte.**

#### Solution rapide (5 minutes) :

**1️⃣ Lancez le diagnostic automatique :**

```bash
npm run check-connection
```

**2️⃣ Si le diagnostic trouve un problème, suivez les instructions affichées.**

**3️⃣ Problème le plus fréquent : Variables d'environnement vides**

Ouvrez `.env.local` et vérifiez :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

❌ Si elles sont **VIDES** :
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

🔧 **Comment les remplir :**

1. Allez sur [supabase.com](https://supabase.com)
2. Ouvrez votre projet
3. Cliquez sur **Settings** (⚙️) → **API**
4. Copiez :
   - **Project URL** → Collez après `NEXT_PUBLIC_SUPABASE_URL=`
   - **anon public key** → Collez après `NEXT_PUBLIC_SUPABASE_ANON_KEY=`

⚠️ **Important :** Pas d'espaces, pas de guillemets !

✅ **Exemple correct :**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Mzg5ODc2NTQsImV4cCI6MTk1NDU2MzY1NH0.xxxxx
```

**4️⃣ Redémarrez le serveur (OBLIGATOIRE) :**

```bash
# Appuyez sur Ctrl+C pour arrêter
npm run dev
```

Vous devriez voir :
```
✅ Supabase client initialisé avec succès
```

**5️⃣ Testez :**

Ouvrez `http://localhost:3000/login` et essayez de vous connecter.

---

## 📚 Guides détaillés

Si la solution rapide ne fonctionne pas :

- **Pour utilisateurs** : Voir [`GUIDE_DEBUG_CONNEXION_MOBILE.md`](./GUIDE_DEBUG_CONNEXION_MOBILE.md)
- **Pour développeurs** : Voir [`SOLUTION_FAILED_TO_FETCH.md`](./SOLUTION_FAILED_TO_FETCH.md)

---

## 🆘 Besoin d'aide ?

### Développeur :

```bash
# Partagez le résultat de cette commande (masquez les clés sensibles) :
npm run check-connection
```

### Utilisateur :

Contactez le support avec :
- Message d'erreur : "Failed to fetch"
- Votre email : `aaronthimeur@gmail.com`
- Type de téléphone et réseau utilisé
- Ce que vous avez déjà essayé

---

## ✅ Comment savoir si c'est résolu ?

Une fois le problème résolu, vous verrez :

1. Message "Connexion réussie..." en vert
2. Redirection automatique vers le dashboard
3. Votre tableau de bord s'affiche normalement

---

## 🔄 Messages d'erreur et solutions

| Vous voyez | Ça veut dire | Faites ça |
|------------|--------------|-----------|
| "Failed to fetch" | Pas de connexion au serveur | → Ce guide |
| "Email ou mot de passe incorrect" | Identifiants invalides | Vérifiez vos identifiants |
| "Veuillez confirmer votre email" | Email non vérifié | Vérifiez vos mails |
| "Problème de connexion réseau" | Internet coupé | Vérifiez votre connexion |

---

## 🎉 Modifications apportées

Pour résoudre votre problème, j'ai :

1. ✅ Amélioré la gestion d'erreur dans `app/login/page.tsx`
   - Messages plus clairs en français
   - Détection spécifique de "Failed to fetch"

2. ✅ Créé un script de diagnostic `npm run check-connection`
   - Vérifie automatiquement la configuration
   - Donne des solutions précises

3. ✅ Créé des guides détaillés
   - Pour utilisateurs
   - Pour développeurs

**La connexion devrait maintenant fonctionner ! 🚀**

