import React, { useMemo, useState } from 'react';
import { Modal, Pressable, View, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { styles } from '@/screens/DatabaseScreen.styles';
import type { Tipologia } from '@/shared/types';
import { supabaseDataClient } from '@/shared/services/supabaseDataClient';
import { Trash } from '@/shared/icons';

interface TipologieModalProps {
  visible: boolean;
  onClose: () => void;
  tipologie: Tipologia[];
  onChangeTipologie: (next: Tipologia[]) => void;
}

function normalizeNome(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

export function TipologieModal({ visible, onClose, tipologie, onChangeTipologie }: TipologieModalProps) {
  const { theme } = useTheme();
  const [nome, setNome] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [search, setSearch] = useState('');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setNome('');
    setEditingId(null);
    setEditingName('');
    setConfirmingDeleteId(null);
  };

  async function handleSave() {
    const normalized = normalizeNome(nome);
    if (!normalized) return;
    setSaving(true);
    try {
      console.log('[TipologieModal] create start', normalized);
      const created = await supabaseDataClient.tipologie.create(normalized, undefined);
      if (created) {
        console.log('[TipologieModal] create success', created.id);
        onChangeTipologie([...tipologie, created]);
        resetForm();
        onClose();
        return;
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    const normalized = normalizeNome(editingName);
    if (!normalized) return;
    setSaving(true);
    try {
      console.log('[TipologieModal] update start', editingId, normalized);
      const updated = await supabaseDataClient.tipologie.update(
        editingId,
        normalized,
        undefined
      );
      if (updated) {
        console.log('[TipologieModal] update success', updated.id);
        onChangeTipologie(
          tipologie.map((t) => (t.id === updated.id ? updated : t))
        );
        setEditingId(null);
        setEditingName('');
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirmed(id: string) {
    setSaving(true);
    try {
      console.log('[TipologieModal] delete start', id);
      const ok = await supabaseDataClient.tipologie.remove(id);
      if (ok) {
        console.log('[TipologieModal] delete success', id);
        onChangeTipologie(tipologie.filter((t) => t.id !== id));
        if (editingId === id) {
          resetForm();
        }
        onClose();
      } else {
        console.log('[TipologieModal] delete failed', id);
        // Manteniamo aperto il modale, l'utente potrà riprovare
      }
    } finally {
      setSaving(false);
    }
  }

  const filteredTipologie = useMemo<Tipologia[]>(() => {
    // In modalità modifica mostriamo solo la tipologia in editing
    if (editingId) {
      return tipologie.filter((t) => t.id === editingId);
    }

    const q = search.trim().toLowerCase();
    if (!q) return [];
    return tipologie.filter((t) => t.nome.toLowerCase().includes(q));
  }, [editingId, search, tipologie]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
          {/* Sezione 1: cerca / modifica / elimina */}
          <View style={{ gap: 8, marginBottom: 20 }}>
            <ThemedText style={{ fontWeight: '600' }}>
              Modifica / elimina tipologia esistente
            </ThemedText>
            <TextInput
              placeholder="Cerca tipologia..."
              placeholderTextColor={theme.textSecondary}
              value={editingId ? editingName : search}
              onChangeText={editingId ? setEditingName : setSearch}
              style={{
                borderRadius: 8,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.15)',
                paddingHorizontal: 10,
                paddingVertical: 8,
                color: theme.text,
                backgroundColor: editingId ? '#F5D02733' : 'transparent',
              }}
            />

            {/* In ricerca mostriamo le tipologie filtrate; in modifica solo la riga in editing */}
            {(editingId || search.trim().length > 0) && (
              <View style={{ maxHeight: 180 }}>
                {filteredTipologie.length === 0 ? (
                  <ThemedText style={{ color: theme.textSecondary }}>
                    Nessuna tipologia trovata.
                  </ThemedText>
                ) : (
                  filteredTipologie.map((t) => (
                    <View
                      key={t.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 6,
                      }}
                    >
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <ThemedText>{t.nome}</ThemedText>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable
                          onPress={() => {
                            if (editingId === t.id) {
                              handleSaveEdit();
                            } else {
                              setEditingId(t.id);
                              setEditingName(t.nome);
                            }
                          }}
                          style={({ pressed }) => [
                            styles.modalButton,
                            pressed && { opacity: 0.7 },
                          ]}
                        >
                          <ThemedText style={styles.modalButtonText}>
                            {editingId === t.id ? 'Salva' : 'Modifica'}
                          </ThemedText>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            if (confirmingDeleteId === t.id) {
                              void handleDeleteConfirmed(t.id);
                            } else {
                              setConfirmingDeleteId(t.id);
                            }
                          }}
                          style={({ pressed }) => [
                            styles.modalButton,
                            pressed && { opacity: 0.7 },
                          ]}
                        >
                          {confirmingDeleteId === t.id ? (
                            <ThemedText style={[styles.modalButtonText, { color: '#FF4D4D' }]}
                            >
                              Conferma
                            </ThemedText>
                          ) : (
                            <Trash size={16} color="#FF4D4D" />
                          )}
                        </Pressable>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Sezione 2: aggiungi nuova tipologia */}
          <View style={{ gap: 8, marginBottom: 16 }}>
            <ThemedText style={{ fontWeight: '600', marginBottom: 4 }}>
              Aggiungi nuova tipologia
            </ThemedText>
            <TextInput
              placeholder="Nome tipologia"
              placeholderTextColor={theme.textSecondary}
              value={nome}
              onChangeText={setNome}
              style={{
                borderRadius: 8,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.15)',
                paddingHorizontal: 10,
                paddingVertical: 8,
                color: theme.text,
              }}
            />
          </View>

          <View style={styles.modalButtonsRow}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.modalButton, pressed && { opacity: 0.7 }]}
            >
              <ThemedText style={styles.modalButtonText}>Chiudi</ThemedText>
            </Pressable>

            <Pressable
              onPress={editingId ? handleSaveEdit : handleSave}
              disabled={saving || !(editingId ? editingName.trim() : nome.trim())}
              style={({ pressed }) => [
                styles.modalButtonPrimary,
                {
                  opacity:
                    saving || !(editingId ? editingName.trim() : nome.trim())
                      ? 0.4
                      : pressed
                      ? 0.8
                      : 1,
                },
              ]}
            >
              <ThemedText style={styles.modalButtonPrimaryText}>
                {editingId ? 'Salva modifiche' : 'Aggiungi tipologia'}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
