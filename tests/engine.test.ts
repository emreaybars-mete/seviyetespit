import test from 'node:test';
import assert from 'node:assert/strict';
import { BANK, LV, MAXQ, TOTAL, estimate, isCorrect, isFinished, newSession, norm, pick, record, shuffleMoved, skillStats, type Session } from '../src/engine';

function mulberry(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A simulated test taker who knows everything up to `ability` and nothing above it.
function run(ability: number, seed: number, skipAbove = false): Session {
  const rng = mulberry(seed);
  let s = newSession();
  while (!isFinished(s)) {
    const q = pick(s, { speech: true }, rng);
    if (!q) break;
    const knows = q.l <= ability;
    if (knows) {
      const given = q.t === 'o' ? q.s! : q.t === 'w' ? q.ans![0] : q.o![q.a!];
      s = record(s, q, given);
    } else if (skipAbove) {
      s = record(s, q, null);
    } else {
      s = record(s, q, q.t === 'w' || q.t === 'o' ? 'zzz' : q.o!.find((_, i) => i !== q.a)!);
    }
  }
  return s;
}

test('bank is well formed', () => {
  assert.equal(new Set(BANK.map((q) => q.id)).size, BANK.length);
  for (const q of BANK) {
    if (q.t === 'w') assert.ok(q.ans?.length, `w ${q.id}`);
    else if (q.t === 'o') {
      const words = q.words!;
      assert.ok(words && q.s, `o ${q.id}`);
      assert.equal(norm(words.join(' ')), norm(q.s!), `o ${q.id}`);
      for (const a of q.alt ?? []) assert.deepEqual([...norm(a).split(' ')].sort(), [...words].sort(), `alt ${q.id}`);
    } else {
      assert.ok(q.o && q.a! >= 0 && q.a! < q.o.length, `mc ${q.id}`);
      if (q.t === 'l') assert.ok(q.say, `l ${q.id}`);
    }
  }
  for (let l = 0; l < 6; l++) assert.ok(BANK.filter((q) => q.l === l).length >= 20);
});

test('answer checking ignores case, punctuation and curly apostrophes', () => {
  const w = BANK.find((q) => q.t === 'w' && q.ans!.includes("don't have"))!;
  assert.ok(isCorrect(w, "Don’t have."));
  assert.ok(!isCorrect(w, 'has'));
  const o = BANK.find((q) => q.alt?.length)!;
  assert.ok(isCorrect(o, o.alt![0]));
});

test('a skip does not use up one of the 50 answers', () => {
  let s = newSession();
  const q = pick(s)!;
  s = record(s, q, null);
  assert.equal(s.n, 0);
  assert.equal(s.served, 1);
  assert.equal(s.lvl, 1);
  assert.equal(s.hist[0].right, false);
});

test('the test ends after 50 answers and never repeats a question', () => {
  const s = run(3, 1);
  assert.equal(s.n, TOTAL);
  assert.equal(new Set(s.used).size, s.used.length);
});

test('skipping everything stops at the cap instead of looping forever', () => {
  const s = run(-1, 2, true);
  assert.equal(s.n, 0);
  assert.equal(s.served, MAXQ);
  assert.equal(estimate(s.hist), 0);
});

test('estimate lands at (or next to) the simulated ability', () => {
  for (let ability = 0; ability <= 5; ability++) {
    const misses: number[] = [];
    for (let seed = 1; seed <= 30; seed++) {
      const est = estimate(run(ability, seed).hist);
      misses.push(Math.abs(est - ability));
    }
    const exact = misses.filter((m) => m === 0).length;
    const far = misses.filter((m) => m > 1).length;
    console.log(`ability ${LV[ability]}: exact ${exact}/30, off by 2+ ${far}/30`);
    assert.equal(far, 0, `ability ${LV[ability]}`);
  }
});

test('listening is left out when the device cannot speak', () => {
  const rng = mulberry(5);
  let s = newSession();
  for (let i = 0; i < 40; i++) {
    const q = pick(s, { speech: false }, rng)!;
    assert.notEqual(q.t, 'l');
    s = record(s, q, null);
  }
});

test('word tiles are never handed over already solved', () => {
  const rng = mulberry(9);
  for (const q of BANK.filter((x) => x.t === 'o')) {
    for (let i = 0; i < 20; i++) assert.notDeepEqual(shuffleMoved(q.words!, rng), q.words);
  }
});

test('skill stats ignore skipped questions', () => {
  let s = newSession();
  const q = BANK.find((x) => x.t === 'g')!;
  s = record(s, q, q.o![q.a!]);
  s = record(s, q, null);
  assert.deepEqual(skillStats(s.hist).g, { r: 1, n: 1 });
});
