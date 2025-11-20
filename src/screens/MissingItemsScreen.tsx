import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { ThemedText } from '@/components/ThemedText';
import { SearchBar } from '@/shared/components/SearchBar';
import { ItemCard } from '@/shared/components/ItemCard';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/theme';
import { dataClient } from '@/shared/services/dataClient';
import { useMissingItems } from '@/features/home/state/missingItemsStore';
import { MissingItemsList } from '@/features/home/components/MissingItemsList';
import { Articolo } from '@/shared/types';

export default function MissingItemsScreen() {
  const { theme } = useTheme();
  const { ids: missingIds, addMissingItem, clearMissingItems } = useMissingItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [allArticles, setAllArticles] = useState<Articolo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    dataClient.articoli
      .getAll()
      .then((items) => {
        if (isMounted) {
          setAllArticles(items);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allArticles;
    const query = searchQuery.toLowerCase();
    return allArticles.filter((item) => item.nome.toLowerCase().includes(query));
  }, [allArticles, searchQuery]);

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Articoli mancanti</ThemedText>
          <MissingItemsList allArticles={allArticles} missingIds={missingIds} />
          {missingIds.length > 0 ? (
            <Pressable
              onPress={clearMissingItems}
              style={[styles.clearButton, { borderColor: theme.border }]}
            >
              <ThemedText style={[styles.clearButtonText, { color: theme.textSecondary }]}>
                Svuota lista mancanti
              </ThemedText>
            </Pressable>
          ) : null}
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cerca articoli..."
        />

        <View style={styles.list}>
          {loading ? (
            <ThemedText style={{ color: theme.textSecondary }}>Caricamento articoli...</ThemedText>
          ) : filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
                Nessun risultato
              </ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Prova con un altro termine
              </ThemedText>
            </View>
          ) : (
            filteredItems.map((item) => {
              const isMissing = missingIds.includes(item.id);
              return (
                <ItemCard
                  key={item.id}
                  title={item.nome}
                  subtitle={undefined}
                  actionLabel={isMissing ? 'Già in lista mancanti' : 'Aggiungi → Lista mancanti'}
                  onActionPress={() => {
                    if (!isMissing) {
                      addMissingItem(item.id);
                    }
                  }}
                  disableAction={isMissing}
                />
              );
            })
          )}
        </View>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.xs,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    gap: Spacing.sm,
  },
  emptyState: {
    paddingVertical: Spacing['5xl'],
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
