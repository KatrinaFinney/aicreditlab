import { isValidCreditAnswers, type CreditAnswers, type CreditGoal } from './creditPlan';
export const PLAN_DRAFT_KEY = 'creditlab-plan-draft-v1';
export type PlanDraft = { version: 1; owner: string | null; goal: CreditGoal; answers: CreditAnswers; step: number; newPlan?: boolean; updatedAt: number };
export function readPlanDraft(raw: string | null, userId: string | null, now = Date.now()): PlanDraft | null {
  try {
    if (!raw) return null;
    const value = JSON.parse(raw) as PlanDraft;
    if (value.version !== 1 || (value.owner !== null && value.owner !== userId) ||
        !['personal', 'business'].includes(value.goal) || !Number.isInteger(value.step) || value.step < 0 || value.step > 4 ||
        !Number.isFinite(value.updatedAt) || value.updatedAt > now || now - value.updatedAt > 86400000 ||
        !value.answers || typeof value.answers !== 'object' || Array.isArray(value.answers)) return null;
    // Accept incomplete answers only when every present question is valid.
    const completed = { 1: [], 2: [], 3: [], ...value.answers };
    for (const id of [1, 2, 3]) {
      if (!Array.isArray(completed[id as keyof typeof completed])) return null;
    }
    if (Object.keys(value.answers).some(key => !['1', '2', '3'].includes(key))) return null;
    // Fill missing answers with valid defaults to reuse the server's validation.
    const defaults = value.goal === 'business' ? ['Still planning', 'Build a business credit history', 'On-time payments'] : ['Errors on my report', 'Increase credit score', 'I budget carefully'];
    const checked = Object.fromEntries([1, 2, 3].map((id, index) => [id, value.answers[id]?.length ? value.answers[id] : [defaults[index]]]));
    if (!isValidCreditAnswers(checked, value.goal)) return null;
    if (value.step === 4 && !isValidCreditAnswers(value.answers, value.goal)) return null;
    return { ...value, owner: userId, step: value.step };
  } catch { return null; }
}
