# 🎯 Activer Premium via l'API (méthode simple)

## 📋 Méthode via l'API (si l'interface Supabase ne fonctionne pas)

### Étape 1 : Utiliser la route API

J'ai créé une route API spéciale pour activer Premium sur votre compte.

1. **Ouvrez votre terminal** dans le dossier du projet
2. **Démarrez le serveur** (si ce n'est pas déjà fait) :
   ```bash
   npm run dev
   ```

3. **Ouvrez votre navigateur** et allez à :
   ```
   http://localhost:3000/api/admin/set-premium
   ```
   
   ⚠️ **NON !** Ne faites pas ça directement. Utilisez plutôt une requête POST.

### Étape 2 : Utiliser curl ou Postman

**Option A : Avec curl (dans le terminal)**

```bash
curl -X POST http://localhost:3000/api/admin/set-premium \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"votre@email.com\"}"
```

**Option B : Avec PowerShell (Windows)**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/set-premium" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"votre@email.com"}'
```

**Option C : Créer une page de test simple**

Créez un fichier temporaire `test-premium.html` à la racine :

```html
<!DOCTYPE html>
<html>
<head>
  <title>Activer Premium</title>
</head>
<body>
  <h1>Activer Premium</h1>
  <input type="email" id="email" placeholder="Votre email" />
  <button onclick="activatePremium()">Activer Premium</button>
  <div id="result"></div>

  <script>
    async function activatePremium() {
      const email = document.getElementById('email').value;
      const resultDiv = document.getElementById('result');
      
      try {
        const response = await fetch('http://localhost:3000/api/admin/set-premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        resultDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
      } catch (error) {
        resultDiv.innerHTML = 'Erreur: ' + error.message;
      }
    }
  </script>
</body>
</html>
```

Puis ouvrez ce fichier dans votre navigateur et utilisez-le.

### Étape 3 : Recharger l'application

1. **Déconnectez-vous** de votre application Comptalyze
2. **Reconnectez-vous** (les métadonnées seront rechargées)

## ✅ Vérification

Vous devriez voir :
- ✅ Le toggle "Recevoir un rappel par e-mail tous les 2 du mois"
- ✅ La carte "Conseil IA (Premium)"
- ✅ Le bouton "Exporter en PDF par e-mail"

## 🔙 Désactiver Premium

Pour revenir au plan gratuit, modifiez la route ou utilisez cette requête :

```bash
curl -X POST http://localhost:3000/api/admin/set-free \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"votre@email.com\"}"
```

(Il faudrait créer cette route aussi, ou utiliser l'interface Supabase)

## 🔒 Sécurité

⚠️ **Important** : Cette route API est pour les tests uniquement. En production, vous devriez :
- Ajouter une authentification (vérifier que vous êtes bien l'admin)
- Ajouter un secret d'authentification
- Ou utiliser uniquement l'interface Supabase





