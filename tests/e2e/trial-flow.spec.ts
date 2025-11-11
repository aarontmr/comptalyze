/**
 * Test E2E: Flow complet d'un trial
 * 
 * Utilise Playwright pour tester l'expérience utilisateur
 */

import { test, expect } from '@playwright/test';

// Note: Ces tests nécessitent un environnement de test configuré
// et potentiellement des mocks Stripe

test.describe('Flow du trial de 3 jours', () => {
  test.skip('devrait permettre de démarrer un trial depuis la page pricing', async ({ page }) => {
    // 1) Se connecter (utiliser un compte de test)
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Attendre la redirection
    await page.waitForURL('/dashboard');
    
    // 2) Aller sur pricing
    await page.goto('/pricing');
    
    // 3) Cliquer sur "Essayer Premium"
    await page.click('text=Essayer Premium');
    
    // 4) Devrait rediriger vers Stripe Checkout
    await page.waitForURL(/checkout\.stripe\.com/);
    
    // Vérifier que c'est bien un mode trial
    const pageContent = await page.content();
    expect(pageContent).toContain('trial');
  });
  
  test.skip('devrait afficher le badge de trial après activation', async ({ page }) => {
    // Connexion avec un compte en trial
    await page.goto('/login');
    await page.fill('input[name="email"]', 'trial-user@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard');
    
    // Vérifier la présence du badge de trial
    const trialBadge = page.locator('text=Essai gratuit');
    await expect(trialBadge).toBeVisible();
    
    // Vérifier le compte à rebours
    const countdown = page.locator('text=/\\d+ jour.*restant/');
    await expect(countdown).toBeVisible();
  });
  
  test.skip('devrait bloquer les features premium pour un compte free', async ({ page }) => {
    // Connexion avec un compte free
    await page.goto('/login');
    await page.fill('input[name="email"]', 'free-user@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard');
    
    // Essayer d'accéder à une feature premium (ex: ComptaBot)
    await page.goto('/dashboard/comptabot');
    
    // Devrait afficher l'overlay de gating
    const upgradePrompt = page.locator('text=Fonctionnalité Premium');
    await expect(upgradePrompt).toBeVisible();
    
    // Vérifier le CTA d'upgrade
    const upgradeButton = page.locator('text=Passer à Premium');
    await expect(upgradeButton).toBeVisible();
  });
});

test.describe('PlanGate - Gating des fonctionnalités', () => {
  test.skip('devrait permettre l\'accès aux features premium pendant le trial', async ({ page }) => {
    // Connexion avec un compte en trial premium
    await page.goto('/login');
    await page.fill('input[name="email"]', 'trial-premium@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard');
    
    // Accéder à une feature premium
    await page.goto('/dashboard/comptabot');
    
    // Ne devrait PAS afficher l'overlay de gating
    const upgradePrompt = page.locator('text=Fonctionnalité Premium');
    await expect(upgradePrompt).not.toBeVisible();
    
    // Devrait afficher le contenu
    const chatbot = page.locator('[data-testid="comptabot"]');
    await expect(chatbot).toBeVisible();
  });
});

