# 🔍 Debug : OpenAI Ne S'Active Pas

## ❌ Symptôme

Le chatbot répond toujours avec le message de fallback :
```
Je suis désolé, je n'ai pas bien compris votre question...
Je peux vous aider avec : ...
```

Au lieu de réponses naturelles comme ChatGPT.

---

## 🎯 Causes Possibles

### 1. Clé API Non Configurée

**Vérifiez** votre fichier `.env.local` à la racine du projet :

```bash
OPENAI_API_KEY=sk-proj-...votre_cle_ici...
```

**Erreurs courantes** :
- ❌ Guillemets : `"sk-proj..."` → Enlevez-les
- ❌ Espaces : `OPENAI_API_KEY= sk-proj...` → Collez directement
- ❌ Mauvais fichier : `.env` au lieu de `.env.local`
- ❌ Mauvaise variable : `OPENAI_KEY` au lieu de `OPENAI_API_KEY`

### 2. Serveur Pas Redémarré

**Important** : Le serveur doit être redémarré APRÈS avoir modifié `.env.local`.

```powershell
Ctrl+C        # Arrêter
npm run dev   # Relancer
```

### 3. Clé API Invalide

**Vérifiez sur** : https://platform.openai.com/api-keys

- ✅ La clé existe et est active
- ✅ La clé commence par `sk-proj-` (nouvelles clés) ou `sk-` (anciennes)
- ✅ La clé n'est pas expirée

### 4. Compte Pas Crédité

**Vérifiez sur** : https://platform.openai.com/usage

- ✅ Vous avez au moins $5 de crédit
- ✅ Le statut du compte est "Active"
- ✅ Pas de message "Insufficient quota"

### 5. Erreur OpenAI Silencieuse

Le code catch les erreurs OpenAI et bascule en fallback.

---

## 🔧 Solution : Ajouter des Logs

Pour voir exactement ce qui se passe, modifions temporairement l'API :

### Étape 1 : Ouvrir le Fichier

Ouvrez : `app/api/chatbot/route.ts`

### Étape 2 : Ajouter des Logs

Cherchez la ligne ~224 :
```typescript
// Utiliser OpenAI si disponible
if (!openai || !process.env.OPENAI_API_KEY) {
  response = generateFallbackResponse(message, plan);
```

**Remplacez par** :
```typescript
// Utiliser OpenAI si disponible
console.log('🔍 DEBUG OpenAI:');
console.log('  - openai:', openai ? 'INITIALISÉ ✅' : 'NULL ❌');
console.log('  - OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'PRÉSENTE ✅' : 'ABSENTE ❌');

if (!openai || !process.env.OPENAI_API_KEY) {
  console.log('⚠️ MODE FALLBACK ACTIVÉ - OpenAI non disponible');
  response = generateFallbackResponse(message, plan);
```

Et cherchez la ligne ~242 :
```typescript
} catch (openaiError: any) {
  console.error('Erreur OpenAI:', openaiError);
```

**Remplacez par** :
```typescript
} catch (openaiError: any) {
  console.error('❌ ERREUR OPENAI DÉTAILLÉE:', {
    message: openaiError.message,
    status: openaiError.status,
    code: openaiError.code,
  });
```

### Étape 3 : Redémarrer et Tester

```powershell
Ctrl+C
npm run dev
```

Envoyez un message dans le chatbot, puis **regardez le terminal**.

---

## 📊 Interpréter les Logs

### Cas 1 : OpenAI NULL ❌

```
🔍 DEBUG OpenAI:
  - openai: NULL ❌
  - OPENAI_API_KEY: ABSENTE ❌
⚠️ MODE FALLBACK ACTIVÉ
```

**Problème** : Clé pas configurée ou mal nommée  
**Solution** : Vérifiez `.env.local`, la variable doit être exactement `OPENAI_API_KEY=sk-...`

### Cas 2 : Clé Présente Mais Erreur

```
🔍 DEBUG OpenAI:
  - openai: INITIALISÉ ✅
  - OPENAI_API_KEY: PRÉSENTE ✅
❌ ERREUR OPENAI DÉTAILLÉE: {
  message: 'Incorrect API key provided',
  status: 401,
  code: 'invalid_api_key'
}
```

**Problème** : Clé invalide  
**Solution** : Recopiez la clé depuis platform.openai.com

### Cas 3 : Quota Dépassé

```
❌ ERREUR OPENAI DÉTAILLÉE: {
  message: 'You exceeded your current quota',
  status: 429,
  code: 'insufficient_quota'
}
```

**Problème** : Pas de crédit sur le compte  
**Solution** : Ajoutez au moins $5 dans Billing

### Cas 4 : Ça Marche !

```
🔍 DEBUG OpenAI:
  - openai: INITIALISÉ ✅
  - OPENAI_API_KEY: PRÉSENTE ✅
(pas de mode fallback activé)
(pas d'erreur)
```

**Résultat** : Le chatbot devrait répondre avec OpenAI !  
Si le fallback s'active quand même, c'est qu'il y a un autre problème.

---

## ✅ Checklist Complète

Avant de continuer, vérifiez **TOUT** :

### Fichier .env.local

- [ ] Fichier `.env.local` existe à la racine du projet
- [ ] Ligne exacte : `OPENAI_API_KEY=sk-proj-...` (sans guillemets, sans espaces)
- [ ] La clé est complète (environ 100 caractères)
- [ ] Pas de saut de ligne au milieu de la clé

### Compte OpenAI

- [ ] Compte créé sur platform.openai.com
- [ ] Clé API générée (section API Keys)
- [ ] Compte crédité ($5 minimum)
- [ ] Statut "Active" dans Usage

### Serveur

- [ ] Serveur redémarré APRÈS modification .env.local
- [ ] Aucune erreur au démarrage
- [ ] Message "✓ Ready" visible

### Test

- [ ] Logs activés (modifications ci-dessus)
- [ ] Message envoyé au chatbot
- [ ] Terminal vérifié pour les logs

---

## 🆘 Si Rien Ne Marche

**Option 1 : Testez la clé directement**

Créez un fichier `test-openai.js` à la racine :

```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: 'sk-proj-...VOTRE_CLÉ_ICI...',
});

async function test() {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Dis bonjour' }],
      max_tokens: 50,
    });
    console.log('✅ OpenAI fonctionne !');
    console.log('Réponse:', completion.choices[0].message.content);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

test();
```

Puis exécutez :
```powershell
node test-openai.js
```

Si ça marche ici mais pas dans l'app, c'est un problème de configuration.

**Option 2 : Variable d'environnement temporaire**

Dans PowerShell, avant de lancer le serveur :

```powershell
$env:OPENAI_API_KEY = "sk-proj-...VOTRE_CLÉ..."
npm run dev
```

Si ça marche, le problème vient de `.env.local`.

---

## 📋 Prochaine Étape

1. **Ajoutez les logs** dans `app/api/chatbot/route.ts` (voir ci-dessus)
2. **Redémarrez** le serveur
3. **Testez** le chatbot
4. **Copiez les logs** du terminal et envoyez-les moi

Je pourrai alors identifier précisément le problème ! 🔍


