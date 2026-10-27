/**
 * Waitlist count shown in the launch strip.
 * Phase 1: no database yet, so this returns null and the count is hidden.
 * Phase 2 replaces this with a Supabase count.
 */
export async function getWaitlistCount(): Promise<number | null> {
  return null;
}
