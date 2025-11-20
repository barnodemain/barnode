import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ItemCard } from '@/shared/components/ItemCard';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Articolo } from '@/shared/types';

interface MissingItemsListProps {
  allArticles: Articolo[];
  missingIds: string[];
}

export function MissingItemsList({ allArticles, missingIds }: MissingItemsListProps) {
  const { theme } = useTheme();

  const missingArticles = allArticles.filter((a) => missingIds.includes(a.id));

  if (missingArticles.length === 0) {
    return (
      <View style={styles.emptyState}>
        <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
          Nessun articolo mancante
        </ThemedText>
        <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
          Usa la lista degli articoli per aggiungere i mancanti.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {missingArticles.map((item) => (
        <ItemCard key={item.id} title={item.nome} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  emptyState: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
