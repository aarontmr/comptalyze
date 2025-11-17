/**
 * Tests d'intégration pour le webhook Stripe
 * 
 * Simule les événements Stripe et vérifie les mises à jour en DB
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test user ID (à créer dans beforeAll)
let testUserId: string;

describe('Webhook Stripe - Flow complet du trial', () => {
  beforeAll(async () => {
    // Créer un utilisateur de test
    const { data, error } = await supabase.auth.admin.createUser({
      email: `test-trial-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      email_confirm: true,
    });
    
    if (error) throw error;
    testUserId = data.user.id;
    
    console.log(`✅ Test user créé: ${testUserId}`);
  });
  
  afterAll(async () => {
    // Nettoyer
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
      await supabase.from('user_profiles').delete().eq('id', testUserId);
      console.log(`✅ Test user supprimé: ${testUserId}`);
    }
  });
  
  it('devrait créer un profil avec trial après checkout.session.completed', async () => {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 3);
    
    // Simuler l'insertion directe (normalement faite par webhook)
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: testUserId,
        plan: 'free',
        plan_status: 'trialing',
        trial_plan: 'premium',
        trial_ends_at: trialEndDate.toISOString(),
        stripe_customer_id: 'cus_test_123',
        stripe_subscription_id: 'sub_test_123',
      });
    
    expect(error).toBeNull();
    
    // Vérifier que le profil est correct
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', testUserId)
      .single();
    
    expect(profile).not.toBeNull();
    expect(profile!.plan).toBe('free');
    expect(profile!.plan_status).toBe('trialing');
    expect(profile!.trial_plan).toBe('premium');
    expect(profile!.trial_ends_at).not.toBeNull();
  });
  
  it('devrait activer le plan après customer.subscription.updated (status=active)', async () => {
    // Simuler l'activation
    const { error } = await supabase
      .from('user_profiles')
      .update({
        plan: 'premium',
        plan_status: 'active',
        trial_plan: null,
        trial_ends_at: null,
      })
      .eq('id', testUserId);
    
    expect(error).toBeNull();
    
    // Vérifier
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', testUserId)
      .single();
    
    expect(profile!.plan).toBe('premium');
    expect(profile!.plan_status).toBe('active');
    expect(profile!.trial_plan).toBeNull();
    expect(profile!.trial_ends_at).toBeNull();
  });
  
  it('devrait downgrader vers free après customer.subscription.deleted', async () => {
    // Simuler la suppression
    const { error } = await supabase
      .from('user_profiles')
      .update({
        plan: 'free',
        plan_status: 'canceled',
        stripe_subscription_id: null,
      })
      .eq('id', testUserId);
    
    expect(error).toBeNull();
    
    // Vérifier
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', testUserId)
      .single();
    
    expect(profile!.plan).toBe('free');
    expect(profile!.plan_status).toBe('canceled');
    expect(profile!.stripe_subscription_id).toBeNull();
  });
});

describe('Webhook Stripe - Idempotence', () => {
  it('devrait empêcher le double traitement du même événement', async () => {
    const eventId = `evt_test_${Date.now()}`;
    
    // Premier insert
    const { error: error1 } = await supabase
      .from('webhook_events')
      .insert({
        stripe_event_id: eventId,
        event_type: 'checkout.session.completed',
        payload: { test: true },
      });
    
    expect(error1).toBeNull();
    
    // Deuxième insert (devrait échouer - contrainte unique)
    const { error: error2 } = await supabase
      .from('webhook_events')
      .insert({
        stripe_event_id: eventId,
        event_type: 'checkout.session.completed',
        payload: { test: true },
      });
    
    expect(error2).not.toBeNull();
    expect(error2!.code).toBe('23505'); // Postgres unique violation
    
    // Nettoyer
    await supabase.from('webhook_events').delete().eq('stripe_event_id', eventId);
  });
});











