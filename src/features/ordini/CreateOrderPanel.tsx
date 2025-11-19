import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

interface CreateOrderPanelProps {
  theme: any;
  onBack: () => void;
}

export function CreateOrderPanel({ theme, onBack }: CreateOrderPanelProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color={theme.primary} />
        <ThemedText style={[styles.backText, { color: theme.primary }]}>
          Indietro
        </ThemedText>
      </Pressable>

      <View style={styles.panel}>
        <ThemedText style={styles.panelTitle}>Crea Nuovo Ordine</ThemedText>
        <ThemedText
          style={[styles.panelDescription, { color: theme.textSecondary }]}
        >
          Questa funzionalità sarà disponibile nella prossima versione. Potrai
          creare ordini selezionando gli articoli mancanti e specificando le
          quantità.
        </ThemedText>

        <View style={styles.features}>
          <FeatureItem
            icon="check-circle"
            text="Selezione articoli sotto scorta"
            theme={theme}
          />
          <FeatureItem
            icon="check-circle"
            text="Raggruppamento per fornitore"
            theme={theme}
          />
          <FeatureItem
            icon="check-circle"
            text="Calcolo automatico totale"
            theme={theme}
          />
          <FeatureItem
            icon="check-circle"
            text="Invio email al fornitore"
            theme={theme}
          />
        </View>
      </View>
    </View>
  );
}

function FeatureItem({
  icon,
  text,
  theme,
}: {
  icon: keyof typeof Feather.glyphMap;
  text: string;
  theme: any;
}) {
  return (
    <View style={styles.featureItem}>
      <Feather name={icon} size={16} color={theme.accent} />
      <ThemedText style={[styles.featureText, { color: theme.textSecondary }]}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
  },
  panel: {
    padding: Spacing.lg,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.sm,
    gap: Spacing.lg,
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  panelDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  features: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: 14,
  },
});
