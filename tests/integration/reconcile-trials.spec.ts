/**
 * Tests d'intégration pour le cron de réconciliation des trials
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

let testUserId: string;

describe('Cron: Réconciliation des trials expirés', () => {
  beforeAll(async () => {
    // Créer un utilisateur de test
    const { data, error } = await supabase.auth.admin.createUser({
      email: `test-reconcile-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      email_confirm: true,
    });
    
    if (error) throw error;
    testUserId = data.user.id;
  });
  
  afterAll(async () => {
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
      await supabase.from('user_profiles').delete().eq('id', testUserId);
    }
  });
  
  it('devrait downgrader un trial expiré vers free', async () => {
    // Créer un trial expiré (hier)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await supabase
      .from('user_profiles')
      .upsert({
        id: testUserId,
        plan: 'free',
        plan_status: 'trialing',
        trial_plan: 'pro',
        trial_ends_at: yesterday.toISOString(),
        stripe_customer_id: 'cus_test_expired',
      });
    
    // Récupérer les trials expirés (simulation du cron)
    const { data: expiredTrials } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('plan_status', 'trialing')
      .lt('trial_ends_at', new Date().toISOString());
    
    expect(expiredTrials).not.toBeNull();
    expect(expiredTrials!.length).toBeGreaterThan(0);
    
    // Downgrader
    for (const profile of expiredTrials!) {
      await supabase
        .from('user_profiles')
        .update({
          plan: 'free',
          plan_status: 'canceled',
          trial_plan: null,
          trial_ends_at: null,
        })
        .eq('id', profile.id);
    }
    
    // Vérifier
    const { data: updatedProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', testUserId)
      .single();
    
    expect(updatedProfile!.plan).toBe('free');
    expect(updatedProfile!.plan_status).toBe('canceled');
    expect(updatedProfile!.trial_plan).toBeNull();
  });
  
  it('ne devrait pas toucher un trial encore valide', async () => {
    // Créer un trial valide (dans 2 jours)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    
    await supabase
      .from('user_profiles')
      .upsert({
        id: testUserId,
        plan: 'free',
        plan_status: 'trialing',
        trial_plan: 'premium',
        trial_ends_at: tomorrow.toISOString(),
      });
    
    // Récupérer les trials expirés
    const { data: expiredTrials } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', testUserId)
      .eq('plan_status', 'trialing')
      .lt('trial_ends_at', new Date().toISOString());
    
    // Ne devrait pas trouver le trial (encore valide)
    expect(expiredTrials).not.toBeNull();
    expect(expiredTrials!.length).toBe(0);
  });
});















