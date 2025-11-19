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

  const missingItems = useMemo(() => {
    return mockArticoli.filter((item) => item.quantita < item.quantitaMinima);
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return missingItems;
    const query = searchQuery.toLowerCase();
    return missingItems.filter((item) =>
      item.nome.toLowerCase().includes(query),
    );
  }, [missingItems, searchQuery]);

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
          placeholder="Cerca articoli mancanti..."
        />

        <View style={styles.list}>
          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
                {searchQuery
                  ? "Nessun risultato"
                  : "Nessun articolo mancante"}
              </ThemedText>
              <ThemedText
                style={[styles.emptySubtitle, { color: theme.textSecondary }]}
              >
                {searchQuery
                  ? "Prova con un altro termine"
                  : "Tutti gli articoli sono sopra la scorta minima"}
              </ThemedText>
            </View>
          ) : (
            filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                title={item.nome}
                subtitle={`Categoria: ${getTipologiaName(item.tipologiaId)} • Fornitore: ${getFornitoreNome(item.fornitoreId)}`}
                badge={`${item.quantita}/${item.quantitaMinima}`}
                isMissing
              >
                <View style={styles.details}>
                  <ThemedText
                    style={[styles.detailText, { color: theme.textSecondary }]}
                  >
                    Quantità: {item.quantita} • Minima: {item.quantitaMinima}
                  </ThemedText>
                  <ThemedText
                    style={[styles.detailText, { color: theme.textSecondary }]}
                  >
                    Prezzo: €{item.prezzoUnitario.toFixed(2)}
                  </ThemedText>
                  {item.note ? (
                    <ThemedText
                      style={[
                        styles.noteText,
                        { color: theme.accent, fontWeight: "600" },
                      ]}
                    >
                      {item.note}
                    </ThemedText>
                  ) : null}
                </View>
              </ItemCard>
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
  details: {
    gap: 4,
    marginTop: Spacing.xs,
  },
  detailText: {
    fontSize: 13,
  },
  noteText: {
    fontSize: 13,
    marginTop: 4,
  },
});

