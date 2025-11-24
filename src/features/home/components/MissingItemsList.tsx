import React from 'react';
import { Alert, Pressable, View, StyleSheet, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ItemCard } from '@/shared/components/ItemCard';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useMissingItems } from '@/features/home/state/missingItemsStore';
import { Trash } from '@/shared/icons';
import { Articolo } from '@/shared/types';
import { supabaseDataClient } from '@/shared/services/supabaseDataClient';

interface MissingItemsListProps {
  allArticles: Articolo[];
  missingIds: string[];
}

export function MissingItemsList({ allArticles, missingIds }: MissingItemsListProps) {
  const { theme } = useTheme();
  const { removeMissingItem } = useMissingItems();

  const missingArticles = allArticles
    .filter((a) => missingIds.includes(a.id))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'it', { sensitivity: 'base' }));

  if (missingArticles.length === 0) {
    return <View style={styles.emptyState} />;
  }

  return (
    <View style={styles.list}>
      {missingArticles.map((item) => (
        <ItemCard
          key={item.id}
          title={item.nome}
          rightAccessory={
            <Pressable
              onPress={() => {
                console.log('[Home] Trash pressed for', item.id);

                const executeRemoval = async () => {
                  const ok = await supabaseDataClient.articoliMancanti.remove(item.id);
                  if (ok) {
                    removeMissingItem(item.id);
                  }
                };

                if (Platform.OS === 'web') {
                  const confirmed = window.confirm(
                    `Vuoi rimuovere "${item.nome}" dalla lista degli articoli mancanti?`
                  );
                  if (confirmed) {
                    void executeRemoval();
                  }
                } else {
                  Alert.alert(
                    'Rimuovere articolo mancante?',
                    `Vuoi rimuovere "${item.nome}" dalla lista degli articoli mancanti?`,
                    [
                      { text: 'Annulla', style: 'cancel' },
                      {
                        text: 'Rimuovi',
                        style: 'destructive',
                        onPress: () => {
                          void executeRemoval();
                        },
                      },
                    ]
                  );
                }
              }}
              style={styles.removeButton}
            >
              <Trash size={18} color="#FF4D4F" />
            </Pressable>
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  removeButton: {
    paddingLeft: Spacing.sm,
  },
  emptyState: {
    paddingVertical: Spacing.lg,
  },
});
