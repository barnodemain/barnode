import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { PlusCircle, List } from '@/shared/icons';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { mockOrdini } from '@/shared/utils/mockData';
import { CreateOrderPanel } from '@/features/ordini/CreateOrderPanel';
import { ManageOrdersPanel } from '@/features/ordini/ManageOrdersPanel';

type ViewMode = 'main' | 'create' | 'manage';

export default function OrdersScreen() {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('main');

  if (viewMode === 'create') {
    return (
      <ScreenScrollView>
        <CreateOrderPanel theme={theme} onBack={() => setViewMode('main')} />
      </ScreenScrollView>
    );
  }

  if (viewMode === 'manage') {
    return (
      <ScreenScrollView>
        <ManageOrdersPanel theme={theme} onBack={() => setViewMode('main')} />
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{mockOrdini.length}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Ordini totali
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {mockOrdini.filter((o) => o.stato === 'inviato').length}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              In attesa
            </ThemedText>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Pressable
            onPress={() => setViewMode('create')}
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: theme.primary },
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
          >
            <PlusCircle size={22} strokeWidth={2} color={theme.buttonText} />
            <ThemedText style={[styles.actionTitle, { color: theme.buttonText }]}>
              Crea Ordine
            </ThemedText>
            <ThemedText style={[styles.actionSubtitle, { color: theme.buttonText }]}>
              Inizia un nuovo ordine
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => setViewMode('manage')}
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: theme.primaryLight },
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
          >
            <List size={22} strokeWidth={2} color={theme.primary} />
            <ThemedText style={[styles.actionTitle, { color: theme.primary }]}>
              Gestisci Ordini
            </ThemedText>
            <ThemedText style={[styles.actionSubtitle, { color: theme.primary }]}>
              Visualizza ordini attivi
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  statsCard: {
    flexDirection: 'row',
    padding: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(45, 90, 61, 0.2)',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
  },
  actionsContainer: {
    gap: Spacing.lg,
  },
  actionCard: {
    padding: Spacing['2xl'],
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  actionSubtitle: {
    fontSize: 14,
  },
});
