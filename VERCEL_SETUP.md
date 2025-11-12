# 🚀 Configuration Vercel - Variables d'environnement

## ⚠️ Problème : Variables d'environnement manquantes sur Vercel

Si vous obtenez une erreur du type `STRIPE_PRICE_PRO n'est pas défini` sur Vercel, c'est que les variables d'environnement ne sont pas configurées dans le dashboard Vercel.

## ✅ Solution : Configurer les variables sur Vercel

### Étape 1 : Accéder aux paramètres du projet

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet **Comptalyze**

### Étape 2 : Ouvrir les Environment Variables

1. Cliquez sur l'onglet **Settings** (Paramètres)
2. Dans le menu de gauche, cliquez sur **Environment Variables**

### Étape 3 : Ajouter toutes les variables nécessaires

Ajoutez **TOUTES** ces variables une par une :

#### Variables Supabase
```
NEXT_PUBLIC_SUPABASE_URL
Valeur : https://votre-projet.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
Valeur : votre_cle_anon_ici
```

```
SUPABASE_SERVICE_ROLE_KEY
Valeur : votre_cle_service_role_ici
```

#### Variables Stripe
```
STRIPE_SECRET_KEY
Valeur : sk_live_... (ou sk_test_... pour les tests)
```

```
STRIPE_PRICE_PRO
Valeur : price_XXXXXXXXXXXX (votre Price ID Pro depuis Stripe)
```

```
STRIPE_PRICE_PREMIUM
Valeur : price_YYYYYYYYYYYY (votre Price ID Premium depuis Stripe)
```

```
STRIPE_WEBHOOK_SECRET
Valeur : whsec_... (secret du webhook Stripe)
```

#### Variables URL
```
NEXT_PUBLIC_APP_URL
Valeur : https://votre-domaine.vercel.app
```

```
NEXT_PUBLIC_BASE_URL
Valeur : https://votre-domaine.com (ou .vercel.app)
```

### Étape 4 : Configurer les environnements

Pour chaque variable, sélectionnez les environnements :
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

### Étape 5 : Sauvegarder

1. Cliquez sur **Save** pour chaque variable
2. **Important** : Après avoir ajouté toutes les variables, vous devez **redéployer** votre application

### Étape 6 : Redéployer

1. Allez dans l'onglet **Deployments**
2. Cliquez sur les **3 points** (...) du dernier déploiement
3. Cliquez sur **Redeploy**
4. Ou faites un nouveau commit et push sur GitHub (Vercel redéploiera automatiquement)

## 🔍 Vérifier que les variables sont bien configurées

1. Dans **Settings > Environment Variables**, vous devriez voir toutes les variables listées
2. Vérifiez que les valeurs sont correctes (pas d'espaces, pas de guillemets)
3. Vérifiez que les environnements sont bien sélectionnés

## ⚡ Astuce : Copier depuis .env.local

Si vous avez déjà un fichier `.env.local` avec toutes les variables, vous pouvez :

1. Ouvrir `.env.local` localement
2. Copier chaque variable et sa valeur
3. Les ajouter une par une dans Vercel

**Attention** : Ne copiez pas les lignes avec des commentaires (`#`), seulement les variables.

## 📝 Liste complète des variables à ajouter

Copiez-collez cette liste pour vérifier que vous avez tout :

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_PRICE_PRO`
- [ ] `STRIPE_PRICE_PREMIUM`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXT_PUBLIC_BASE_URL`

## 🆘 Si ça ne fonctionne toujours pas

1. **Vérifiez les logs Vercel** :
   - Allez dans **Deployments** > Cliquez sur le dernier déploiement
   - Regardez les **Function Logs** pour voir les erreurs

2. **Vérifiez que les variables sont bien nommées** :
   - Pas d'espaces avant/après le nom
   - Pas de guillemets autour des valeurs
   - Majuscules/minuscules exactes

3. **Redéployez après chaque modification** :
   - Vercel ne recharge pas automatiquement les variables d'environnement
   - Il faut redéployer après chaque ajout/modification

4. **Vérifiez que vous êtes sur le bon projet Vercel** :
   - Si vous avez plusieurs projets, assurez-vous d'être sur le bon

## ✅ Vérification finale

Une fois toutes les variables ajoutées et l'application redéployée :

1. Testez le bouton "Passer à Pro" sur votre site Vercel
2. L'erreur ne devrait plus apparaître
3. Vous devriez être redirigé vers Stripe Checkout

























