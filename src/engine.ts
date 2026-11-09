import bankJson from './data/bank.json';

export type Skill = 'g' | 'v' | 'r' | 'w' | 'l' | 'o';

export interface Question {
  id: number;
  l: number; // CEFR level index, 0 = A1 … 5 = C2
  t: Skill;
  q: string;
  p?: string; // reading passage
  o?: string[]; // multiple-choice options
  a?: number; // index of the correct option
  ans?: string[]; // accepted typed answers
  say?: string; // text spoken aloud (listening)
  words?: string[]; // word-ordering tiles, in the correct order
  s?: string; // word-ordering solution
  alt?: string[]; // other accepted word orders
}

export interface Answer {
  q: Question;
  right: boolean;
  skipped: boolean;
  given: string;
}

export interface Session {
  n: number; // answered questions (skips don't count)
  served: number; // all questions shown, skips included
  lvl: number; // current target level
  hist: Answer[];
  used: number[]; // question ids already shown
}

export const BANK = bankJson as Question[];
export const LV = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export const TOTAL = 50;
export const MAXQ = 75;
export const START = 2;

/** Lowercase, straighten apostrophes, drop punctuation, collapse spaces. */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.?!,;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function newSession(): Session {
  return { n: 0, served: 0, lvl: START, hist: [], used: [] };
}

export function shuffle<T>(a: T[], rng: () => number = Math.random): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Shuffle that never returns the original order (so ordering tiles aren't pre-solved). */
export function shuffleMoved<T>(a: T[], rng: () => number = Math.random): T[] {
  if (a.length < 2) return a.slice();
  let b: T[];
  do {
    b = shuffle(a, rng);
  } while (b.every((x, i) => x === a[i]));
  return b;
}

export function isFinished(s: Session): boolean {
  return s.n >= TOTAL || s.served >= MAXQ;
}

/**
 * Next question: the closest level to the target that still has unused questions,
 * never the same skill twice in a row when avoidable. Listening is skipped when
 * the device can't speak.
 */
export function pick(
  s: Session,
  opts: { speech: boolean } = { speech: true },
  rng: () => number = Math.random,
): Question | undefined {
  const used = new Set(s.used);
  const last = s.hist.length ? s.hist[s.hist.length - 1].q.t : null;
  for (let d = 0; d < 6; d++) {
    for (const l of d ? [s.lvl - d, s.lvl + d] : [s.lvl]) {
      if (l < 0 || l > 5) continue;
      const pool = BANK.filter((q) => q.l === l && !used.has(q.id) && (opts.speech || q.t !== 'l'));
      if (pool.length) {
        const alt = pool.filter((q) => q.t !== last);
        const c = alt.length ? alt : pool;
        return c[Math.floor(rng() * c.length)];
      }
    }
  }
  return undefined;
}

export function correctAnswer(q: Question): string {
  if (q.t === 'o') return q.s!;
  if (q.t === 'w') return q.ans![0];
  return q.o![q.a!];
}

export function isCorrect(q: Question, given: string): boolean {
  if (q.t === 'o') return [q.s!, ...(q.alt ?? [])].some((a) => norm(a) === norm(given));
  if (q.t === 'w') return q.ans!.some((a) => norm(a) === norm(given));
  return q.o![q.a!] === given;
}

/** Record an answer (`given` = null means "Bilmiyorum") and return the next session state. */
export function record(s: Session, q: Question, given: string | null): Session {
  const skipped = given === null;
  const right = !skipped && isCorrect(q, given);
  return {
    n: skipped ? s.n : s.n + 1,
    served: s.served + 1,
    lvl: right ? Math.min(5, s.lvl + 1) : Math.max(0, s.lvl - 1),
    hist: [...s.hist, { q, right, skipped, given: given ?? '' }],
    used: [...s.used, q.id],
  };
}

/** Each answer counts as its level +0.5 (correct) or -0.5 (wrong or skipped); the last 30 are averaged. */
export function estimate(hist: Answer[]): number {
  const h = hist.slice(-30);
  if (!h.length) return 0;
  const m = h.reduce((sum, x) => sum + x.q.l + (x.right ? 0.5 : -0.5), 0) / h.length;
  // Nobody is placed more than one level above the hardest question they actually got right.
  // Without this, a run of skips that forces the picker into harder leftovers inflates the average.
  const hiRight = h.reduce((hi, x) => (x.right ? Math.max(hi, x.q.l) : hi), -1);
  return Math.max(0, Math.min(5, hiRight + 1, Math.round(m - 0.01)));
}

export function skillStats(hist: Answer[]) {
  const out: Partial<Record<Skill, { r: number; n: number }>> = {};
  for (const x of hist) {
    if (x.skipped) continue;
    const s = (out[x.q.t] ??= { r: 0, n: 0 });
    s.n++;
    if (x.right) s.r++;
  }
  return out;
}
