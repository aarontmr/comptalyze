/**
 * Guest Limiter - Permet 3 simulations gratuites avant de demander l'inscription
 */

const GUEST_SIMULATIONS_KEY = "guest_simulation_count";
const MAX_FREE_SIMULATIONS = 3;

export interface GuestLimiterResult {
  count: number;
  remaining: number;
  hasReachedLimit: boolean;
}

/**
 * Get current guest simulation count
 */
export function getGuestSimulationCount(): GuestLimiterResult {
  if (typeof window === "undefined") {
    return { count: 0, remaining: MAX_FREE_SIMULATIONS, hasReachedLimit: false };
  }

  const countStr = localStorage.getItem(GUEST_SIMULATIONS_KEY);
  const count = countStr ? parseInt(countStr, 10) : 0;
  const remaining = Math.max(0, MAX_FREE_SIMULATIONS - count);
  const hasReachedLimit = count >= MAX_FREE_SIMULATIONS;

  return { count, remaining, hasReachedLimit };
}

/**
 * Increment guest simulation count
 * Returns true if successful, false if limit reached
 */
export function incrementGuestSimulation(): boolean {
  if (typeof window === "undefined") return false;

  const { count, hasReachedLimit } = getGuestSimulationCount();

  if (hasReachedLimit) {
    return false;
  }

  const newCount = count + 1;
  localStorage.setItem(GUEST_SIMULATIONS_KEY, newCount.toString());

  console.log(`📊 Guest simulation count: ${newCount}/${MAX_FREE_SIMULATIONS}`);

  return true;
}

/**
 * Reset guest simulation count (e.g., after signup)
 */
export function resetGuestSimulationCount() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(GUEST_SIMULATIONS_KEY);
  console.log("✅ Guest simulation count reset");
}

/**
 * Check if user can simulate (as guest)
 */
export function canSimulateAsGuest(): boolean {
  const { hasReachedLimit } = getGuestSimulationCount();
  return !hasReachedLimit;
}

