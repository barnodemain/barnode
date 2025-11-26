import { useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured } from '../shared/services/supabaseClient';
import {
  archiveOrder as repoArchiveOrder,
  deleteOrder as repoDeleteOrder,
  getActiveOrders,
  getArchivedOrders,
  getOrderById as repoGetOrderById,
  updateOrder as repoUpdateOrder,
} from '../repositories/ordersRepository';
import type { CreateOrderLineInput, Order, OrderUnit, OrderWithLines } from '../types';

interface DraftOrderLine extends CreateOrderLineInput {}

export function useOrders() {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [archivedOrders, setArchivedOrders] = useState<Order[]>([]);
  const [loadedFromSupabase, setLoadedFromSupabase] = useState(false);

  const [draftSupplierId, setDraftSupplierId] = useState<string | null>(null);
  const [draftLinesByArticleId, setDraftLinesByArticleId] = useState<Record<string, DraftOrderLine>>({});

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      if (!isSupabaseConfigured) {
        setActiveOrders([]);
        setArchivedOrders([]);
        setLoadedFromSupabase(false);
        return;
      }

      const [activeRes, archivedRes] = await Promise.all([
        getActiveOrders(),
        getArchivedOrders(),
      ]);

      if (!active) return;

      if (activeRes.error || archivedRes.error) {
        console.error('[useOrders] Errore caricamento iniziale ordini');
        setActiveOrders([]);
        setArchivedOrders([]);
        setLoadedFromSupabase(false);
        return;
      }

      setActiveOrders(activeRes.data ?? []);
      setArchivedOrders(archivedRes.data ?? []);
      setLoadedFromSupabase(true);
    }

    loadInitial();

    return () => {
      active = false;
    };
  }, []);

  const canSendOrder = useMemo(() => {
    const hasSupplier = Boolean(draftSupplierId);
    const lines = Object.values(draftLinesByArticleId);
    const hasValidLines = lines.some((line) => line.quantity > 0);
    return hasSupplier && hasValidLines;
  }, [draftLinesByArticleId, draftSupplierId]);

  const loadActiveOrders = async () => {
    if (!isSupabaseConfigured) return;
    const res = await getActiveOrders();
    if (res.error || !res.data) return;
    setActiveOrders(res.data);
  };

  const loadArchivedOrders = async () => {
    if (!isSupabaseConfigured) return;
    const res = await getArchivedOrders();
    if (res.error || !res.data) return;
    setArchivedOrders(res.data);
  };

  const archiveOrder = async (id: string) => {
    if (!loadedFromSupabase || !isSupabaseConfigured) {
      setActiveOrders((current) => current.filter((order) => order.id !== id));
      return;
    }

    const { data, error } = await repoArchiveOrder(id);
    if (error || !data) return;

    setActiveOrders((current) => current.filter((order) => order.id !== id));
    setArchivedOrders((current) => [data, ...current]);
  };

  const deleteOrder = async (id: string) => {
    if (!loadedFromSupabase || !isSupabaseConfigured) {
      setActiveOrders((current) => current.filter((order) => order.id !== id));
      setArchivedOrders((current) => current.filter((order) => order.id !== id));
      return;
    }

    const { error } = await repoDeleteOrder(id);
    if (error) return;

    setActiveOrders((current) => current.filter((order) => order.id !== id));
    setArchivedOrders((current) => current.filter((order) => order.id !== id));
  };

  const getOrderById = async (id: string): Promise<OrderWithLines | null> => {
    if (!isSupabaseConfigured) return null;
    const res = await repoGetOrderById(id);
    if (res.error || !res.data) return null;
    return res.data;
  };

  const finalizeCreatedOrder = async (id: string): Promise<OrderWithLines | null> => {
    return getOrderById(id);
  };

  const setDraftLine = (articleId: string, quantity: number, unit: OrderUnit, note?: string) => {
    setDraftLinesByArticleId((current) => {
      if (quantity <= 0) {
        const { [articleId]: _removed, ...rest } = current;
        return rest;
      }

      return {
        ...current,
        [articleId]: {
          articleId,
          quantity,
          unit,
          note,
        },
      };
    });
  };

  const removeDraftLine = (articleId: string) => {
    setDraftLinesByArticleId((current) => {
      const { [articleId]: _removed, ...rest } = current;
      return rest;
    });
  };

  const resetDraft = () => {
    setDraftSupplierId(null);
    setDraftLinesByArticleId({});
  };

  const editDraftFromOrder = (order: OrderWithLines) => {
    setDraftSupplierId(order.supplierId);

    const nextLines: Record<string, DraftOrderLine> = {};
    for (const line of order.lines) {
      nextLines[line.articleId] = {
        articleId: line.articleId,
        quantity: line.quantity,
        unit: line.unit as OrderUnit,
        note: line.note,
      };
    }

    setDraftLinesByArticleId(nextLines);
  };

  const finalizeEditOrder = async (
    id: string,
    lines: CreateOrderLineInput[]
  ): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;

    const { data, error } = await repoUpdateOrder(id, { lines });
    if (error || !data) {
      console.error('[useOrders] Errore durante updateOrder', error);
      return false;
    }

    resetDraft();
    await loadActiveOrders();
    await loadArchivedOrders();

    return true;
  };

  return {
    activeOrders,
    archivedOrders,
    loadActiveOrders,
    loadArchivedOrders,
    archiveOrder,
    deleteOrder,
    getOrderById,
    finalizeCreatedOrder,
    draftSupplierId,
    setDraftSupplierId,
    draftLinesByArticleId,
    setDraftLine,
    removeDraftLine,
    resetDraft,
    editDraftFromOrder,
    finalizeEditOrder,
    canSendOrder,
  };
}
