import React, { useRef } from 'react';
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

/** Pressable that scales down the instant the finger lands and springs back on release. */
export function Press({
  style, scale = 0.97, children, ...rest
}: PressableProps & { style?: StyleProp<ViewStyle>; scale?: number; children: React.ReactNode }) {
  const v = useRef(new Animated.Value(1)).current;
  const to = (x: number) => Animated.spring(v, { toValue: x, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
  return (
    <Pressable {...rest} onPressIn={() => to(scale)} onPressOut={() => to(1)}>
      <Animated.View style={[style, { transform: [{ scale: v }] }, rest.disabled ? { opacity: 0.3 } : null]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
