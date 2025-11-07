# 🚀 Quickstart - Suivi Analytics

## Installation en 3 étapes

### 1️⃣ Créer la table Supabase (2 minutes)

1. Ouvrez votre dashboard Supabase
2. Allez dans **SQL Editor**
3. Collez le contenu de `supabase_migration_analytics_events.sql`
4. Cliquez sur **Run**

### 2️⃣ Configurer Umami (Optionnel - 5 minutes)

**Option rapide - Umami Cloud EU** :
1. Allez sur [https://cloud.umami.is](https://cloud.umami.is)
2. Créez un compte et un site
3. Copiez votre Website ID

**Ajoutez dans `.env.local`** :
```bash
NEXT_PUBLIC_UMAMI_WEBSITE_ID=votre-website-id
NEXT_PUBLIC_UMAMI_SRC=https://cloud.umami.is/script.js
```

> 💡 **Sans Umami** : Le système fonctionne quand même ! Les événements sont stockés dans Supabase.

### 3️⃣ Redémarrez votre serveur

```bash
# Arrêtez avec Ctrl+C
npm run dev
```

## ✅ C'est tout !

Le système est maintenant actif :

- ✨ **UTM capturés automatiquement** lors de la première visite
- 📊 **5 événements trackés** : signup_started, signup_completed, record_created, upgrade_clicked, upgrade_completed
- 📈 **Dashboard admin** disponible sur `/admin/metrics`

## 🧪 Test Rapide

1. Visitez : `http://localhost:3000/?utm_source=test&utm_medium=email`
2. Ouvrez la console (F12) : vous devriez voir `✅ Paramètres UTM capturés`
3. Inscrivez-vous : vous verrez `✅ Événement tracké: signup_started`

## 📊 Voir les Métriques

1. **Connectez-vous** avec votre compte

2. **Visitez `/admin/metrics`** pour voir :
   - Nombre de signups par source
   - Taux de conversion free → pay
   - Résumé des événements

> 💡 **Note :** Par défaut, tous les utilisateurs authentifiés peuvent accéder aux métriques. Pour restreindre l'accès aux admins uniquement, consultez `FIX_USER_PROFILES.md`.

## 📚 Documentation Complète

Consultez `GUIDE_ANALYTICS_ACQUISITION.md` pour :
- Dépannage
- Requêtes SQL avancées
- Personnalisation
- Conformité RGPD

---

**Besoin d'aide ?** Vérifiez le guide complet ou la section dépannage.

