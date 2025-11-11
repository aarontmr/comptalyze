/**
 * Tests unitaires pour getUserPlan
 */

import { describe, it, expect, jest } from '@jest/globals';

// Mock de Supabase
const mockSupabaseQuery = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: mockSupabaseQuery,
        })),
      })),
    })),
  })),
}));

describe('getUserPlan', () => {
  it('devrait retourner le plan effectif = trial_plan si en trial actif', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    mockSupabaseQuery.mockResolvedValueOnce({
      data: {
        plan: 'free',
        plan_status: 'trialing',
        trial_plan: 'premium',
        trial_ends_at: tomorrow.toISOString(),
      },
      error: null,
    });
    
    // Import dynamique pour que le mock fonctionne
    const { getUserPlan } = await import('../app/lib/billing/getUserPlan');
    
    const result = await getUserPlan('test-user-id');
    
    expect(result.effectivePlan).toBe('premium');
    expect(result.isTrialing).toBe(true);
    expect(result.plan).toBe('free');
  });
  
  it('devrait retourner plan = free si trial expiré', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    mockSupabaseQuery.mockResolvedValueOnce({
      data: {
        plan: 'free',
        plan_status: 'trialing',
        trial_plan: 'pro',
        trial_ends_at: yesterday.toISOString(),
      },
      error: null,
    });
    
    const { getUserPlan } = await import('../app/lib/billing/getUserPlan');
    
    const result = await getUserPlan('test-user-id');
    
    expect(result.effectivePlan).toBe('free');
    expect(result.isTrialing).toBe(false);
  });
  
  it('devrait retourner le plan payant si actif', async () => {
    mockSupabaseQuery.mockResolvedValueOnce({
      data: {
        plan: 'premium',
        plan_status: 'active',
        trial_plan: null,
        trial_ends_at: null,
      },
      error: null,
    });
    
    const { getUserPlan } = await import('../app/lib/billing/getUserPlan');
    
    const result = await getUserPlan('test-user-id');
    
    expect(result.effectivePlan).toBe('premium');
    expect(result.isTrialing).toBe(false);
    expect(result.plan).toBe('premium');
  });
});

