# 🔧 Correction "Failed to fetch"

## 🎯 Solution Rapide

### Étape 1 : Redémarrer le Serveur

Dans votre terminal PowerShell où tourne `npm run dev` :

1. **Arrêtez** le serveur : `Ctrl+C`
2. **Relancez** : `npm run dev`
3. **Attendez** le message : `✓ Ready in Xs`

### Étape 2 : Vérifier les Logs

Après avoir relancé, **testez le chatbot** et **regardez le terminal**.

Si vous voyez des erreurs en rouge, **copiez-les et envoyez-les moi**.

---

## 🔍 Diagnostics Possibles

### Erreur 1 : "Cannot find module"

**Dans le terminal** :
```
Error: Cannot find module '@/lib/supabaseClient'
```

**Solution** : Vérifiez que le fichier existe à `lib/supabaseClient.ts`

### Erreur 2 : OpenAI API Error

**Dans le terminal** :
```
Erreur OpenAI: 401 Incorrect API key
```

**Solution** : 
- Vérifiez `.env.local` : `OPENAI_API_KEY=sk-proj-...`
- Pas d'espaces, pas de guillemets
- Redémarrez le serveur après modification

### Erreur 3 : Supabase Error

**Dans le terminal** :
```
Missing Supabase environment variables
```

**Solution** : Vérifiez dans `.env.local` :
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 🧪 Test Simple

Pour tester si l'API fonctionne sans le chatbot :

Ouvrez dans votre navigateur :
```
http://localhost:3000/api/chatbot
```

**Si ça fonctionne** : Vous verrez `{"error":"Message requis"}`  
**Si ça ne fonctionne pas** : Erreur 404 ou 500

---

## 📋 Checklist

- [ ] Serveur redémarré avec `npm run dev`
- [ ] Message "✓ Ready" visible dans le terminal
- [ ] Aucune erreur rouge au démarrage
- [ ] `.env.local` contient bien `OPENAI_API_KEY`
- [ ] Test de l'URL `/api/chatbot` → retourne une erreur JSON (normal)

---

## 💡 Si Rien Ne Marche

**Envoyez-moi** :
1. Le contenu **COMPLET** du terminal après `npm run dev`
2. Le contenu de votre fichier `.env.local` (masquez les vraies clés)
3. L'erreur exacte dans la console du navigateur (F12 → Console)

Je pourrai alors identifier le problème précis ! 🔍


