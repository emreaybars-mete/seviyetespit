import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Home } from './src/screens/Home';
import { Question } from './src/screens/Question';
import { Result } from './src/screens/Result';
import { TOTAL, isFinished, newSession, pick, record, type Question as Q, type Session } from './src/engine';

type Phase = 'home' | 'test' | 'result';

export default function App() {
  const [phase, setPhase] = useState<Phase>('home');
  const [session, setSession] = useState<Session>(newSession());
  const [q, setQ] = useState<Q | null>(null);

  const advance = (s: Session) => {
    const next = isFinished(s) ? undefined : pick(s);
    if (!next) { setPhase('result'); setQ(null); } else { setQ(next); setPhase('test'); }
  };
  const start = () => { const s = newSession(); setSession(s); advance(s); };
  const submit = (given: string | null) => {
    if (!q) return;
    const s = record(session, q, given);
    setSession(s);
    advance(s);
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {phase === 'home' && <Home onStart={start} />}
      {phase === 'test' && q && (
        <Question key={q.id} q={q} index={session.n + 1} progress={session.n / TOTAL} onSubmit={submit} onQuit={() => setPhase('home')} />
      )}
      {phase === 'result' && <Result hist={session.hist} onAgain={start} onHome={() => setPhase('home')} />}
    </SafeAreaProvider>
  );
}
