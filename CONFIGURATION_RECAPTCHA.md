# Configuration reCAPTCHA pour l'inscription sécurisée

## 📋 Vue d'ensemble

Le formulaire d'inscription utilise **Google reCAPTCHA v3** pour protéger contre les bots et les inscriptions automatisées.

## 🔑 Obtenir vos clés reCAPTCHA

1. **Accédez à la console reCAPTCHA :**
   - Rendez-vous sur : https://www.google.com/recaptcha/admin

2. **Créez un nouveau site :**
   - Cliquez sur "+" (Ajouter un site)
   - **Libellé** : Nom de votre application (ex: "Comptalyze")
   - **Type reCAPTCHA** : Sélectionnez **reCAPTCHA v3**
   - **Domaines** : Ajoutez vos domaines
     - Pour développement : `localhost`
     - Pour production : `votredomaine.com`

3. **Récupérez vos clés :**
   - **Clé du site** (Site Key) : Clé publique utilisée dans le frontend
   - **Clé secrète** (Secret Key) : Clé privée utilisée dans le backend

## ⚙️ Configuration dans votre projet

### 1. Variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# Google reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=votre_cle_publique_recaptcha
RECAPTCHA_SECRET_KEY=votre_cle_secrete_recaptcha
```

**Important :**
- ✅ `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` : Préfixe `NEXT_PUBLIC_` nécessaire (exposée au client)
- ✅ `RECAPTCHA_SECRET_KEY` : PAS de préfixe (reste côté serveur uniquement)

### 2. Redémarrer le serveur

Après avoir ajouté les variables, redémarrez votre serveur de développement :

```bash
npm run dev
```

## 🧪 Test en développement

### Sans reCAPTCHA configuré

Si les clés ne sont pas configurées :
- ⚠️ Un avertissement sera affiché dans la console
- ✅ L'inscription fonctionnera quand même en mode développement
- ❌ **NE PAS déployer en production sans reCAPTCHA !**

### Avec reCAPTCHA configuré

1. Ouvrez la page d'inscription
2. Remplissez le formulaire
3. Vérifiez dans la console développeur :
   - Le badge reCAPTCHA doit apparaître en bas à droite
   - Aucune erreur reCAPTCHA ne doit être affichée

## 🔒 Fonctionnement de la sécurité

### Flux d'inscription sécurisé

1. **Client (Frontend)** :
   - L'utilisateur remplit le formulaire
   - Validation des champs (email, mot de passe, CGV)
   - reCAPTCHA génère un token invisible
   
2. **Serveur (Backend)** :
   - Reçoit le token reCAPTCHA
   - Vérifie le token avec l'API Google
   - Vérifie le score (v3) ou la validité (v2)
   - Accepte ou refuse l'inscription

3. **Protection contre** :
   - ✅ Bots automatisés
   - ✅ Inscriptions massives
   - ✅ Attaques par force brute
   - ✅ Trafic suspect

## 📊 Scores reCAPTCHA v3

Le score reCAPTCHA v3 va de **0.0** à **1.0** :

- **0.9 - 1.0** : Très probablement humain ✅
- **0.7 - 0.8** : Probablement humain ✅
- **0.5 - 0.6** : Neutre ⚠️
- **0.0 - 0.4** : Probablement bot ❌

**Configuration actuelle :**
- Seuil minimum : **0.5**
- Les scores < 0.5 sont rejetés

## 🛠️ Dépannage

### Le badge reCAPTCHA n'apparaît pas

```bash
# Vérifiez dans la console :
console.log(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)
```

- Si `undefined` : Vérifiez le préfixe `NEXT_PUBLIC_`
- Si présent : Vérifiez que le domaine est autorisé

### Erreur "Invalid site key"

- ❌ Mauvaise clé publique
- ✅ Vérifiez la clé dans la console Google reCAPTCHA

### Erreur "Verification failed"

- ❌ Mauvaise clé secrète côté serveur
- ✅ Vérifiez `RECAPTCHA_SECRET_KEY` (sans préfixe)

### Score trop faible en développement

Si vous testez beaucoup :
- Le score peut baisser temporairement
- Utilisez une navigation privée
- Attendez quelques minutes

## 🚀 Déploiement en production

### Avant de déployer

1. **Vérifiez les domaines dans reCAPTCHA Admin :**
   ```
   ✅ votredomaine.com
   ✅ www.votredomaine.com
   ```

2. **Variables d'environnement Vercel/Production :**
   - Ajoutez les deux clés dans les paramètres
   - Redéployez l'application

3. **Testez sur le domaine de production :**
   - Créez un compte test
   - Vérifiez les logs serveur

### Monitoring

Dans la console reCAPTCHA Admin, vous pouvez :
- 📊 Voir le nombre de requêtes
- 📈 Analyser les scores
- 🚨 Détecter les attaques

## 📝 Alternative : hCaptcha

Si vous préférez hCaptcha à reCAPTCHA :

1. Inscrivez-vous sur : https://www.hcaptcha.com/
2. Modifiez le code pour utiliser hCaptcha
3. Remplacez les variables :
   ```bash
   NEXT_PUBLIC_HCAPTCHA_SITE_KEY=...
   HCAPTCHA_SECRET_KEY=...
   ```

## 🆘 Support

- Documentation Google reCAPTCHA : https://developers.google.com/recaptcha/docs/v3
- FAQ reCAPTCHA : https://developers.google.com/recaptcha/docs/faq
- Console Admin : https://www.google.com/recaptcha/admin

---

**✅ Configuration terminée !** Votre formulaire d'inscription est maintenant sécurisé contre les bots.














