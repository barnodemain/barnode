import React, { useState } from 'react';
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
  collapsible?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  highlighted?: boolean;
  rightAccessory?: React.ReactNode;
}

export function SectionCard({ title, count, icon, onPress, children, collapsible, open, onOpenChange, highlighted, rightAccessory }: SectionCardProps) {
  const { theme } = useTheme();
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = typeof open === 'boolean';
  const isOpen = isControlled ? open : internalOpen;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        highlighted && { borderColor: '#F5D027', borderWidth: 1 },
      ]}
    >
      <Pressable
        onPress={() => {
          if (collapsible) {
            if (isControlled) {
              onOpenChange?.(!isOpen);
            } else {
              setInternalOpen((prev) => !prev);
            }
          }
          onPress?.();
        }}
        style={({ pressed }) => [styles.header, pressed && { opacity: 0.7 }]}
      >
        <View style={styles.titleRow}>
          {icon === 'tag' && <Tag size={22} strokeWidth={2} color={theme.primary} />}
          {icon === 'truck' && <Truck size={22} strokeWidth={2} color={theme.primary} />}
          <ThemedText style={[styles.title, highlighted && { color: '#F5D027' }]}>{title}</ThemedText>
        </View>
        {rightAccessory
          ? rightAccessory
          : count !== undefined && (
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: highlighted ? '#F5D027' : theme.accent },
                ]}
              >
                <ThemedText style={styles.countText}>{count}</ThemedText>
              </View>
            )}
      </Pressable>
      {children && (!collapsible || isOpen) ? <View style={styles.content}>{children}</View> : null}
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
