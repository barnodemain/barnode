import React, { useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { SearchBar } from "../src/shared/components/SearchBar";
import { SectionCard } from "../src/shared/components/SectionCard";
import { ItemCard } from "../src/shared/components/ItemCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import {
  mockArticoli,
  mockTipologie,
  mockFornitori,
} from "../src/shared/utils/mockData";

export default function DatabaseScreen() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticoli = useMemo(() => {
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
        <SectionCard
          title="Tipologie"
          count={mockTipologie.length}
          icon="tag"
        >
          {mockTipologie.map((tipo) => (
            <View key={tipo.id} style={styles.listItem}>
              <ThemedText style={styles.itemName}>{tipo.nome}</ThemedText>
              {tipo.descrizione ? (
                <ThemedText
                  style={[styles.itemDescription, { color: theme.textSecondary }]}
                >
                  {tipo.descrizione}
                </ThemedText>
              ) : null}
            </View>
          ))}
        </SectionCard>

        <SectionCard
          title="Fornitori"
          count={mockFornitori.length}
          icon="truck"
        >
          {mockFornitori.map((fornitore) => (
            <View key={fornitore.id} style={styles.listItem}>
              <ThemedText style={styles.itemName}>
                {fornitore.nome}
              </ThemedText>
              <View style={styles.fornitorDetails}>
                {fornitore.contatto ? (
                  <ThemedText
                    style={[styles.itemDetail, { color: theme.textSecondary }]}
                  >
                    Contatto: {fornitore.contatto}
                  </ThemedText>
                ) : null}
                {fornitore.telefono ? (
                  <ThemedText
                    style={[styles.itemDetail, { color: theme.textSecondary }]}
                  >
                    Tel: {fornitore.telefono}
                  </ThemedText>
                ) : null}
                {fornitore.email ? (
                  <ThemedText
                    style={[styles.itemDetail, { color: theme.textSecondary }]}
                  >
                    Email: {fornitore.email}
                  </ThemedText>
                ) : null}
              </View>
            </View>
          ))}
        </SectionCard>

        <View style={styles.articoliSection}>
          <ThemedText style={styles.sectionTitle}>Articoli</ThemedText>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cerca articoli..."
          />

          <View style={styles.list}>
            {filteredArticoli.map((item) => (
              <ItemCard
                key={item.id}
                title={item.nome}
                subtitle={`${getTipologiaName(item.tipologiaId)} • ${getFornitoreNome(item.fornitoreId)}`}
                badge={`${item.quantita} pz`}
                isMissing={item.quantita < item.quantitaMinima}
              >
                <View style={styles.details}>
                  <ThemedText
                    style={[styles.detailText, { color: theme.textSecondary }]}
                  >
                    Prezzo: €{item.prezzoUnitario.toFixed(2)} • Minima:{" "}
                    {item.quantitaMinima}
                  </ThemedText>
                </View>
              </ItemCard>
            ))}
          </View>
        </View>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  listItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(45, 90, 61, 0.1)",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
  },
  fornitorDetails: {
    gap: 2,
  },
  itemDetail: {
    fontSize: 13,
  },
  articoliSection: {
    gap: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  list: {
    gap: Spacing.sm,
  },
  details: {
    marginTop: Spacing.xs,
  },
  detailText: {
    fontSize: 13,
  },
});

