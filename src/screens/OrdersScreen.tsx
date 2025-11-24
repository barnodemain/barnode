import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { PlusCircle, List } from '@/shared/icons';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { CreateOrderPanel } from '@/features/ordini/CreateOrderPanel';
import { ManageOrdersPanel } from '@/features/ordini/ManageOrdersPanel';
import type { MainTabParamList } from '@/navigation/MainTabNavigator';

type ViewMode = 'main' | 'create' | 'manage';

export default function OrdersScreen() {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Orders'>>();

  // Ogni volta che la tab Ordini entra in focus riportiamo la schermata
  // allo stato iniziale con i due pulsanti (viewMode = 'main').
  useFocusEffect(
    React.useCallback(() => {
      setViewMode('main');
    }, [])
  );

  // Quando l'utente preme la tab "Ordini" (anche se è già selezionata),
  // riportiamo comunque la schermata allo stato iniziale.
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      setViewMode('main');
    });

    return unsubscribe;
  }, [navigation]);

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
