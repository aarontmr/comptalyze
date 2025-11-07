# ⚡ Installation Rate-Limiting - Guide Rapide (5 minutes)

## 🎯 Installation en 5 étapes simples

### Étape 1 : Créer la table access_logs (2 minutes)

**Supabase Dashboard :**
1. Ouvrez https://app.supabase.com
2. Sélectionnez votre projet
3. **SQL Editor** → New Query
4. Copiez tout le contenu de `supabase_migration_access_logs.sql`
5. Cliquez **Run**

**Vérification :**
```sql
SELECT * FROM access_logs LIMIT 1;
```
✅ Si pas d'erreur → Table créée !

---

### Étape 2 : Configurer un admin (30 secondes)

```sql
-- Remplacez par votre email
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'votre@email.com';
```

**Vérification :**
```sql
SELECT email, raw_user_meta_data->>'is_admin' as is_admin
FROM auth.users  
WHERE email = 'votre@email.com';
```
✅ Devrait afficher `true`

---

### Étape 3 : Redémarrer le serveur (10 secondes)

```bash
# Arrêter le serveur (Ctrl+C)
# Redémarrer
npm run dev
```

---

### Étape 4 : Tester le rate-limiting (1 minute)

**Test A - Login rate-limit :**

1. Allez sur http://localhost:3000/login
2. Essayez de vous connecter **6 fois rapidement** (même avec mauvais credentials)
3. ✅ À la 6ème tentative → Message : "⏱️ Trop de tentatives. Réessayez dans X secondes."

**Test B - Vérifier dans Supabase :**
```sql
SELECT * FROM access_logs 
WHERE endpoint = '/api/auth/login'
ORDER BY created_at DESC 
LIMIT 10;
```
✅ Vous devriez voir :
- 5 entrées avec status 200 ou 400
- 1 entrée avec status **429** (rate-limit)

---

### Étape 5 : Consulter les logs admin (1 minute)

1. Connectez-vous avec votre compte admin
2. Allez sur http://localhost:3000/admin/logs
3. ✅ Vous devriez voir vos tentatives de login
4. Testez les filtres (Tous / Succès / Erreurs)
5. Cliquez "Actualiser" pour recharger

---

## ✅ Checklist de validation

- [ ] Table `access_logs` existe dans Supabase
- [ ] Compte admin configuré (is_admin: true)
- [ ] Test rate-limit login réussi (bloqué après 5 tentatives)
- [ ] Message UX clair affiché ("⏱️ Trop de tentatives...")
- [ ] Logs visibles dans Supabase
- [ ] Page /admin/logs accessible
- [ ] Filtres fonctionnels
- [ ] Stats cards affichées

---

## 🎯 Configuration des limites

### Limites actuelles

| Endpoint | Max Requests | Fenêtre | Reset |
|----------|--------------|---------|-------|
| **Login** | 5 tentatives | 1 minute | Auto |
| **Signup** | 3 tentatives | 1 heure | Auto |

### Modifier les limites

**Login (fichier `app/api/auth/login/route.ts`) :**
```typescript
const rateLimitResult = checkRateLimit(clientIp, {
  maxRequests: 10,     // ← Modifier ici (par défaut: 5)
  windowMs: 60000      // ← 1 minute (60000ms)
});
```

**Signup (fichier `app/api/auth/signup/route.ts`) :**
```typescript
const rateLimitResult = checkRateLimit(`signup:${clientIp}`, {
  maxRequests: 5,      // ← Modifier ici (par défaut: 3)
  windowMs: 3600000    // ← 1 heure (3600000ms)
});
```

**Recommandations :**
- **Login** : 5-10 tentatives / minute (équilibre sécurité/UX)
- **Signup** : 2-5 tentatives / heure (plus strict)

---

## 🧪 Tests recommandés

### Test 1 : Rate-limit login

```bash
# Terminal 1 : Serveur lancé
npm run dev

# Terminal 2 : Curl pour tester
for i in {1..7}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test123"}' \
    -w "\nStatus: %{http_code}\n\n"
  sleep 1
done
```

**Résultat attendu :**
- Tentatives 1-5 : Status 200
- Tentatives 6-7 : Status **429** (rate-limit)

---

### Test 2 : Logs enregistrés

```sql
-- Vérifier que les logs sont bien enregistrés
SELECT 
  endpoint,
  method,
  status_code,
  ip_address,
  created_at
FROM access_logs
WHERE endpoint LIKE '%auth%'
ORDER BY created_at DESC
LIMIT 20;
```

**Résultat attendu :**
- Voir vos tentatives de test
- Status codes variés (200, 400, 429)
- IP address correcte

