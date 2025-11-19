import React, { useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { SearchBar } from "../src/shared/components/SearchBar";
import { ItemCard } from "../src/shared/components/ItemCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import {
  mockArticoli,
  mockTipologie,
  mockFornitori,
} from "../src/shared/utils/mockData";

export default function MissingItemsScreen() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return mockArticoli;
    const query = searchQuery.toLowerCase();
    return mockArticoli.filter((item) =>
      item.nome.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const getTipologiaName = (id: string) => {
    return mockTipologie.find((t) => t.id === id)?.nome || "N/A";
  };

  const getFornitoreNome = (id: string) => {
    return mockFornitori.find((f) => f.id === id)?.nome || "N/A";
  };

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cerca articoli..."
        />

        <View style={styles.list}>
          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
                Nessun risultato
              </ThemedText>
              <ThemedText
                style={[styles.emptySubtitle, { color: theme.textSecondary }]}
              >
                Prova con un altro termine
              </ThemedText>
            </View>
          ) : (
            filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                title={item.nome}
                subtitle={`${getTipologiaName(item.tipologiaId)} • ${getFornitoreNome(item.fornitoreId)}`}
              />
            ))
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
  list: {
    gap: Spacing.sm,
  },
  emptyState: {
    paddingVertical: Spacing["5xl"],
    alignItems: "center",
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
});

