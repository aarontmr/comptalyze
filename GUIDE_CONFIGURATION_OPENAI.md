# 🤖 Guide de Configuration OpenAI pour le Chatbot

## ✅ Oui, ça fonctionnera !

Si vous configurez votre clé OpenAI dans les variables d'environnement, **tous vos clients Premium** pourront utiliser le chatbot avec des réponses IA avancées.

## 📝 Configuration Locale (Développement)

1. **Créez un fichier `.env.local`** à la racine du projet (s'il n'existe pas déjà)

2. **Ajoutez votre clé OpenAI** :
```env
OPENAI_API_KEY=sk-votre_cle_openai_ici
```

3. **Redémarrez le serveur de développement** :
```bash
npm run dev
```

## 🚀 Configuration Production (Vercel)

1. **Allez sur votre dashboard Vercel** : https://vercel.com/dashboard

2. **Sélectionnez votre projet Comptalyze**

3. **Allez dans Settings > Environment Variables**

4. **Ajoutez la variable** :
   - **Name** : `OPENAI_API_KEY`
   - **Value** : `sk-votre_cle_openai_ici`
   - **Environments** : ✅ Production, ✅ Preview, ✅ Development (selon vos besoins)

5. **Cliquez sur "Save"**

6. **Redéployez votre application** (ou attendez le prochain déploiement)

## 🔍 Vérification

Une fois configuré, le chatbot :
- ✅ Utilisera **GPT-4o-mini** pour des réponses intelligentes
- ✅ Aura accès aux **données CA** de chaque client pour des conseils personnalisés
- ✅ Maintiendra le **contexte de conversation** (10 derniers messages)
- ✅ Basculera automatiquement sur le **fallback** si OpenAI est indisponible

## 💰 Coûts OpenAI

Le chatbot utilise **GPT-4o-mini** qui est :
- ✅ **Très économique** (environ $0.15 par million de tokens d'entrée)
- ✅ **Rapide** (réponses en quelques secondes)
- ✅ **Efficace** pour les questions spécialisées

**Estimation** : Avec 1000 messages/mois, le coût serait d'environ **$0.50-2.00/mois** selon la longueur des conversations.

## 🔒 Sécurité

- La clé OpenAI est stockée côté **serveur uniquement** (jamais exposée au client)
- Chaque appel est **authentifié** (vérification du token utilisateur)
- Seuls les utilisateurs **Premium** peuvent utiliser le chatbot
- Les données CA sont **isolées par utilisateur** (RLS Supabase)

## 🎯 Fonctionnement

1. Client Premium pose une question dans le chatbot
2. Le serveur vérifie l'authentification et le plan
3. Le serveur récupère les 12 derniers enregistrements CA du client
4. Le serveur envoie à OpenAI avec :
   - Le contexte des données CA
   - L'historique de conversation
   - Le message actuel
5. OpenAI génère une réponse personnalisée
6. La réponse est renvoyée au client

## ⚠️ En cas d'erreur

Si OpenAI est indisponible ou si une erreur se produit :
- Le système bascule automatiquement sur le **mode fallback**
- Les réponses utilisent vos données CA enregistrées
- Le chatbot reste fonctionnel avec des réponses basiques mais utiles

## 📊 Modèle utilisé

**GPT-4o-mini** : Modèle optimisé pour les conversations, rapide et économique.

Paramètres configurés :
- `max_tokens: 300` (réponses concises)
- `temperature: 0.7` (équilibre créativité/précision)




