import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ItemCard } from "../../shared/components/ItemCard";
import { Spacing } from "@/constants/theme";
import {
  mockOrdini,
  mockFornitori,
  mockArticoli,
} from "../../shared/utils/mockData";

interface ManageOrdersPanelProps {
  theme: any;
  onBack: () => void;
}

export function ManageOrdersPanel({ theme, onBack }: ManageOrdersPanelProps) {
  const getFornitoreNome = (id: string) => {
    return mockFornitori.find((f) => f.id === id)?.nome || "N/A";
  };

  const getArticoloNome = (id: string) => {
    return mockArticoli.find((a) => a.id === id)?.nome || "N/A";
  };

  const getStatoLabel = (stato: string) => {
    const labels: Record<string, string> = {
      bozza: "Bozza",
      inviato: "Inviato",
      ricevuto: "Ricevuto",
      archiviato: "Archiviato",
    };
    return labels[stato] || stato;
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color={theme.primary} />
        <ThemedText style={[styles.backText, { color: theme.primary }]}>
          Indietro
        </ThemedText>
      </Pressable>

      <ThemedText style={styles.sectionTitle}>Ordini Attivi</ThemedText>

      {mockOrdini.map((ordine) => (
        <ItemCard
          key={ordine.id}
          title={`Ordine ${getFornitoreNome(ordine.fornitoreId)}`}
          subtitle={new Date(ordine.dataCreazione).toLocaleDateString("it-IT")}
          badge={getStatoLabel(ordine.stato)}
        >
          <View style={styles.ordineDetails}>
            <View style={styles.articoliList}>
              {ordine.articoli.map((art, idx) => (
                <ThemedText
                  key={idx}
                  style={[styles.articoloText, { color: theme.textSecondary }]}
                >
                  • {getArticoloNome(art.articoloId)}
                </ThemedText>
              ))}
            </View>
            {ordine.note ? (
              <ThemedText
                style={[styles.noteText, { color: theme.textSecondary }]}
              >
                Note: {ordine.note}
              </ThemedText>
            ) : null}
          </View>
        </ItemCard>
      ))}
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.lg,
  },
  ordineDetails: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  articoliList: {
    gap: 4,
  },
  articoloText: {
    fontSize: 13,
  },
  noteText: {
    fontSize: 13,
    fontStyle: "italic",
  },
});
