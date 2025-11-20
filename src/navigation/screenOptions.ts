import { Platform } from 'react-native';
import { isLiquidGlassAvailable } from 'expo-glass-effect';

interface ScreenOptionsParams {
  theme: {
    backgroundRoot: string;
    text: string;
  };
  isDark?: boolean;
  transparent?: boolean;
}

export const getCommonScreenOptions = ({
  theme,
  isDark = false,
  transparent = true,
}: ScreenOptionsParams): any => ({
  headerTitleAlign: 'center',
  headerTransparent: transparent,
  headerBlurEffect: isDark ? 'dark' : 'light',
  headerTintColor: theme.text,
  headerStyle: {
    backgroundColor: Platform.select({
      ios: undefined,
      android: theme.backgroundRoot,
    }),
  },
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  fullScreenGestureEnabled: isLiquidGlassAvailable() ? false : true,
  contentStyle: {
    backgroundColor: theme.backgroundRoot,
  },
});
