# 📧 Guide de Configuration de l'Email de Vérification Personnalisé

## Vue d'ensemble

Comptalyze utilise un email de vérification personnalisé pour l'inscription, avec un design professionnel qui correspond à la marque.

## ⚠️ IMPORTANT : Réactiver "Confirm email"

Si vous avez désactivé "Confirm email" dans Supabase, **réactivez-le** et utilisez le template personnalisé comme expliqué ci-dessous.

## Configuration requise

### Option recommandée : Utiliser le template Supabase personnalisé

Pour utiliser le template HTML personnalisé Comptalyze directement dans Supabase :

1. Consultez le guide détaillé : **`GUIDE_SUPABASE_TEMPLATE.md`**
2. Copiez le contenu du fichier **`SUPABASE_EMAIL_TEMPLATE.html`**
3. Collez-le dans Supabase Dashboard > **Authentication** > **Email Templates** > **Confirm signup**

### Alternative : Désactiver l'email automatique de Supabase

Pour que les utilisateurs reçoivent uniquement notre email personnalisé (via Resend) :

### 2. Configuration dans Supabase Dashboard

**Option A - Désactiver l'email Supabase** :
- Dans **Authentication** > **Settings** > **Auth**
- Désactivez **"Enable email confirmations"** OU
- Modifiez le template pour qu'il soit vide (mais Supabase enverra quand même un email basique)

**Option B - Utiliser un webhook Supabase** :
- Créez un webhook qui intercepte l'événement `user.created`
- Le webhook appelle notre endpoint `/api/send-verification-email`
- Cela permet d'avoir un contrôle total sur l'envoi

### 3. Configuration des variables d'environnement

Assurez-vous que ces variables sont configurées :

```env
RESEND_API_KEY=re_votre_cle_api
COMPANY_FROM_EMAIL="Comptalyze <onboarding@resend.dev>"
NEXT_PUBLIC_BASE_URL=https://comptalyze.com
```

## Fonctionnement actuel

L'endpoint `/api/send-verification-email` :
1. Génère un lien de vérification via l'API Admin de Supabase
2. Envoie un email personnalisé via Resend avec :
   - Design professionnel avec gradient Comptalyze
   - Message de bienvenue personnalisé
   - Bouton CTA pour vérifier l'email
   - Lien de secours si le bouton ne fonctionne pas
   - Mention URSSAF officielle

## Test

Pour tester l'email de vérification :
1. Inscrivez-vous avec un nouvel email
2. Vérifiez votre boîte email
3. Vous devriez recevoir l'email personnalisé de Comptalyze

## Note importante

Si vous voyez toujours l'email par défaut de Supabase, cela signifie que :
- L'email automatique de Supabase n'est pas désactivé
- Les deux emails sont envoyés (Supabase + notre email personnalisé)

Pour utiliser uniquement notre email personnalisé, suivez l'**Option A** ci-dessus.

