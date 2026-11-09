import React from 'react';
import { Text, View } from 'react-native';
import { Group, PrimaryButton, Row, Screen } from '../ui/Screen';
import { TOTAL } from '../engine';
import { type, useTheme } from '../theme';

export function Home({ onStart }: { onStart: () => void }) {
  const t = useTheme();
  return (
    <Screen title="Seviye" titleOnScroll bottom={<PrimaryButton label="Teste Başla" onPress={onStart} />}>
      <View style={{ gap: 14, alignItems: 'flex-start', paddingTop: 4 }}>
        <View style={{ width: 76, height: 76, borderRadius: 18, backgroundColor: t.blue, alignItems: 'center', justifyContent: 'center' }} accessible={false}>
          <Text style={{ color: t.onBlue, fontSize: 32, fontWeight: '700', letterSpacing: -1 }}>Aa</Text>
        </View>
        <Text accessibilityRole="header" style={[type.large, { color: t.label }]}>İngilizce seviyeni öğren</Text>
        <Text style={[type.body, { color: t.label2 }]}>
          {TOTAL} soruda CEFR seviyeni bul. Sorular cevaplarına göre zorlaşır ya da kolaylaşır.
        </Text>
      </View>
      <Group>
        <Row label="Soru sayısı" value={String(TOTAL)} />
        <Row label="Süre" value="yaklaşık 20 dk" />
        <Row label="Ölçek" value="A1 – C2" />
        <Row label="Bölümler" value="Dilbilgisi, Kelime, Okuma, Yazma, Dinleme, Kelime sıralama" />
      </Group>
      <Text style={[type.foot, { color: t.label2, paddingHorizontal: 16 }]}>
        Sözlük kullanma. Bilmiyorsan “Bilmiyorum”u seç. Tahmin yürütme; yerine yeni bir soru gelir. Dinleme soruları için sesi aç.
      </Text>
    </Screen>
  );
}
