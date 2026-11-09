import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Share, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { Press } from '../ui/Press';
import { Group, PlainButton, PrimaryButton, Row, Screen } from '../ui/Screen';
import { SKILL_NAME } from './Question';
import { type, useTheme } from '../theme';
import { LV, correctAnswer, estimate, skillStats, type Answer, type Skill } from '../engine';

const NAMES = ['Başlangıç', 'Temel', 'Orta', 'Orta üstü', 'İleri', 'Uzman'];
const DESC = [
  'Tanıdık günlük ifadeleri ve çok basit cümleleri anlıyorsun. Kendini tanıtabilir, basit sorular sorabilirsin.',
  'Kişisel bilgi, alışveriş, iş ve çevre gibi konulardaki sık kullanılan cümleleri anlıyorsun. Basit, rutin konuşmaları yürütebilirsin.',
  'İş, okul ve boş zaman gibi tanıdık konulardaki net konuşmaların ana fikrini anlıyorsun. Seyahatte karşılaşılan çoğu durumu idare edersin.',
  'Karmaşık metinlerin ana fikrini anlıyorsun. Anadili konuşanlarla rahat ve akıcı konuşabilir, geniş konularda ayrıntılı yazabilirsin.',
  'Uzun ve zor metinleri, örtük anlamları kavrıyorsun. Kendini akıcı ve doğal biçimde, akademik ve profesyonel amaçlarla ifade edebilirsin.',
  'Duyduğun ve okuduğun hemen her şeyi zahmetsiz anlıyorsun. İnce anlam farklarını bile doğru biçimde ifade edebilirsin.',
];
const R = 92;
const C = 2 * Math.PI * R;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function Result({ hist, onAgain, onHome }: { hist: Answer[]; onAgain: () => void; onHome: () => void }) {
  const t = useTheme();
  const lvl = estimate(hist);
  const answered = hist.filter((x) => !x.skipped);
  const skips = hist.length - answered.length;
  const score = answered.filter((x) => x.right).length;
  const stats = useMemo(() => skillStats(hist), [hist]);
  const wrong = hist.filter((x) => !x.right);
  const [open, setOpen] = useState(false);

  const fill = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.timing(fill, { toValue: (lvl + 1) / 6, duration: 1100, easing: Easing.bezier(0.32, 0.72, 0, 1), useNativeDriver: false }).start();
  }, []);

  const summary = `İngilizce seviyem: ${LV[lvl]} (${NAMES[lvl]}). ${answered.length} soruda ${score} doğru.`;

  return (
    <Screen
      title="Sonuç"
      right={{ label: 'Bitti', onPress: onHome }}
      bottom={<><PrimaryButton label="Tekrar Çöz" onPress={onAgain} /><PlainButton label="Ana Ekran" onPress={onHome} /></>}
    >
      <View style={{ alignItems: 'center', paddingTop: 8 }} accessible accessibilityLabel={`Seviyen ${LV[lvl]}, ${NAMES[lvl]}`}>
        <View style={{ width: 208, height: 208, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={208} height={208} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
            <Circle cx={104} cy={104} r={R} stroke={t.fill} strokeWidth={12} fill="none" />
            <AnimatedCircle
              cx={104} cy={104} r={R} stroke={t.blue} strokeWidth={12} fill="none" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={fill.interpolate({ inputRange: [0, 1], outputRange: [C, 0] })}
            />
          </Svg>
          <Text style={{ color: t.blue, fontSize: 68, fontWeight: '800', letterSpacing: -2.5 }}>{LV[lvl]}</Text>
          <Text style={[type.foot, { color: t.label2, fontSize: 15 }]}>{NAMES[lvl]}</Text>
        </View>
      </View>

      <Text style={[type.body, { color: t.label, textAlign: 'center', paddingHorizontal: 8 }]}>{DESC[lvl]}</Text>

      <Group>
        <View style={{ flexDirection: 'row', gap: 4, padding: 16 }}>
          {LV.map((n, i) => (
            <View key={n} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
              <View style={{ alignSelf: 'stretch', height: 6, borderRadius: 3, backgroundColor: i <= lvl ? t.blue : t.fill }} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: i === lvl ? t.blue : t.label2 }}>{n}</Text>
            </View>
          ))}
        </View>
      </Group>

      <View style={{ gap: 8 }}>
        <Text style={[type.cap, { color: t.label2, paddingHorizontal: 16 }]}>Beceriler</Text>
        <Group>
          {(Object.keys(SKILL_NAME) as Skill[]).filter((k) => stats[k]).map((k) => {
            const s = stats[k]!;
            return (
              <View key={k} style={{ minHeight: 48, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={[type.body, { color: t.label, width: 92 }]}>{SKILL_NAME[k]}</Text>
                <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: t.fill, overflow: 'hidden' }}>
                  <View style={{ height: 8, width: `${Math.round((s.r / s.n) * 100)}%`, backgroundColor: t.blue, borderRadius: 4 }} />
                </View>
                <Text style={[type.body, { color: t.label2, width: 44, textAlign: 'right', fontVariant: ['tabular-nums'] }]}>{s.r}/{s.n}</Text>
              </View>
            );
          })}
          <Row label="Toplam" value={`${score} / ${answered.length} doğru`} />
          {skips > 0 ? <Row label="Bilmiyorum" value={String(skips)} /> : <View />}
        </Group>
      </View>

      {wrong.length > 0 && (
        <Group>
          <Press onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} scale={0.99}
            style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}>
            <Text style={[type.body, { color: t.blue }]}>Yanlışlarını gözden geçir ({wrong.length})</Text>
            <Text style={[type.body, { color: t.blue }]}>{open ? '⌄' : '›'}</Text>
          </Press>
          {open ? <View>{wrong.map((x, i) => <Review key={i} a={x} first={i === 0} />)}</View> : <View />}
        </Group>
      )}

      <PlainButton label="Sonucumu paylaş" onPress={() => Share.share({ message: summary }).catch(() => {})} />
    </Screen>
  );
}

function Review({ a, first }: { a: Answer; first: boolean }) {
  const t = useTheme();
  return (
    <View style={{ padding: 16, gap: 3, borderTopWidth: first ? 0 : 0.5, borderTopColor: t.sep }}>
      <Text style={[type.foot, { color: t.label2 }]}>{LV[a.q.l]} · {SKILL_NAME[a.q.t]}</Text>
      {a.q.t === 'l' && <Text style={[type.foot, { color: t.label2 }]}>Metin: {a.q.say}</Text>}
      <Text style={[type.body, { color: t.label }]}>{a.q.q}</Text>
      <Text style={[type.body, { color: t.red }]}>{a.skipped ? 'Bilmiyorum dedin' : `Senin cevabın: ${a.given}`}</Text>
      <Text style={[type.body, { color: t.green }]}>Doğrusu: {correctAnswer(a.q)}</Text>
    </View>
  );
}
