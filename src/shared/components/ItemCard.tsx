import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface ItemCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  actionLabel?: string;
  onActionPress?: () => void;
  disableAction?: boolean;
  rightAccessory?: React.ReactNode;
  titleColor?: string;
}

export function ItemCard({
  title,
  subtitle,
  badge,
  onPress,
  actionLabel,
  onActionPress,
  disableAction,
  rightAccessory,
  children,
  titleColor,
}: ItemCardProps) {
  const { theme } = useTheme();

  const Container: React.ComponentType<any> = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={onPress
        ? ({ pressed }: { pressed: boolean }) => [
            styles.card,
            { backgroundColor: theme.backgroundDefault },
            pressed && { opacity: 0.7 },
          ]
        : [styles.card, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <ThemedText style={[styles.title, titleColor && { color: titleColor }]}>
              {title}
            </ThemedText>
          </View>
          {badge ? (
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <ThemedText style={styles.badgeText}>{badge}</ThemedText>
            </View>
          ) : null}
          {rightAccessory}
        </View>
        {subtitle ? (
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </ThemedText>
        ) : null}
        {children}
        {actionLabel && onActionPress ? (
          <Pressable
            onPress={onActionPress}
            disabled={disableAction}
            style={({ pressed }) => [
              styles.actionContainer,
              pressed && !disableAction && { opacity: 0.7 },
            ]}
          >
            <ThemedText style={[styles.actionLabel, disableAction && { opacity: 0.6 }]}>
              {actionLabel}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8F6F0',
  },
  actionContainer: {
    marginTop: Spacing.xs,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
