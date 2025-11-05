# 📋 Guide : Auto-complétion des Factures

## 🎯 Vue d'ensemble

Cette fonctionnalité permet de **remplir automatiquement** les informations récurrentes (nom, email, adresse, TVA) lors de la création de nouvelles factures, vous faisant gagner un temps précieux.

---

## ✨ Fonctionnalités

### 🔄 Auto-complétion automatique

Après la création de votre première facture, les informations suivantes seront automatiquement sauvegardées et pré-remplies pour les factures suivantes :

- ✅ **Nom du client**
- ✅ **Email du client**
- ✅ **Adresse du client**
- ✅ **Taux de TVA**

### ℹ️ Informations non sauvegardées

Les informations variables ne sont PAS sauvegardées :
- ❌ Date d'émission
- ❌ Date d'échéance
- ❌ Lignes de facture (description, quantité, prix)
- ❌ Notes

---

## 📝 Comment ça fonctionne ?

### 1. Première facture

Lors de la création de votre première facture :
1. Remplissez tous les champs normalement
2. Validez la facture
3. ✅ Les informations client sont automatiquement sauvegardées

### 2. Factures suivantes

Lors de la création de vos factures suivantes :
1. Ouvrez la page "Nouvelle facture"
2. 🎉 Les champs sont automatiquement pré-remplis !
3. Vous pouvez les modifier si nécessaire pour cette facture
4. Si vous modifiez les valeurs, elles sont mises à jour pour les prochaines factures

### 3. Indicateur visuel

Quand des valeurs par défaut sont chargées, vous verrez :
```
ℹ️ Les informations du client ont été remplies automatiquement.
   Vous pouvez les modifier pour cette facture.
```

---

## ⚙️ Gestion des valeurs par défaut

### Dans la page "Nouvelle facture"

Un bouton **"🗑️ Effacer par défaut"** apparaît en haut à droite quand des valeurs par défaut existent. Cliquez dessus pour :
- Effacer toutes les valeurs sauvegardées
- Réinitialiser le formulaire

### Dans les paramètres du compte

Accédez à **Dashboard > Mon compte** pour gérer vos valeurs par défaut :

1. **Section "Valeurs par défaut des factures"** (visible pour les plans Pro et Premium)
2. Modifiez les champs :
   - Nom du client par défaut
   - Email par défaut
   - Adresse par défaut
   - Taux de TVA par défaut (%)
3. Cliquez sur **"Sauvegarder"** pour enregistrer
4. Ou cliquez sur **"Effacer"** pour tout supprimer

---

## 🚀 Installation (pour les développeurs)

### Étape 1 : Exécuter la migration SQL

1. Connectez-vous à votre **Dashboard Supabase**
2. Allez dans **SQL Editor**
3. Ouvrez le fichier `supabase_migration_customer_defaults.sql`
4. Copiez tout le contenu
5. Collez-le dans l'éditeur SQL de Supabase
6. Cliquez sur **"Run"** pour exécuter la migration

### Étape 2 : Vérifier la table

Dans l'onglet **Table Editor** de Supabase, vérifiez que la table `customer_defaults` a été créée avec les colonnes :
- `id` (UUID)
- `user_id` (UUID) - UNIQUE
- `customer_name` (TEXT)
- `customer_email` (TEXT)
- `customer_address` (TEXT)
- `vat_rate` (NUMERIC)
- `updated_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

### Étape 3 : Tester la fonctionnalité

1. Redémarrez votre serveur de développement :
```bash
npm run dev
```

2. Connectez-vous avec un compte **Pro** ou **Premium**

3. Créez une nouvelle facture avec des informations client

4. Créez une deuxième facture → Les champs devraient être pré-remplis ! ✅

---

## 🔒 Sécurité

- ✅ **RLS activé** : Chaque utilisateur ne peut accéder qu'à ses propres valeurs par défaut
- ✅ **Données privées** : Les valeurs par défaut sont stockées de manière sécurisée dans Supabase
- ✅ **Suppression automatique** : Les valeurs sont supprimées si l'utilisateur supprime son compte

---

## 🆘 Dépannage

### Les valeurs ne se remplissent pas automatiquement

**Causes possibles :**

1. **La table n'existe pas**
   - Solution : Exécutez la migration SQL (voir Étape 1)

2. **Erreur de permissions**
   - Vérifiez que RLS est activé sur la table `customer_defaults`
   - Vérifiez que les politiques RLS sont créées

3. **Première facture pas encore créée**
   - Les valeurs par défaut ne sont sauvegardées qu'après la création de la première facture

4. **Cache du navigateur**
   - Rafraîchissez la page avec Ctrl+F5 (Windows) ou Cmd+Shift+R (Mac)

### Erreur lors de la sauvegarde

**Message d'erreur dans la console :**
```
Error: Could not find the table 'public.customer_defaults'
```

**Solution :**
- Exécutez la migration SQL dans Supabase (voir Étape 1)
- Vérifiez que la table `customer_defaults` existe bien

---

## 💡 Astuces

### 1. Client principal unique
Si vous facturez toujours le même client, remplissez ses informations dans les paramètres et elles seront toujours pré-remplies.

### 2. Plusieurs clients
Si vous avez plusieurs clients, les valeurs par défaut seront celles du dernier client facturé. Vous pouvez les modifier à la volée lors de la création de chaque facture.

### 3. TVA standard
Si vous utilisez toujours le même taux de TVA (ex: 20%), configurez-le dans les paramètres pour ne plus avoir à le saisir.

---

## 📊 Cas d'usage

### Freelance avec un client principal
```
1. Configurez les infos du client dans "Mon compte"
2. Créez vos factures → Tout est pré-rempli
3. Changez juste les lignes de facture à chaque fois
```

### Freelance avec plusieurs clients
```
1. Créez une facture pour le Client A
2. Les infos du Client A sont sauvegardées
3. Créez une facture pour le Client B
4. Modifiez les infos → Les infos du Client B sont sauvegardées
5. Pour le Client A, modifiez manuellement les infos
```

### Auto-entrepreneur
```
1. Configurez votre TVA par défaut (20% ou 0%)
2. Configurez vos infos client principales
3. Créez vos factures en quelques clics
```

---

## 🎉 Résultat

Avec cette fonctionnalité, vous gagnez du temps à chaque création de facture :

**Avant :**
- ⏱️ ~2 minutes pour remplir tous les champs

**Après :**
- ⚡ ~30 secondes pour créer une facture

**Gain de temps : 75% !** 🚀

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que la migration SQL a été exécutée
2. Vérifiez que vous avez un plan Pro ou Premium actif
3. Consultez la console du navigateur (F12) pour voir les erreurs
4. Consultez les logs Supabase pour les erreurs de backend

---

## 🔄 Mises à jour futures

Cette fonctionnalité pourrait évoluer pour inclure :
- [ ] Gestion de plusieurs clients avec sélection dans une liste
- [ ] Import/Export des valeurs par défaut
- [ ] Templates de factures complets
- [ ] Historique des clients facturés

---

**Version :** 1.0  
**Date :** Novembre 2025  
**Compatible avec :** Plans Pro et Premium


