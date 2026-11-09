import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Easing, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Press } from '../ui/Press';
import { PrimaryButton, Screen } from '../ui/Screen';
import { type, useTheme } from '../theme';
import { TOTAL, shuffle, shuffleMoved, type Question as Q, type Skill } from '../engine';

export const SKILL_NAME: Record<Skill, string> = {
  g: 'Dilbilgisi', v: 'Kelime', r: 'Okuma', w: 'Yazma', l: 'Dinleme', o: 'Sıralama',
};
const RATE = [0.8, 0.85, 0.92, 0.97, 1, 1];
const tick = () => Haptics.selectionAsync().catch(() => {});

interface Props {
  q: Q;
  index: number; // 1-based position among answered questions
  progress: number; // answered / TOTAL
  onSubmit: (given: string | null) => void; // null = "Bilmiyorum"
  onQuit: () => void;
}

export function Question({ q, index, progress, onSubmit, onQuit }: Props) {
  const t = useTheme();
  const options = useMemo(() => (q.o ? shuffle(q.o) : []), [q.id]);
  const tiles = useMemo(() => (q.words ? shuffleMoved(q.words.map((w, i) => ({ w, i }))) : []), [q.id]);

  const [sel, setSel] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<number[]>([]); // indexes into `tiles`
  const [skip, setSkip] = useState(false);
  const [plays, setPlays] = useState(3);
  const [playing, setPlaying] = useState(false);

  // Slide the whole question in from the right, like a navigation push.
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 420, easing: Easing.bezier(0.32, 0.72, 0, 1), useNativeDriver: true }).start();
    return () => { Speech.stop(); };
  }, []);

  const given: string | null = skip
    ? null
    : q.t === 'w' ? (text.trim() ? text : '')
    : q.t === 'o' ? (picked.length === tiles.length ? picked.map((k) => tiles[k].w).join(' ') : '')
    : sel ?? '';
  const ready = skip || !!given;
  const last = index >= TOTAL;

  const play = () => {
    if (plays <= 0 || !q.say) return;
    setPlays(plays - 1);
    setPlaying(true);
    const done = () => setPlaying(false);
    Speech.stop();
    Speech.speak(q.say, { language: 'en-US', rate: RATE[q.l], onDone: done, onStopped: done, onError: done });
  };
  const confirmQuit = () =>
    Alert.alert('Testten çıkmak istiyor musun?', 'Cevapların kaydedilmez.', [
      { text: 'Devam et', style: 'cancel' },
      { text: 'Testi bitir', style: 'destructive', onPress: onQuit },
    ]);
  const chooseSkip = () => { tick(); setSkip(true); setSel(null); setText(''); setPicked([]); };

  return (
    <Screen
      title={`${index} / ${TOTAL}`}
      left={{ label: 'Çık', onPress: confirmQuit }}
      progress={progress}
      bottom={<PrimaryButton label={last ? 'Bitir' : 'Devam'} disabled={!ready} onPress={() => onSubmit(skip ? null : given)} />}
    >
      <Animated.View style={{ gap: 24, opacity: enter, transform: [{ translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [36, 0] }) }] }}>
        <Text style={[type.cap, { color: t.label2 }]}>{SKILL_NAME[q.t]}</Text>

        {q.t === 'l' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: t.card, borderRadius: 14, padding: 16 }}>
            <Press
              onPress={play} disabled={plays <= 0} accessibilityRole="button" accessibilityLabel="Dinle" scale={0.94}
              style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: t.blue, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: t.onBlue, fontSize: 22, marginLeft: 3 }}>{playing ? '❚❚' : '▶'}</Text>
            </Press>
            <View style={{ flex: 1 }}>
              <Text style={[type.headline, { color: t.label }]}>
                {playing ? 'Çalıyor…' : plays === 3 ? 'Dinlemek için dokun' : plays > 0 ? 'Tekrar dinle' : 'Cevabını seç'}
              </Text>
              <Text style={[type.foot, { color: t.label2 }]}>{plays > 0 ? `${plays} dinleme hakkın var` : 'Dinleme hakkın bitti'}</Text>
            </View>
          </View>
        )}

        {q.p && (
          <View style={{ backgroundColor: t.card, borderRadius: 14, padding: 16 }}>
            <Text style={[type.body, { color: t.label, fontSize: 16, lineHeight: 23 }]}>{q.p}</Text>
          </View>
        )}

        <Text accessibilityRole="header" style={[type.title2, { color: t.label }]}>{q.q}</Text>

        {q.t === 'w' && (
          <TextInput
            value={text}
            onChangeText={(v) => { setText(v); if (v) setSkip(false); }}
            onSubmitEditing={() => text.trim() && onSubmit(text)}
            placeholder="Cevabını yaz" placeholderTextColor={t.label2}
            autoCapitalize="none" autoCorrect={false} spellCheck={false} returnKeyType="done"
            accessibilityLabel="Cevabın"
            style={{ height: 54, borderRadius: 14, paddingHorizontal: 16, fontSize: 17, color: t.label, backgroundColor: t.card }}
          />
        )}

        {q.t === 'o' && (
          <View style={{ gap: 16 }}>
            <View
              accessibilityLabel="Kurduğun cümle"
              style={{ minHeight: 68, flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12, backgroundColor: t.card, borderRadius: 14, alignContent: 'flex-start' }}
            >
              {picked.length === 0 && <Text style={[type.body, { color: t.label2, alignSelf: 'center' }]}>Kelimelere dokunarak cümleyi kur</Text>}
              {picked.map((k) => (
                <Chip key={k} label={tiles[k].w} accent onPress={() => { tick(); setPicked(picked.filter((x) => x !== k)); }} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {tiles.map((tile, k) => (
                <Chip key={k} label={tile.w} used={picked.includes(k)} onPress={() => { tick(); setSkip(false); setPicked([...picked, k]); }} />
              ))}
            </View>
          </View>
        )}

        {options.length > 0 && (
          <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
            {options.map((o, i) => (
              <Choice key={o} letter={'ABCD'[i]} label={o} selected={!skip && sel === o} onPress={() => { tick(); setSel(o); setSkip(false); }} />
            ))}
          </View>
        )}

        <Choice letter="?" label="Bilmiyorum" muted selected={skip} onPress={chooseSkip} />
      </Animated.View>
    </Screen>
  );
}

function Choice({ letter, label, selected, muted, onPress }: { letter: string; label: string; selected: boolean; muted?: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Press
      onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: selected }} accessibilityLabel={label} scale={0.975}
      style={{
        minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: t.card, borderRadius: 14, borderWidth: 2, borderColor: selected ? t.blue : 'transparent',
      }}
    >
      <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? t.blue : t.fill }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: selected ? t.onBlue : t.label2 }}>{letter}</Text>
      </View>
      <Text style={[type.body, { flex: 1, color: muted && !selected ? t.label2 : t.label }]}>{label}</Text>
    </Press>
  );
}

function Chip({ label, onPress, accent, used }: { label: string; onPress: () => void; accent?: boolean; used?: boolean }) {
  const t = useTheme();
  return (
    <Press
      onPress={onPress} disabled={used} scale={0.94} accessibilityRole="button" accessibilityLabel={label}
      style={{
        height: 44, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
        backgroundColor: accent ? t.blue + '24' : t.card, borderWidth: accent ? 0 : 0.5, borderColor: t.sep,
        opacity: used ? 0.22 : 1,
      }}
    >
      <Text style={[type.body, { color: accent ? t.blue : t.label }]}>{label}</Text>
    </Press>
  );
}
