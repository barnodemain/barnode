import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ItemCard } from '@/shared/components/ItemCard';
import { Articolo } from '@/shared/types';
import { styles } from '../CreateOrderPanel.styles';
import { useTheme } from '@/hooks/useTheme';

interface OrderArticlesListProps {
  supplierName: string;
  articles: Articolo[];
  missingIds: string[];
  loading: boolean;
  error: string | null;
}

export function OrderArticlesList({
  supplierName,
  articles,
  missingIds,
  loading,
  error,
}: OrderArticlesListProps) {
  const { theme } = useTheme();

  if (!supplierName) return null;

  return (
    <View style={styles.articlesSection}>
      <ThemedText style={styles.articlesTitle}>Articoli di {supplierName}</ThemedText>

      {loading && (
        <ThemedText style={{ color: theme.textSecondary }}>
          Caricamento articoli...
        </ThemedText>
      )}

      {error && !loading && (
        <ThemedText style={{ color: theme.textSecondary }}>{error}</ThemedText>
      )}

      {!loading && !error && articles.length === 0 && (
        <ThemedText style={{ color: theme.textSecondary }}>
          Nessun articolo associato a questo fornitore.
        </ThemedText>
      )}

      {!loading && !error && articles.length > 0 && (
        <View style={styles.articlesList}>
          {articles.map((article) => {
            const isMissing = missingIds.includes(article.id);
            return (
              <ItemCard
                key={article.id}
                title={article.nome}
                titleColor={isMissing ? '#F5D027' : undefined}
                subtitle={isMissing ? 'Articolo mancante' : undefined}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}
