import React from 'react';
import { Pressable, View } from 'react-native';
import { SectionCard } from '@/shared/components/SectionCard';
import { ThemedText } from '@/components/ThemedText';
import { styles } from '@/screens/DatabaseScreen.styles';
import type { Tipologia, Fornitore } from '@/shared/types';
import { useTheme } from '@/hooks/useTheme';
import { Edit } from '@/shared/icons';

interface DatabaseFiltersSectionProps {
  tipologie: Tipologia[];
  fornitori: Fornitore[];
  selectedTipologiaId: string | null;
  selectedFornitoreId: string | null;
  onChangeTipologia: (id: string | null) => void;
  onChangeFornitore: (id: string | null) => void;
  tipologieOpen: boolean;
  setTipologieOpen: (open: boolean) => void;
  fornitoriOpen: boolean;
  setFornitoriOpen: (open: boolean) => void;
  onEditTipologie: () => void;
}

export function DatabaseFiltersSection({
  tipologie,
  fornitori,
  selectedTipologiaId,
  selectedFornitoreId,
  onChangeTipologia,
  onChangeFornitore,
  tipologieOpen,
  setTipologieOpen,
  fornitoriOpen,
  setFornitoriOpen,
  onEditTipologie,
}: DatabaseFiltersSectionProps) {
  const { theme } = useTheme();

  const currentTipologiaLabel = selectedTipologiaId
    ? tipologie.find((t) => t.id === selectedTipologiaId)?.nome ?? 'Tutte le tipologie'
    : 'Tutte le tipologie';

  const currentFornitoreLabel = selectedFornitoreId
    ? fornitori.find((f) => f.id === selectedFornitoreId)?.nome ?? 'Tutti i fornitori'
    : 'Tutti i fornitori';

  return (
    <View>
      <SectionCard
        title={currentTipologiaLabel}
        icon="tag"
        collapsible
        open={tipologieOpen}
        onOpenChange={setTipologieOpen}
        highlighted={!!selectedTipologiaId}
        rightAccessory={
          <Pressable
            onPress={onEditTipologie}
            style={({ pressed }) => [
              styles.modalButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Edit size={18} color={theme.primary} />
          </Pressable>
        }
      >
        <Pressable
          onPress={() => {
            onChangeTipologia(null);
            setTipologieOpen(false);
          }}
          style={({ pressed }) => [
            styles.listItem,
            !selectedTipologiaId && { backgroundColor: 'rgba(45, 90, 61, 0.2)' },
            pressed && { opacity: 0.7 },
          ]}
        >
          <ThemedText style={styles.itemName}>Tutte le tipologie</ThemedText>
        </Pressable>

        {tipologie.map((tipo) => {
          const isSelected = selectedTipologiaId === tipo.id;
          return (
            <Pressable
              key={tipo.id}
              onPress={() =>
                onChangeTipologia(selectedTipologiaId === tipo.id ? null : tipo.id)
              }
              style={({ pressed }) => [
                styles.listItem,
                isSelected && { backgroundColor: 'rgba(245, 208, 39, 0.35)' },
                pressed && { opacity: 0.7 },
              ]}
            >
              <ThemedText style={styles.itemName}>{tipo.nome}</ThemedText>
              {tipo.descrizione ? (
                <ThemedText style={[styles.itemDescription, { color: theme.textSecondary }]}>
                  {tipo.descrizione}
                </ThemedText>
              ) : null}
            </Pressable>
          );
        })}
      </SectionCard>

      <SectionCard
        title={currentFornitoreLabel}
        icon="truck"
        collapsible
        open={fornitoriOpen}
        onOpenChange={setFornitoriOpen}
        highlighted={!!selectedFornitoreId}
        rightAccessory={
          <Pressable
            onPress={() => {
              // Placeholder futura azione "modifica" per i fornitori
            }}
            style={({ pressed }) => [
              styles.modalButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Edit size={18} color={theme.primary} />
          </Pressable>
        }
      >
        <Pressable
          onPress={() => {
            onChangeFornitore(null);
            setFornitoriOpen(false);
          }}
          style={({ pressed }) => [
            styles.listItem,
            !selectedFornitoreId && { backgroundColor: 'rgba(45, 90, 61, 0.2)' },
            pressed && { opacity: 0.7 },
          ]}
        >
          <ThemedText style={styles.itemName}>Tutti i fornitori</ThemedText>
        </Pressable>

        {fornitori.map((fornitore) => {
          const isSelected = selectedFornitoreId === fornitore.id;
          return (
            <Pressable
              key={fornitore.id}
              onPress={() =>
                onChangeFornitore(selectedFornitoreId === fornitore.id ? null : fornitore.id)
              }
              style={({ pressed }) => [
                styles.listItem,
                isSelected && { backgroundColor: 'rgba(245, 208, 39, 0.35)' },
                pressed && { opacity: 0.7 },
              ]}
            >
              <ThemedText style={styles.itemName}>{fornitore.nome}</ThemedText>
              <View style={styles.fornitorDetails}>
                {fornitore.contatto ? (
                  <ThemedText style={[styles.itemDetail, { color: theme.textSecondary }]}>
                    Contatto: {fornitore.contatto}
                  </ThemedText>
                ) : null}
                {fornitore.telefono ? (
                  <ThemedText style={[styles.itemDetail, { color: theme.textSecondary }]}>
                    Tel: {fornitore.telefono}
                  </ThemedText>
                ) : null}
                {fornitore.email ? (
                  <ThemedText style={[styles.itemDetail, { color: theme.textSecondary }]}>
                    Email: {fornitore.email}
                  </ThemedText>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </SectionCard>
    </View>
  );
}
