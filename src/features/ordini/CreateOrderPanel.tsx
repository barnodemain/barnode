import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { ArrowLeft } from '@/shared/icons';
import { ThemedText } from '@/components/ThemedText';
import { styles } from './CreateOrderPanel.styles';
import { OrderArticlesList } from './components/OrderArticlesList';
import { useCreateOrderData } from './useCreateOrderData';

interface CreateOrderPanelProps {
  theme: any;
  onBack: () => void;
}

export function CreateOrderPanel({ theme, onBack }: CreateOrderPanelProps) {
  const {
    suppliers,
    loading,
    error,
    selectedSupplier,
    setSelectedSupplier,
    articles,
    missingIds,
    articlesLoading,
    articlesError,
  } = useCreateOrderData();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <ArrowLeft size={22} strokeWidth={2} color={theme.primary} />
        <ThemedText style={[styles.backText, { color: theme.primary }]}>Indietro</ThemedText>
      </Pressable>
      <View style={styles.fieldGroup}>
        <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}
        >
          Fornitore
        </ThemedText>

        <Pressable
          onPress={() => {
            if (!loading && !error && suppliers.length > 0) {
              setDropdownOpen((open: boolean) => !open);
            }
          }}
          style={[
            styles.dropdownTrigger,
            {
              borderColor: theme.border ?? 'rgba(255,255,255,0.1)',
              backgroundColor: theme.backgroundDefault,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.dropdownText,
              { color: selectedSupplier ? theme.text : theme.textSecondary },
            ]}
          >
            {selectedSupplier ? selectedSupplier.nome : 'Seleziona un fornitore'}
          </ThemedText>
        </Pressable>

        {loading && (
          <ThemedText style={[styles.helperText, { color: theme.textSecondary }]}
          >
            Caricamento fornitori...
          </ThemedText>
        )}

        {error && !loading && (
          <ThemedText style={[styles.helperText, { color: theme.textSecondary }]}
          >
            {error}
          </ThemedText>
        )}

        {!loading && !error && suppliers.length === 0 && (
          <ThemedText style={[styles.helperText, { color: theme.textSecondary }]}
          >
            Nessun fornitore disponibile.
          </ThemedText>
        )}

        {dropdownOpen && suppliers.length > 0 && (
          <View style={[styles.dropdownList, { backgroundColor: theme.backgroundDefault }]}
          >
            {suppliers.map((supplier) => (
              <Pressable
                key={supplier.id}
                onPress={() => {
                  setSelectedSupplier(supplier);
                  setDropdownOpen(false);
                }}
                style={({ pressed }) => [
                  styles.dropdownItem,
                  pressed && { backgroundColor: 'rgba(255,255,255,0.04)' },
                ]}
              >
                <ThemedText style={[styles.dropdownItemText, { color: theme.text }]}
                >
                  {supplier.nome}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {selectedSupplier && (
        <OrderArticlesList
          supplierName={selectedSupplier.nome}
          articles={articles}
          missingIds={missingIds}
          loading={articlesLoading}
          error={articlesError}
        />
      )}
    </View>
  );
}
