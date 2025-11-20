import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Tag, Truck } from '@/shared/icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface SectionCardProps {
  title: string;
  count?: number;
  icon: 'tag' | 'truck';
  onPress?: () => void;
  children?: React.ReactNode;
}

export function SectionCard({ title, count, icon, onPress, children }: SectionCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.header, pressed && { opacity: 0.7 }]}
      >
        <View style={styles.titleRow}>
          {icon === 'tag' && <Tag size={22} strokeWidth={2} color={theme.primary} />}
          {icon === 'truck' && <Truck size={22} strokeWidth={2} color={theme.primary} />}
          <ThemedText style={styles.title}>{title}</ThemedText>
        </View>
        {count !== undefined ? (
          <View style={[styles.countBadge, { backgroundColor: theme.accent }]}>
            <ThemedText style={styles.countText}>{count}</ThemedText>
          </View>
        ) : null}
      </Pressable>
      {children ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
});
