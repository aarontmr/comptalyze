# Script de démarrage du serveur Next.js
# Ce script contourne les problèmes de cross-env sur Windows

Write-Host "=== Demarrage du serveur Comptalyze ===" -ForegroundColor Cyan

# Arrêter les anciens processus Node.js
Write-Host "`n1. Nettoyage des anciens processus..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# Supprimer le cache .next si nécessaire
if (Test-Path .next\dev\lock) {
    Write-Host "2. Suppression du fichier de lock..." -ForegroundColor Yellow
    Remove-Item .next\dev\lock -Force -ErrorAction SilentlyContinue
}

Write-Host "3. Configuration des variables d'environnement..." -ForegroundColor Yellow
$env:NODE_OPTIONS = "--max-old-space-size=8192"
$env:NEXT_PRIVATE_TURBOPACK = "false"

Write-Host "4. Demarrage de Next.js..." -ForegroundColor Yellow
Write-Host "`n✅ Serveur en cours de demarrage...`n" -ForegroundColor Green

# Lancer Next.js
npx next dev