---

### Test 3 : Dashboard admin

**Actions :**
1. Aller sur /admin/logs
2. Cliquer filtre "Erreurs"
3. Voir les tentatives 429
4. Cliquer filtre "Succès"
5. Voir les tentatives 200
6. Sélectionner un endpoint spécifique
7. Voir seulement ce endpoint

**Résultat attendu :**
- Filtres fonctionnent
- Stats se mettent à jour
- Logs affichés correctement

---

## 🚨 Que faire si attaque détectée ?

### 1. Identifier l'IP suspecte

```sql
-- IPs avec le plus d'erreurs (dernières 24h)
SELECT 
  ip_address,
  COUNT(*) as attempts,
  COUNT(CASE WHEN status_code >= 400 THEN 1 END) as errors
FROM access_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_address
HAVING COUNT(CASE WHEN status_code >= 400 THEN 1 END) > 20
ORDER BY errors DESC;
```

---

### 2. Bloquer temporairement

**Option A : Cloudflare**
- Dashboard → Firewall → IP Access Rules
- Ajouter l'IP à la blacklist

**Option B : Vercel (si disponible)**
- Settings → Firewall
- Bloquer l'IP

**Option C : Supabase (table blacklist)**
```sql
CREATE TABLE ip_blacklist (
  ip_address TEXT PRIMARY KEY,
  reason TEXT,
  blocked_until TIMESTAMP
);

-- Bloquer une IP
INSERT INTO ip_blacklist VALUES ('123.45.67.89', 'Brute-force', NOW() + INTERVAL '24 hours');
```

---

### 3. Analyser et documenter

```sql
-- Toutes les tentatives de cette IP
SELECT * FROM access_logs
WHERE ip_address = '123.45.67.89'
ORDER BY created_at DESC;
```

**Créer un incident report :**
- IP concernée
- Nombre de tentatives
- Endpoints ciblés
- Actions prises
- Date/heure

---

## 📊 Monitoring continu

### Alertes à configurer (optionnel)

**1. Email notification**
```typescript
// Si > 100 tentatives échouées en 1h
if (failedAttempts > 100) {
  await sendEmail({
    to: 'security@comptalyze.com',
    subject: '🚨 Activité suspecte détectée',
    body: `${failedAttempts} tentatives échouées depuis ${ip}`
  });
}
```

**2. Slack/Discord webhook**
```typescript
await fetch(SLACK_WEBHOOK, {
  method: 'POST',
  body: JSON.stringify({
    text: `🚨 IP suspecte: ${ip} - ${attempts} tentatives`
  })
});
```

**3. Dashboard temps réel**
- Mettre à jour toutes les 30s
- Afficher les tentatives en cours
- Graphique en temps réel

---

## 💡 Optimisations futures

### Court terme

1. **Rate-limit différencié**
   - Moins strict pour IPs de confiance
   - Plus strict pour IPs suspectes

2. **Whitelist IPs**
   - IPs bureau exemptées
   - IPs VPN de confiance

3. **Exponential backoff**
   - 1ère tentative : 1 min
   - 2ème tentative : 5 min
   - 3ème tentative : 30 min

---

### Moyen terme

1. **Redis pour rate-limiting**
   - Store distribué (si multi-serveurs)
   - Persistant entre redémarrages
   - Plus performant

2. **Machine Learning**
   - Détection anomalies
   - Pattern matching
   - Prédiction d'attaques

3. **Intégration WAF**
   - Cloudflare WAF
   - AWS WAF
   - Protection DDoS

---

## 📞 Support

### En cas de problème

1. **Vérifier Supabase** : Table access_logs existe ?
2. **Vérifier admin** : is_admin = true ?
3. **Vérifier console** : Erreurs JavaScript ?
4. **Vérifier logs Supabase** : Insertions fonctionnent ?

### Ressources

- **Documentation** : `RATE_LIMITING_LOGS.md` (complète)
- **Migration SQL** : `supabase_migration_access_logs.sql`
- **Code** : `lib/rateLimit.ts` et `lib/logger.ts`

---

**✅ Installation terminée ! Votre application est maintenant protégée contre le brute-force.**

**🔐 Sécurité renforcée :**
- Rate-limiting actif (5/min login, 3/h signup)
- Logs détaillés de tous les accès
- Dashboard admin pour monitoring
- Messages UX clairs

**📊 Monitoring opérationnel :**
- /admin/logs pour consulter
- Filtres et stats en temps réel
- Détection d'IPs suspectes

**🚀 Temps d'installation : 5 minutes**
**🛡️ Protection : Niveau professionnel**

