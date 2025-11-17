# 🎁 Guide du Système de Parrainage Comptalyze

## Vue d'ensemble

Le système de parrainage permet aux utilisateurs de gagner des récompenses en invitant leurs amis, collègues ou connaissances à rejoindre Comptalyze.

## Comment ça fonctionne ?

### 1. Génération du code de parrainage

Chaque utilisateur a automatiquement un code de parrainage unique généré dans `/dashboard/referrals` :
- Format : `COMPTALYZE-XXXXXXXX` (où XXXX sont les 8 premiers caractères de l'ID utilisateur)
- Le code est créé automatiquement lors de la première visite de la page parrainage
- Le code est unique et permanent pour chaque utilisateur

### 2. Partage du lien de parrainage

Dans `/dashboard/referrals`, l'utilisateur peut :
- Voir son code de parrainage unique
- Copier le lien de parrainage en un clic : `https://comptalyze.com/signup?ref=COMPTALYZE-XXXXXXXX`
- Le lien contient automatiquement le code de parrainage dans l'URL

### 3. Inscription avec code de parrainage

Quand quelqu'un utilise le lien de parrainage :

1. **Capture automatique** : Le code est automatiquement détecté depuis l'URL (`?ref=...`)
2. **Stockage** : Le code est stocké dans le localStorage pour être conservé même après redirection
3. **Affichage** : Un message vert s'affiche sur la page d'inscription : "🎁 Code de parrainage détecté !"
4. **Application** : Lors de l'inscription, le code est :
   - Stocké dans les métadonnées utilisateur (`user_metadata.referral_code`)
   - Envoyé à l'API `/api/referrals/apply` pour créer l'enregistrement de parrainage
   - Le statut est mis à "pending" (en attente)

### 4. Attribution des récompenses

La récompense est attribuée automatiquement quand le filleul s'abonne à un plan payant :

1. **Déclenchement** : Quand le webhook Stripe reçoit `checkout.session.completed` ou `invoice.payment_succeeded`
2. **Vérification** : Le système cherche un parrainage en attente pour cet utilisateur
3. **Calcul** : La récompense est calculée selon le plan :
   - **Pro** : 0,39€ (10% de 3,90€)
   - **Premium** : 0,79€ (10% de 7,90€)
4. **Mise à jour** : Le parrainage est mis à jour :
   - `status` : "pending" → "completed"
   - `reward_type` : "credit"
   - `reward_amount` : montant calculé
   - `completed_at` : date de complétion

## Structure de la base de données

Table `referrals` :
```sql
- id (UUID) : Identifiant unique
- referrer_id (UUID) : ID du parrain (celui qui invite)
- referred_id (UUID) : ID du filleul (celui qui s'inscrit)
- referral_code (TEXT) : Code de parrainage unique
- status (TEXT) : 'pending', 'completed', 'rewarded'
- reward_type (TEXT) : 'credit', 'discount'
- reward_amount (NUMERIC) : Montant de la récompense
- created_at (TIMESTAMPTZ) : Date de création
- completed_at (TIMESTAMPTZ) : Date de complétion
```

## Flux complet

```
1. Utilisateur A va sur /dashboard/referrals
   → Code généré : COMPTALYZE-ABC12345

2. Utilisateur A copie le lien : 
   https://comptalyze.com/signup?ref=COMPTALYZE-ABC12345

3. Utilisateur A partage le lien avec Utilisateur B

4. Utilisateur B clique sur le lien
   → Page signup s'ouvre avec ?ref=COMPTALYZE-ABC12345
   → Message affiché : "Code de parrainage détecté !"

5. Utilisateur B s'inscrit
   → Code stocké dans user_metadata
   → API /api/referrals/apply appelée
   → Enregistrement créé : referrer_id = A, referred_id = B, status = 'pending'

6. Utilisateur B s'abonne à Pro ou Premium
   → Webhook Stripe déclenché
   → Fonction processReferralReward() appelée
   → Parrainage mis à jour : status = 'completed', reward_amount = 0.39€ ou 0.79€

7. Utilisateur A voit la récompense dans /dashboard/referrals
   → Statistiques mises à jour
   → Historique affiche le parrainage complété
```

## Personnalisation des récompenses

Pour modifier les montants de récompense, éditez `app/api/stripe/webhook/route.ts` :

```typescript
const rewardAmounts: Record<'pro' | 'premium', number> = {
  pro: 0.39,    // Modifiez ici
  premium: 0.79, // Modifiez ici
};
```

## Points importants

1. **Auto-parrainage impossible** : Un utilisateur ne peut pas utiliser son propre code
2. **Un code = un parrainage** : Si un utilisateur utilise déjà un code, il ne peut pas en utiliser un autre
3. **Récompense unique** : La récompense n'est attribuée qu'une seule fois, au premier abonnement
4. **Non-bloquant** : Les erreurs de parrainage n'empêchent pas l'inscription ou l'abonnement

## Vérification

Pour vérifier que tout fonctionne :

1. Créez un compte test A
2. Allez sur `/dashboard/referrals` et copiez le lien
3. Ouvrez le lien dans un navigateur privé (compte test B)
4. Inscrivez-vous avec le compte B
5. Vérifiez que le message de parrainage s'affiche
6. Abonnez le compte B à Pro ou Premium
7. Vérifiez dans `/dashboard/referrals` du compte A que le parrainage est "Complété"

## API Endpoints

### POST `/api/referrals/apply`
Applique un code de parrainage lors de l'inscription.

**Body** :
```json
{
  "userId": "uuid",
  "referralCode": "COMPTALYZE-XXXXXXXX"
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Code de parrainage appliqué avec succès"
}
```

