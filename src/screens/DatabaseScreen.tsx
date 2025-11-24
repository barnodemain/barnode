import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, Pressable, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { ThemedText } from '@/components/ThemedText';
import { SearchBar } from '@/shared/components/SearchBar';
import { SectionCard } from '@/shared/components/SectionCard';
import { ItemCard } from '@/shared/components/ItemCard';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/theme';
import { Upload } from '@/shared/icons';
import { parseArticlesCsv } from '@/shared/utils/csvImport';
import { supabaseDataClient } from '@/shared/services/supabaseDataClient';
import type { Articolo, Tipologia, Fornitore } from '@/shared/types';
import { styles } from './DatabaseScreen.styles';
import { DatabaseCsvModal } from './components/DatabaseCsvModal';
import { DatabaseFiltersSection } from './components/DatabaseFiltersSection';
import { TipologieModal } from './components/TipologieModal';

export default function DatabaseScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCsvModalVisible, setIsCsvModalVisible] = useState(false);
  const [isTipologieModalVisible, setIsTipologieModalVisible] = useState(false);
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [tipologie, setTipologie] = useState<Tipologia[]>([]);
  const [fornitori, setFornitori] = useState<Fornitore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTipologiaId, setSelectedTipologiaId] = useState<string | null>(null);
  const [selectedFornitoreId, setSelectedFornitoreId] = useState<string | null>(null);
  const [tipologieOpen, setTipologieOpen] = useState(false);
  const [fornitoriOpen, setFornitoriOpen] = useState(false);

  async function handleSelectCsv() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const text = await response.text();

      const parsed = parseArticlesCsv(text);

      Alert.alert(
        'CSV valido',
        `Articoli: ${parsed.articoli.length}\nTipologie: ${parsed.tipologieUniche.length}\nFornitori: ${parsed.fornitoriUnici.length}`
      );
    } catch (error: any) {
      console.error('[Database] CSV import error', error);
      Alert.alert(
        'Errore CSV',
        error?.message ?? 'Si è verificato un errore durante la lettura del file CSV.'
      );
    } finally {
      setIsCsvModalVisible(false);
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => {
            setIsCsvModalVisible(true);
          }}
          style={({ pressed }) => [
            { paddingLeft: Spacing['4xl'], paddingRight: Spacing.sm },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Upload size={20} color={theme.primary} />
        </Pressable>
      ),
    });
  }, [navigation, theme.primary]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [tipologieData, fornitoriData, articoliData] = await Promise.all([
          supabaseDataClient.tipologie.getAll(),
          supabaseDataClient.fornitori.getAll(),
          supabaseDataClient.articoli.getAll(),
        ]);

        if (!isMounted) return;

        setTipologie(tipologieData);
        setFornitori(fornitoriData);
        setArticoli(articoliData);
      } catch (error) {
        console.error('[Database] Errore caricamento dati da Supabase', error);
        if (!isMounted) return;
        setTipologie([]);
        setFornitori([]);
        setArticoli([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredArticoli = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return articoli
      .filter((item) => {
        const matchSearch = !query || item.nome.toLowerCase().includes(query);
        const matchTipologia = !selectedTipologiaId || item.tipologiaId === selectedTipologiaId;
        const matchFornitore = !selectedFornitoreId || item.fornitoreId === selectedFornitoreId;

        return matchSearch && matchTipologia && matchFornitore;
      })
      .slice()
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [articoli, searchQuery, selectedTipologiaId, selectedFornitoreId]);

  const getTipologiaName = (id: string) => {
    return tipologie.find((t) => t.id === id)?.nome || 'N/A';
  };

  const getFornitoreNome = (id: string) => {
    return fornitori.find((f) => f.id === id)?.nome || 'N/A';
  };

  return (
    <ScreenScrollView scrollEnabled={false} contentContainerStyle={{ flexGrow: 1 }}>
      <View>
        <DatabaseCsvModal
          visible={isCsvModalVisible}
          onClose={() => setIsCsvModalVisible(false)}
          onSelectCsv={handleSelectCsv}
        />

        <TipologieModal
          visible={isTipologieModalVisible}
          onClose={() => setIsTipologieModalVisible(false)}
          tipologie={tipologie}
          onChangeTipologie={setTipologie}
        />

        <DatabaseFiltersSection
          tipologie={tipologie}
          fornitori={fornitori}
          selectedTipologiaId={selectedTipologiaId}
          selectedFornitoreId={selectedFornitoreId}
          onChangeTipologia={setSelectedTipologiaId}
          onChangeFornitore={setSelectedFornitoreId}
          tipologieOpen={tipologieOpen}
          setTipologieOpen={setTipologieOpen}
          fornitoriOpen={fornitoriOpen}
          setFornitoriOpen={setFornitoriOpen}
          onEditTipologie={() => setIsTipologieModalVisible(true)}
        />

        <View style={styles.articoliSection}>
          <ThemedText style={styles.sectionTitle}>Articoli</ThemedText>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cerca articoli..."
          />

          <ScrollView style={styles.articoliScroll} contentContainerStyle={styles.list}>
            {filteredArticoli.map((item) => (
              <ItemCard
                key={item.id}
                title={item.nome}
                subtitle={`${getTipologiaName(item.tipologiaId)} • ${getFornitoreNome(item.fornitoreId)}`}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </ScreenScrollView>
  );
}
