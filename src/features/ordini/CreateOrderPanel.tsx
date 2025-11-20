import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ArrowLeft, CheckCircle } from '@/shared/icons';
import { ThemedText } from '@/components/ThemedText';
import { Spacing, BorderRadius } from '@/constants/theme';

interface CreateOrderPanelProps {
  theme: any;
  onBack: () => void;
}

export function CreateOrderPanel({ theme, onBack }: CreateOrderPanelProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <ArrowLeft size={22} strokeWidth={2} color={theme.primary} />
        <ThemedText style={[styles.backText, { color: theme.primary }]}>Indietro</ThemedText>
      </Pressable>

      <View style={styles.panel}>
        <ThemedText style={styles.panelTitle}>Crea Nuovo Ordine</ThemedText>
        <ThemedText style={[styles.panelDescription, { color: theme.textSecondary }]}>
          Questa funzionalità sarà disponibile nella prossima versione. Potrai creare ordini
          selezionando gli articoli mancanti e specificando le quantità.
        </ThemedText>

        <View style={styles.features}>
          <FeatureItem text="Selezione articoli" theme={theme} />
          <FeatureItem text="Raggruppamento per fornitore" theme={theme} />
          <FeatureItem text="Invio email al fornitore" theme={theme} />
        </View>
      </View>
    </View>
  );
}

function FeatureItem({ text, theme }: { text: string; theme: any }) {
  return (
    <View style={styles.featureItem}>
      <CheckCircle size={22} strokeWidth={2} color={theme.accent} />
      <ThemedText style={[styles.featureText, { color: theme.textSecondary }]}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  panel: {
    padding: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.sm,
    gap: Spacing.lg,
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  panelDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  features: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: 14,
  },
});
