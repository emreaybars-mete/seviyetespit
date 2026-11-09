import { useColorScheme } from 'react-native';

export const light = {
  bg: '#F2F2F7', card: '#FFFFFF', label: '#000000', label2: 'rgba(60,60,67,0.6)',
  sep: 'rgba(60,60,67,0.16)', blue: '#007AFF', onBlue: '#FFFFFF', green: '#34C759', red: '#FF3B30',
  fill: 'rgba(120,120,128,0.12)', blur: 'systemChromeMaterialLight' as const,
};
export const dark: typeof light = {
  bg: '#000000', card: '#1C1C1E', label: '#FFFFFF', label2: 'rgba(235,235,245,0.6)',
  sep: 'rgba(84,84,88,0.55)', blue: '#0A84FF', onBlue: '#FFFFFF', green: '#30D158', red: '#FF453A',
  fill: 'rgba(120,120,128,0.24)', blur: 'systemChromeMaterialDark' as unknown as 'systemChromeMaterialLight',
};
export type Theme = typeof light;
export const useTheme = (): Theme => (useColorScheme() === 'dark' ? dark : light);

export const type = {
  large: { fontSize: 34, lineHeight: 38, fontWeight: '700' as const, letterSpacing: -0.7 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const, letterSpacing: -0.3 },
  body: { fontSize: 17, lineHeight: 22 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  foot: { fontSize: 13, lineHeight: 18 },
  cap: { fontSize: 13, lineHeight: 18, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
};
