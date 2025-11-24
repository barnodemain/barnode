import { useEffect, useState } from 'react';
import { supabaseDataClient } from '@/shared/services/supabaseDataClient';
import { Articolo, Fornitore } from '@/shared/types';

// Cache in memoria per ridurre i tempi di attesa tra un accesso e l'altro
let suppliersCache: Fornitore[] | null = null;
let missingIdsCache: string[] | null = null;
const articlesBySupplierCache: Record<string, Articolo[]> = {};

export function useCreateOrderData() {
  const [suppliers, setSuppliers] = useState<Fornitore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Fornitore | null>(null);
  const [articles, setArticles] = useState<Articolo[]>([]);
  const [missingIds, setMissingIds] = useState<string[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSuppliers() {
      try {
        if (suppliersCache && suppliersCache.length > 0) {
          if (!isMounted) return;
          setSuppliers(suppliersCache);
          return;
        }

        const data = await supabaseDataClient.fornitori.getAll();
        if (!isMounted) return;
        const sorted = data.sort((a, b) =>
          a.nome.localeCompare(b.nome, 'it', { sensitivity: 'base' }),
        );
        suppliersCache = sorted;
        setSuppliers(sorted);
      } catch (e) {
        console.error('[Ordini] Errore caricamento fornitori', e);
        if (!isMounted) return;
        setError('Errore nel caricamento dei fornitori');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSuppliers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const maybeId = selectedSupplier?.id;
    if (!maybeId) return;
    const supplierId: string = maybeId;
    setArticlesLoading(true);
    setArticlesError(null);

    async function loadArticlesForSupplier() {
      try {
        if (articlesBySupplierCache[supplierId] && missingIdsCache) {
          if (!isMounted) return;
          setMissingIds(missingIdsCache);
          setArticles(articlesBySupplierCache[supplierId]);
          setArticlesLoading(false);
          return;
        }

        const [allArticles, missing] = await Promise.all([
          supabaseDataClient.articoli.getAll(),
          supabaseDataClient.articoliMancanti.getAllIds(),
        ]);

        if (!isMounted) return;

        const supplierArticles = allArticles.filter(
          (article) => article.fornitoreId === supplierId,
        );

        const sorted = supplierArticles.slice().sort((a, b) => {
          const aMissing = missing.includes(a.id);
          const bMissing = missing.includes(b.id);
          if (aMissing !== bMissing) {
            return aMissing ? -1 : 1;
          }
          return a.nome.localeCompare(b.nome, 'it', { sensitivity: 'base' });
        });

        missingIdsCache = missing;
        articlesBySupplierCache[supplierId] = sorted;
        setMissingIds(missing);
        setArticles(sorted);
      } catch (e) {
        console.error('[Ordini] Errore caricamento articoli per fornitore', e);
        if (!isMounted) return;
        setArticles([]);
        setArticlesError('Errore nel caricamento degli articoli');
      } finally {
        if (isMounted) {
          setArticlesLoading(false);
        }
      }
    }

    loadArticlesForSupplier();

    return () => {
      isMounted = false;
    };
  }, [selectedSupplier]);

  return {
    suppliers,
    loading,
    error,
    selectedSupplier,
    setSelectedSupplier,
    articles,
    missingIds,
    articlesLoading,
    articlesError,
  };
}
