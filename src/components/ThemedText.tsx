import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Typography } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'h1' | 'h2' | 'body' | 'label' | 'caption';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'body',
  ...rest
}: ThemedTextProps) {
  const { theme, isDark } = useTheme();

  const getColor = () => {
    if (isDark && darkColor) {
      return darkColor;
    }

    if (!isDark && lightColor) {
      return lightColor;
    }

    return theme.text;
  };

  const getTypeStyle = () => {
    switch (type) {
      case 'h1':
        return Typography.h1;
      case 'h2':
        return Typography.h2;
      case 'body':
        return Typography.body;
      case 'label':
        return Typography.label;
      case 'caption':
        return Typography.caption;
      default:
        return Typography.body;
    }
  };

  return <Text style={[{ color: getColor() }, getTypeStyle(), style]} {...rest} />;
}
