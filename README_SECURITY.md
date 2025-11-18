# 🔒 Guide de Sécurité - Comptalyze

## 📋 Vue d'ensemble

Ce document fournit un guide rapide pour maintenir la sécurité de l'application Comptalyze après l'audit de sécurité complet effectué le 2025-01-27.

## ✅ État actuel

**Taux de correction :** 100% (12/12 vulnérabilités traitées)

Toutes les vulnérabilités critiques ont été corrigées. L'application est maintenant sécurisée pour la production.

## 🔐 Bonnes pratiques à suivre

### 1. Authentification & Autorisation

- ✅ **Utiliser `lib/auth.ts`** pour toutes les vérifications d'authentification
- ✅ **Routes admin** : Toujours utiliser `verifyAdmin()`
- ✅ **Routes utilisateur** : Utiliser `verifyUserOwnership()` pour éviter les IDOR

```typescript
import { verifyAuth, verifyAdmin, verifyUserOwnership } from '@/lib/auth';

// Pour routes normales
const authResult = await verifyAuth(req);
if (!authResult.isAuthenticated) {
  return NextResponse.json({ error: authResult.error }, { status: authResult.status });
}

// Pour routes admin
const authResult = await verifyAdmin(req);

// Pour vérifier la propriété
const authResult = await verifyUserOwnership(req, userId);
```

### 2. Validation des données

- ✅ **Utiliser Zod** pour toutes les validations
- ✅ **Schémas dans `lib/validation.ts`**
- ✅ **Ajouter de nouveaux schémas** pour chaque nouvelle route API

```typescript
import { validateAndParse, deleteAccountSchema } from '@/lib/validation';

const validation = validateAndParse(deleteAccountSchema, body);
if (!validation.success) {
  return NextResponse.json({ error: validation.error }, { status: 400 });
}
const { userId, confirmationText } = validation.data;
```

### 3. Gestion des erreurs

- ✅ **Utiliser `lib/error-handler.ts`** pour toutes les erreurs
- ✅ **Ne jamais exposer de stack traces** au client
- ✅ **Messages génériques** pour les clients

```typescript
import { handleInternalError, handleValidationError } from '@/lib/error-handler';

try {
  // ...
} catch (error) {
  return handleInternalError(error);
}
```

### 4. Sécurité frontend

- ✅ **Sanitizer avec DOMPurify** avant d'utiliser `dangerouslySetInnerHTML`
- ✅ **Limiter les tags autorisés** (strong, span, em, br uniquement)

```typescript
import DOMPurify from 'dompurify';

const sanitized = DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['strong', 'span', 'em', 'br'],
  ALLOWED_ATTR: ['class'],
});
```

### 5. Secrets & Configuration

- ✅ **Jamais de secrets hardcodés** dans le code
- ✅ **Utiliser `process.env`** pour toutes les variables sensibles
- ✅ **Vérifier `.gitignore`** exclut bien `.env*`
- ✅ **Ne jamais logger de secrets** (tokens, clés API, mots de passe)

### 6. Base de données

- ✅ **Toujours filtrer par `user_id`** pour éviter les IDOR
- ✅ **Utiliser Supabase Client** (requêtes paramétrées automatiques)
- ✅ **Vérifier RLS activé** sur toutes les tables sensibles

```typescript
// ✅ BON
const { data } = await supabase
  .from('invoices')
  .select('*')
  .eq('user_id', userId); // Toujours filtrer par user_id

// ❌ MAUVAIS
const { data } = await supabase
  .from('invoices')
  .select('*')
  .eq('id', invoiceId); // Manque le filtre user_id
```

## 🛠️ Commandes utiles

```bash
# Vérifier les vulnérabilités npm
npm run security:audit

# Vérifier sécurité + lint
npm run security:check

# Linter le code
npm run lint
```

## 📚 Documentation complète

- **SECURITY_OVERVIEW.md** - Architecture et zones critiques
- **SECURITY_REPORT.md** - Détails complets de toutes les vulnérabilités
- **SECURITY_AUDIT_SUMMARY.md** - Résumé exécutif

## ⚠️ Checklist avant déploiement

- [ ] Toutes les routes API ont une validation Zod
- [ ] Toutes les routes sensibles ont une vérification d'authentification
- [ ] Aucun secret n'est loggé ou exposé
- [ ] `npm run security:check` passe sans erreurs critiques
- [ ] Variables d'environnement configurées sur Vercel
- [ ] `.env*` bien exclu de Git
- [ ] Rate limiting configuré pour production (Redis/Upstash recommandé)

## 🔄 Maintenance continue

1. **Mensuel** : Exécuter `npm audit` et mettre à jour les dépendances
2. **Trimestriel** : Réviser les logs pour détecter les patterns suspects
3. **Annuel** : Audit de sécurité externe recommandé

---

**Dernière mise à jour :** 2025-01-27

