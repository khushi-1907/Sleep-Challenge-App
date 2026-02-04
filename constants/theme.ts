/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    primary: '#00E5FF',
    accent: '#FF8C00',
    border: '#E2E8F0',
    gridLine: '#CBD5E1',
    barGlow: {
      shadowColor: '#00E5FF',
      shadowOpacity: 0,
    },
    // Keep these for backward compatibility with existing themed components
    text: '#0F172A',
    tint: '#00E5FF',
    icon: '#64748B',
    tabIconDefault: '#64748B',
    tabIconSelected: '#00E5FF',
  },
  dark: {
    background: '#0F172A',
    card: '#1E293B',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    primary: '#00E5FF',
    accent: '#FF8C00',
    border: '#334155',
    gridLine: '#334155',
    barGlow: {
      shadowColor: '#00E5FF',
      shadowOpacity: 0.5,
    },
    // Keep these for backward compatibility with existing themed components
    text: '#F8FAFC',
    tint: '#00E5FF',
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#00E5FF',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
