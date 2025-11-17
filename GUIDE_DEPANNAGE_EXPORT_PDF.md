# 🔧 Guide de Dépannage - Export PDF

## Erreurs courantes et solutions

### 1. "Service d'envoi d'email non configuré"

**Cause** : La variable `RESEND_API_KEY` n'est pas configurée.

**Solution** :
1. Créez un compte sur https://resend.com
2. Récupérez votre clé API dans Settings > API Keys
3. Ajoutez dans `.env.local` :
```env
RESEND_API_KEY=re_XXXXXXXXXXXX
```
4. Sur Vercel : Ajoutez dans Settings > Environment Variables
5. Redémarrez le serveur

---

### 2. "Token d'authentification manquant"

**Cause** : L'utilisateur n'est pas correctement authentifié.

**Solution** :
- Vérifiez que vous êtes bien connecté
- Déconnectez-vous et reconnectez-vous
- Videz le cache du navigateur

---

### 3. "Aucun enregistrement trouvé pour cette année"

**Cause** : Aucun enregistrement CA n'existe pour l'année sélectionnée.

**Solution** :
- Vérifiez que vous avez bien enregistré des calculs
- Sélectionnez une année pour laquelle vous avez des enregistrements
- L'année par défaut est l'année en cours

---

### 4. "Fonctionnalité réservée aux plans Pro et Premium"

**Cause** : Vous n'avez pas un abonnement Pro ou Premium.

**Solution** :
- Souscrivez à un plan Pro ou Premium depuis la page `/pricing`
- Vérifiez votre statut d'abonnement dans `/dashboard`

---

### 5. Erreur lors de la génération du PDF

**Cause** : Problème avec la bibliothèque PDFKit ou les données.

**Solutions** :
- Vérifiez que `pdfkit` est installé : `npm install pdfkit`
- Vérifiez que les enregistrements ont des valeurs valides (CA, cotisations, net)
- Consultez les logs serveur pour plus de détails

---

### 6. Erreur Resend (email non envoyé)

**Causes possibles** :
- Clé API Resend invalide ou expirée
- Email de destination invalide
- Domaine non vérifié dans Resend
- Quota Resend dépassé

**Solutions** :
1. Vérifiez votre clé API dans Resend Dashboard
2. Vérifiez que votre email est valide
3. Vérifiez votre quota dans Resend (plan gratuit : 100 emails/jour)
4. Vérifiez que le domaine "from" est vérifié dans Resend (si vous utilisez un domaine personnalisé)

---

### 7. "Erreur: Le serveur a renvoyé une réponse inattendue"

**Cause** : Le serveur renvoie du HTML au lieu de JSON (erreur de page).

**Solution** :
- Vérifiez les logs serveur pour voir l'erreur exacte
- Vérifiez que toutes les variables d'environnement sont configurées
- Vérifiez que le serveur est bien démarré

---

## Vérification de la configuration

### Variables d'environnement requises

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Resend (pour l'envoi d'email)
RESEND_API_KEY=re_...
COMPANY_FROM_EMAIL=Comptalyze <no-reply@comptalyze.com>

# Base URL
NEXT_PUBLIC_BASE_URL=https://comptalyze.com
```

### Test rapide

1. Vérifiez que vous êtes connecté
2. Vérifiez que vous avez un plan Pro ou Premium
3. Vérifiez que vous avez au moins un enregistrement CA
4. Cliquez sur "Exporter en PDF"
5. Vérifiez votre boîte email (et les spams)

---

## Logs de débogage

Pour voir les erreurs détaillées :

1. **En développement local** : Consultez la console du terminal où tourne `npm run dev`
2. **Sur Vercel** : Allez dans votre projet > Functions > Logs

Les erreurs sont loggées avec `console.error()` pour faciliter le débogage.

---

## Support

Si le problème persiste :
1. Vérifiez tous les points ci-dessus
2. Consultez les logs serveur
3. Vérifiez que toutes les dépendances sont installées : `npm install`
4. Contactez le support avec les logs d'erreur


































