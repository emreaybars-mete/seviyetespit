import React, { useState } from 'react';
import { Animated, Easing, ScrollView, Text, View, type LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Press } from './Press';
import { type, useTheme } from '../theme';

interface Props {
  title?: string;
  titleOnScroll?: boolean;
  left?: { label: string; onPress: () => void };
  right?: { label: string; onPress: () => void };
  progress?: number; // 0–1
  bottom?: React.ReactNode;
  children: React.ReactNode;
}

const NAV = 44;

/** Translucent nav bar and bottom bar over a scrolling column, like a stock iOS screen. */
export function Screen({ title, titleOnScroll, left, right, progress, bottom, children }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [barH, setBarH] = useState(0);
  const [scrolled, setScrolled] = useState(0);
  const p = React.useRef(new Animated.Value(progress ?? 0)).current;
  React.useEffect(() => {
    if (progress != null) Animated.timing(p, { toValue: progress, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [progress, p]);
  const showTitle = !!title && (!titleOnScroll || scrolled > 44);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        scrollEventThrottle={16}
        onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y)}
        contentContainerStyle={{
          paddingTop: insets.top + NAV + 8,
          paddingBottom: barH + 24,
          paddingLeft: Math.max(16, insets.left),
          paddingRight: Math.max(16, insets.right),
          gap: 24,
        }}
      >
        {children}
      </ScrollView>

      <BlurView
        intensity={70}
        tint={t.blur}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, paddingTop: insets.top,
          borderBottomWidth: scrolled > 4 ? 0.5 : 0, borderBottomColor: t.sep,
        }}
      >
        <View style={{ height: NAV, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Math.max(16, insets.left) }}>
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            {left && (
              <Press onPress={left.onPress} accessibilityRole="button" hitSlop={12} scale={0.95}>
                <Text style={[type.body, { color: t.blue }]}>{left.label}</Text>
              </Press>
            )}
          </View>
          <Text style={[type.headline, { color: t.label, opacity: showTitle ? 1 : 0, fontVariant: ['tabular-nums'] }]}>{title}</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            {right && (
              <Press onPress={right.onPress} accessibilityRole="button" hitSlop={12} scale={0.95}>
                <Text style={[type.headline, { color: t.blue }]}>{right.label}</Text>
              </Press>
            )}
          </View>
        </View>
        {progress != null && (
          <View style={{ height: 3 }}>
            <Animated.View
              style={{ height: 3, backgroundColor: t.blue, borderTopRightRadius: 2, borderBottomRightRadius: 2,
                width: p.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }}
            />
          </View>
        )}
      </BlurView>

      {bottom && (
        <BlurView
          intensity={70}
          tint={t.blur}
          onLayout={(e: LayoutChangeEvent) => setBarH(e.nativeEvent.layout.height)}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, gap: 6,
            paddingTop: 12, paddingBottom: Math.max(12, insets.bottom),
            paddingLeft: Math.max(16, insets.left), paddingRight: Math.max(16, insets.right),
            borderTopWidth: 0.5, borderTopColor: t.sep,
          }}
        >
          {bottom}
        </BlurView>
      )}
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const t = useTheme();
  return (
    <Press
      onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={{ height: 52, borderRadius: 14, backgroundColor: t.blue, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={[type.headline, { color: t.onBlue }]}>{label}</Text>
    </Press>
  );
}

export function PlainButton({ label, onPress }: { label: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Press onPress={onPress} accessibilityRole="button" style={{ height: 44, alignItems: 'center', justifyContent: 'center' }} scale={0.96}>
      <Text style={[type.body, { color: t.blue }]}>{label}</Text>
    </Press>
  );
}

export function Group({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  const items = React.Children.toArray(children);
  return (
    <View style={{ backgroundColor: t.card, borderRadius: 14, overflow: 'hidden' }}>
      {items.map((c, i) => (
        <View key={i} style={i ? { borderTopWidth: 0.5, borderTopColor: t.sep, marginLeft: 16 } : undefined}>
          <View style={i ? { marginLeft: -16 } : undefined}>{c}</View>
        </View>
      ))}
    </View>
  );
}

export function Row({ label, value }: { label: string; value?: string }) {
  const t = useTheme();
  return (
    <View style={{ minHeight: 48, paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <Text style={[type.body, { color: t.label }]}>{label}</Text>
      {value != null && <Text style={[type.body, { color: t.label2, flexShrink: 1, textAlign: 'right', fontVariant: ['tabular-nums'] }]}>{value}</Text>}
    </View>
  );
}
