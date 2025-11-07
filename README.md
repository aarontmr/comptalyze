This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Configuration Vercel Cron pour les rappels mensuels

Pour activer les rappels mensuels par email (fonctionnalité Premium), configurez un cron job sur Vercel :

1. Créez un fichier `vercel.json` à la racine du projet (si ce n'est pas déjà fait) :

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 7 2 * *"
    }
  ]
}
```

2. Le schedule `"0 7 2 * *"` signifie :
   - `0` : minute 0
   - `7` : heure 7 (UTC)
   - `2` : jour 2 du mois
   - `*` : tous les mois
   - `*` : tous les jours de la semaine

   Note: Ajustez l'heure selon votre fuseau horaire (Europe/Paris = UTC+1 en hiver, UTC+2 en été).

3. Ajoutez la variable d'environnement `CRON_SECRET` dans les paramètres Vercel :
   - Allez dans Settings > Environment Variables
   - Ajoutez `CRON_SECRET` avec une valeur aléatoire longue (ex: générée avec `openssl rand -hex 32`)
   - Cette valeur doit correspondre à celle dans `.env.local` pour les tests locaux

4. Le cron job appellera automatiquement `/api/cron/send-reminders` le 2 de chaque mois à 7h UTC.

**Note** : La route vérifie également que c'est bien le 2 du mois en heure Europe/Paris avant d'envoyer les emails, pour éviter les problèmes de fuseau horaire.

## Configuration OpenAI pour ComptaBot (Assistant IA Premium)

ComptaBot, l'assistant intelligent de Comptalyze, utilise OpenAI pour fournir des réponses intelligentes aux clients Premium. Pour l'activer :

1. **Créez un compte OpenAI** sur https://platform.openai.com si ce n'est pas déjà fait
2. **Récupérez votre clé API** dans Settings > API keys
3. **Ajoutez la variable d'environnement** :
   - Localement : ajoutez `OPENAI_API_KEY=sk-...` dans `.env.local`
   - Sur Vercel : ajoutez `OPENAI_API_KEY` dans Settings > Environment Variables
4. **Redéployez** votre application

ComptaBot utilise **GPT-4o-mini** (économique et rapide) et accède automatiquement aux données CA de chaque client pour des conseils personnalisés.

**Voir le guide détaillé** : `GUIDE_CONFIGURATION_OPENAI.md`
