import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { styles } from '@/screens/DatabaseScreen.styles';

interface DatabaseCsvModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCsv: () => void;
}

export function DatabaseCsvModal({ visible, onClose, onSelectCsv }: DatabaseCsvModalProps) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={styles.modalTitle}>Carica file CSV</ThemedText>
          <ThemedText style={[styles.modalText, { color: theme.textSecondary }]}>
            Seleziona un file CSV dal dispositivo. La logica di importazione verrà
            configurata in un secondo momento.
          </ThemedText>

          <View style={styles.modalButtonsRow}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.modalButton, pressed && { opacity: 0.7 }]}
            >
              <ThemedText style={styles.modalButtonText}>Annulla</ThemedText>
            </Pressable>

            <Pressable
              onPress={onSelectCsv}
              style={({ pressed }) => [
                styles.modalButtonPrimary,
                { backgroundColor: theme.primary },
                pressed && { opacity: 0.85 },
              ]}
            >
              <ThemedText style={styles.modalButtonPrimaryText}>Seleziona file</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
