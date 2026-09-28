import 'server-only';
import { getServerSupabase } from './serverSupabase';

export type LetterKind = 'free_download' | 'paid_generation';
const limits: Record<LetterKind, number> = { free_download: 3, paid_generation: 5 };
export const monthStartUTC = () => new Date().toISOString().slice(0, 7) + '-01';

export async function usageFor(userId: string, kind: LetterKind) {
  const db = getServerSupabase();
  if (!db) throw new Error('Database unavailable');
  const { count, error } = await db.from('letter_usage').select('id', { count: 'exact', head: true })
    .eq('user_id', userId).eq('kind', kind).eq('period_start', monthStartUTC())
    .eq('status', 'complete');
  if (error) throw error;
  return { used: count ?? 0, limit: limits[kind] };
}

export async function reserveSlot(userId: string, kind: LetterKind) {
  const db = getServerSupabase();
  if (!db) throw new Error('Database unavailable');
  const { data, error } = await db.rpc('reserve_letter_slot', {
    p_user_id: userId, p_kind: kind, p_limit: limits[kind],
  });
  if (error) throw error;
  return data as string | null;
}

export async function finishSlot(userId: string, id: string) {
  const db = getServerSupabase();
  if (!db) throw new Error('Database unavailable');
  const { error } = await db.rpc('complete_letter_slot', { p_user_id: userId, p_id: id });
  if (error) throw error;
}

export async function releaseSlot(userId: string, id: string) {
  const db = getServerSupabase();
  if (!db) return;
  await db.rpc('release_letter_slot', { p_user_id: userId, p_id: id });
}
