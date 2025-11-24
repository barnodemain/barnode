import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { ThemedText } from '@/components/ThemedText';
import { SearchBar } from '@/shared/components/SearchBar';
import { ItemCard } from '@/shared/components/ItemCard';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/theme';
import { supabaseDataClient } from '@/shared/services/supabaseDataClient';
import { useMissingItems } from '@/features/home/state/missingItemsStore';
import { MissingItemsList } from '@/features/home/components/MissingItemsList';
import { Articolo } from '@/shared/types';
import { PlusCircle } from '@/shared/icons';

export default function MissingItemsScreen() {
  const { theme } = useTheme();
  const { ids: missingIds, addMissingItem, setMissingItems, clearMissingItems } = useMissingItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [allArticles, setAllArticles] = useState<Articolo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [articles, missingIdsFromDb] = await Promise.all([
          supabaseDataClient.articoli.getAll(),
          supabaseDataClient.articoliMancanti.getAllIds(),
        ]);

        if (!isMounted) return;

        setAllArticles(articles);
        setMissingItems(missingIdsFromDb);
      } catch (error) {
        console.error('[Home] Errore caricamento dati da Supabase', error);
        if (!isMounted) return;
        setAllArticles([]);
        setMissingItems([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    // Se la ricerca è vuota non mostriamo l'intera lista articoli.
    // La lista completa degli articoli resta visibile solo nella DatabaseScreen;
    // qui l'utente deve usare il filtro per cercare e aggiungere alla lista mancanti.
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allArticles
      .filter((item) => item.nome.toLowerCase().includes(query))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'it', { sensitivity: 'base' }));
  }, [allArticles, searchQuery]);

  async function handleAddMissing(itemId: string, isMissing: boolean) {
    if (isMissing) return;

    const ok = await supabaseDataClient.articoliMancanti.add(itemId);
    if (ok) {
      addMissingItem(itemId);
    }
  }

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cerca articoli..."
          />

          {!loading && searchQuery.trim().length > 0 && (
            <View style={styles.dropdown}>
              {filteredItems.length === 0 ? (
                <View style={styles.dropdownEmptyState}>
                  <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                    Nessun articolo trovato
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
                      rightAccessory={
                        <Pressable
                          onPress={() => {
                            if (!isMissing) {
                              handleAddMissing(item.id, isMissing);
                            }
                          }}
                          disabled={isMissing}
                          style={{ paddingLeft: Spacing.sm }}
                        >
                          <PlusCircle
                            size={18}
                            color={isMissing ? theme.textSecondary : theme.primary}
                          />
                        </Pressable>
                      }
                    />
                  );
                })
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Articoli mancanti</ThemedText>
          {loading ? (
            <ThemedText style={{ color: theme.textSecondary }}>Caricamento articoli...</ThemedText>
          ) : (
            <MissingItemsList allArticles={allArticles} missingIds={missingIds} />
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
  searchSection: {
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  dropdown: {
    marginTop: Spacing.xs,
    borderRadius: Spacing.sm,
    overflow: 'hidden',
  },
  dropdownEmptyState: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
