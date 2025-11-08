# 🔐 COMPTALYZE - DONNÉES & RGPD

Documentation technique sur le traitement des données personnelles et la conformité RGPD.

**Dernière mise à jour**: 2025-01-08  
**Version**: 1.0.0

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Données collectées](#données-collectées)
3. [Base légale](#base-légale)
4. [Flux de données](#flux-de-données)
5. [Hébergement & Sous-traitants](#hébergement--sous-traitants)
6. [Durée de conservation](#durée-de-conservation)
7. [Droits des utilisateurs](#droits-des-utilisateurs)
8. [Sécurité](#sécurité)
9. [Cookies & Tracking](#cookies--tracking)
10. [Conformité RGPD](#conformité-rgpd)

---

## VUE D'ENSEMBLE

**Comptalyze** est une application SaaS de gestion comptable pour auto-entrepreneurs français. L'application collecte et traite des données personnelles et financières selon le RGPD.

### Responsable de traitement

**Comptalyze**  
[Adresse]  
SIRET: [Numéro]  
Email: dpo@comptalyze.com

### Délégué à la Protection des Données (DPO)

**Nom**: [Nom DPO]  
**Email**: dpo@comptalyze.com  
**Téléphone**: [Numéro]

---

## DONNÉES COLLECTÉES

### Données d'identification

| Donnée | Obligatoire | Usage | Base légale |
|--------|-------------|-------|-------------|
| **Email** | Oui | Authentification, communications | Contrat |
| **Nom complet** | Non | Personnalisation | Consentement |
| **Mot de passe** | Oui | Authentification | Contrat |

**Stockage**: Supabase Auth (UE)  
**Chiffrement**: Bcrypt pour mot de passe, AES-256 en transit (TLS)

### Données financières

| Donnée | Obligatoire | Usage | Base légale |
|--------|-------------|-------|-------------|
| **Chiffre d'affaires** | Non | Simulations URSSAF | Consentement |
| **Type d'activité** | Non | Calculs cotisations | Consentement |
| **Factures** | Non | Gestion comptable | Consentement |
| **Charges** | Non | Optimisation fiscale | Consentement |
| **Coordonnées bancaires** | Non* | Paiements abonnements | Contrat |

*Stockées chez Stripe, jamais sur nos serveurs.

**Stockage**: Supabase Database (UE)  
**Chiffrement**: AES-256 at-rest + TLS in-transit

### Données d'usage

| Donnée | Usage | Base légale |
|--------|-------|-------------|
| **Logs de connexion** | Sécurité, debug | Intérêt légitime |
| **Adresse IP** | Rate-limiting, sécurité | Intérêt légitime |
| **User-Agent** | Compatibilité, debug | Intérêt légitime |
| **Analytics (GA4)** | Amélioration service | Consentement |
| **Events app** | Analyse usage | Intérêt légitime |

**Stockage**: Supabase (logs), Google Analytics (anonymisé)  
**Rétention**: 90 jours (logs), 14 mois (GA4)

### Données IA (Premium)

| Donnée | Usage | Base légale |
|--------|-------|-------------|
| **Messages chat** | ComptaBot IA | Consentement |
| **Contexte financier** | Conseils personnalisés | Consentement |

**Stockage**: Supabase Database (UE)  
**Traitement**: OpenAI (US) - voir transferts hors UE  
**Rétention**: 2 ans (ou jusqu'à suppression compte)

---

## BASE LÉGALE

Conformément à l'article 6 du RGPD, nos traitements reposent sur:

### 1. Exécution du contrat (Art. 6.1.b)
- Authentification utilisateur
- Fourniture du service (simulations, factures, etc.)
- Gestion des abonnements
- Support client

### 2. Consentement (Art. 6.1.a)
- Données financières (CA, factures)
- Analytics (GA4, cookies)
- IA (messages chat, conseils)
- Emails marketing (si opt-in)

**Retrait**: Possible à tout moment via dashboard ou email à dpo@comptalyze.com

### 3. Intérêt légitime (Art. 6.1.f)
- Logs de sécurité
- Rate-limiting
- Détection fraude
- Amélioration technique du service

**Balance test**: Nos intérêts (sécurité, qualité service) ne portent pas atteinte excessive aux droits des utilisateurs.

### 4. Obligation légale (Art. 6.1.c)
- Conservation factures (10 ans - Code de commerce)
- Lutte anti-blanchiment (si applicable)

---

## FLUX DE DONNÉES

### Inscription

```
1. Utilisateur → Frontend (HTTPS)
   - Email, Password

2. Frontend → Supabase Auth (UE)
   - Création compte
   - Email vérification envoyé via Resend

3. Supabase → Resend (UE)
   - Email bienvenue

4. Frontend → Supabase Database (UE)
   - user_profiles (nom, préférences)
```

### Simulation URSSAF

```
1. Utilisateur → Frontend (HTTPS)
   - CA, type activité, ACRE

2. Frontend → Calcul local (JS)
   - Aucune transmission serveur

3. (Optionnel) Sauvegarde:
   Frontend → Supabase Database (UE)
   - urssaf_records (CA, mois, année)
```

### Paiement abonnement

```
1. Utilisateur → Stripe Checkout (UE)
   - CB (JAMAIS stockée chez nous)

2. Stripe → Notre API Webhook (HTTPS)
   - checkout.session.completed

3. Notre API → Supabase (UE)
   - Mise à jour plan utilisateur
```

### Import automatique CA (Premium)

```
1. CRON Mensuel → Notre API (HTTPS)
   - Job import CA

2. Notre API → Stripe API (UE) / Shopify API
   - Récupération transactions mois N-1

3. Notre API → Supabase (UE)
   - urssaf_records (CA importé)

4. Notre API → Resend (UE)
   - Email récap mensuel
```

### Chat IA (Premium)

```
1. Utilisateur → Frontend (HTTPS)
   - Message chat

2. Frontend → Notre API (HTTPS)
   - Message + contexte financier

3. Notre API → OpenAI (US) ⚠️
   - Prompt + contexte

4. OpenAI (US) → Notre API
   - Réponse IA

5. Notre API → Supabase (UE)
   - chat_messages (historique)

6. Notre API → Frontend
   - Affichage réponse
```

---

## HÉBERGEMENT & SOUS-TRAITANTS

### Infrastructure principale (UE)

| Service | Rôle | Localisation | Certification | DPA |
|---------|------|--------------|---------------|-----|
| **Vercel** | Hébergement app | UE (Frankfurt) | SOC 2, ISO 27001 | ✅ |
| **Supabase** | Database + Auth | UE (Frankfurt) | SOC 2, ISO 27001 | ✅ |
| **Stripe** | Paiements | UE (Dublin) | PCI-DSS Level 1 | ✅ |
| **Resend** | Emails | UE (AWS EU) | SOC 2 | ✅ |

### Services hors UE ⚠️

| Service | Rôle | Localisation | Transfert | Protection |
|---------|------|--------------|-----------|------------|
| **OpenAI** | IA (Premium) | US | Art. 46 RGPD | SCC + DPA |
| **Google (GA4)** | Analytics | US (anonymisé) | Art. 49.1.a | Consentement |

**Clauses Contractuelles Types (SCC)**: Signées avec OpenAI pour encadrer le transfert vers les US.

**Minimisation**: Seuls les messages chat et contexte financier agrégé sont envoyés à OpenAI (pas de données brutes).

---

## DURÉE DE CONSERVATION

| Donnée | Durée | Justification |
|--------|-------|---------------|
| **Compte utilisateur** | Jusqu'à suppression | Service actif |
| **Données financières** | 2 ans après dernière connexion | Utilité service |
| **Factures** | 10 ans | Obligation légale (Code commerce) |
| **Logs de connexion** | 90 jours | Sécurité |
| **Analytics (GA4)** | 14 mois | Amélioration service |
| **Messages IA** | 2 ans après dernière connexion | Contexte conversations |
| **Stripe data** | Selon politique Stripe | Cf. Stripe Privacy Policy |

### Suppression automatique

- **Comptes inactifs**: Alerte après 2 ans → Suppression après 3 ans
- **Logs**: Purge auto après 90 jours
- **Sessions**: Expiration après 7 jours

### Suppression manuelle

L'utilisateur peut supprimer son compte à tout moment:
- Via dashboard: `/dashboard/compte` > "Supprimer mon compte"
- Via API: `POST /api/delete-account`
- Par email: dpo@comptalyze.com

**Délai**: Suppression effective sous 30 jours (sauf obligations légales ex: factures 10 ans).

---

## DROITS DES UTILISATEURS

Conformément aux articles 15 à 22 du RGPD:

### 1. Droit d'accès (Art. 15)

**Comment**: 
- Dashboard: `/dashboard/compte` > "Exporter mes données"
- API: `GET /api/export-data`
- Email: dpo@comptalyze.com

**Format**: JSON contenant toutes les données personnelles.

**Délai**: 1 mois maximum.

### 2. Droit de rectification (Art. 16)

**Comment**: 
- Dashboard: `/dashboard/compte` > Modifier profil
- Email: dpo@comptalyze.com

**Délai**: Immédiat (dashboard) ou 1 mois (email).

### 3. Droit à l'effacement (Art. 17)

**Comment**: 
- Dashboard: `/dashboard/compte` > "Supprimer mon compte"
- API: `POST /api/delete-account`
- Email: dpo@comptalyze.com

**Exceptions**: Factures conservées 10 ans (obligation légale).

**Délai**: 30 jours.

### 4. Droit à la portabilité (Art. 20)

**Comment**: Même que droit d'accès.

**Format**: JSON structuré, réutilisable.

### 5. Droit d'opposition (Art. 21)

**Comment**: 
- Emails marketing: Lien "Se désinscrire" dans chaque email
- Analytics: Refuser cookies via bannière
- Traitement: Email à dpo@comptalyze.com

### 6. Droit de limitation (Art. 18)

**Comment**: Email à dpo@comptalyze.com

**Effet**: Données conservées mais pas traitées (sauf stockage).

### 7. Retrait du consentement (Art. 7.3)

**Comment**: 
- Dashboard: Décocher options
- Email: dpo@comptalyze.com

**Effet**: Immédiat. N'affecte pas la licéité des traitements antérieurs.

---

## SÉCURITÉ

### Mesures techniques

| Mesure | Implémentation |
|--------|----------------|
| **Chiffrement transit** | TLS 1.3 (HTTPS obligatoire) |
| **Chiffrement repos** | AES-256 (Supabase) |
| **Mots de passe** | Bcrypt (12 rounds) |
| **Sessions** | JWT signés, expiration 7j |
| **Rate limiting** | IP-based, 5-60 req/min selon endpoint |
| **CSP** | Headers sécurité (X-Frame, CSP, etc.) |
| **RLS** | Row Level Security (Supabase) |
| **Backups** | Quotidiens (Supabase PITR) |
| **2FA** | Disponible via Supabase (optionnel) |

### Mesures organisationnelles

| Mesure | Description |
|--------|-------------|
| **Accès restreints** | Principe du moindre privilège |
| **Logs d'accès** | Traçabilité admin |
| **Rotation secrets** | Trimestrielle (clés API) |
| **Audits** | Semestriels (code + infra) |
| **Formation équipe** | RGPD + sécurité |
| **Incident response** | Procédure documentée (RUNBOOK) |

### Violations de données

**Procédure**:
1. Détection → Investigation (< 24h)
2. Notification CNIL (< 72h si risque)
3. Notification utilisateurs (< 72h si risque élevé)
4. Remédiation + post-mortem

**Contact**: dpo@comptalyze.com

---

## COOKIES & TRACKING

### Cookies strictement nécessaires

| Cookie | Durée | Usage |
|--------|-------|-------|
| `sb-access-token` | 7 jours | Session Supabase |
| `sb-refresh-token` | 30 jours | Renouvellement session |

**Base légale**: Contrat (Art. 6.1.b)  
**Consentement**: Non requis (strictement nécessaires)

### Cookies analytics (optionnels)

| Cookie | Durée | Usage |
|--------|-------|-------|
| `_ga` | 2 ans | Google Analytics (anonymisé) |
| `_ga_*` | 2 ans | Google Analytics (session) |

**Base légale**: Consentement (Art. 6.1.a)  
**Consentement**: Requis (bannière cookies)

### Bannière cookies

⚠️ **TODO**: Implémenter bannière conforme ePrivacy:
- Affichage au premier chargement
- Choix "Tout accepter" / "Tout refuser" / "Personnaliser"
- Mémorisation choix (cookie consent: 13 mois)
- Lien "Gérer cookies" dans footer

---

## CONFORMITÉ RGPD

### Registre des traitements

Conformément à l'article 30 du RGPD, nous maintenons un registre des activités de traitement.

**Localisation**: [Lien interne / Drive sécurisé]  
**Responsable**: DPO

### Analyse d'impact (PIA)

**Traitements à risque identifiés**:
- IA (OpenAI) → PIA effectuée ✅
- Import auto CA → PIA simple ✅

### Sous-traitance

Tous nos sous-traitants ont signé un DPA (Data Processing Agreement):
- Vercel ✅
- Supabase ✅
- Stripe ✅
- Resend ✅
- OpenAI ✅

### Formation équipe

- Formation RGPD initiale ✅
- Rappels semestriels ⏳

### Audits

- Auto-audit annuel ✅ (ce document)
- Audit externe: Prévu 2026

---

## CONTACT

### Exercice des droits

**Email**: dpo@comptalyze.com  
**Courrier**: [Adresse postale]  
**Délai de réponse**: 1 mois maximum

### Réclamation

Si vous n'êtes pas satisfait de notre réponse, vous avez le droit de saisir l'autorité de contrôle:

**CNIL**  
3 Place de Fontenoy  
TSA 80715  
75334 PARIS CEDEX 07  
Tél: 01 53 73 22 22  
https://www.cnil.fr/fr/plaintes

---

**Dernière mise à jour**: 2025-01-08  
**Prochaine revue**: Janvier 2026  
**Version**: 1.0.0

