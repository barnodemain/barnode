import { supabase, isSupabaseConfigured } from '../shared/services/supabaseClient';
import type {
  CreateOrderWithLinesInput,
  Order,
  OrderLine,
  OrderStatus,
  OrderWithLines,
  UpdateOrderInput,
} from '../types';

export interface RepositoryResult<T> {
  data: T | null;
  error: Error | null;
}

async function wrapQuery<T>(
  fn: () => Promise<{ data: T | null; error: unknown }>
): Promise<RepositoryResult<T>> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase non configurato (env mancanti).') };
  }

  const { data, error } = await fn();
  if (error) {
    console.error('[ordersRepository] Errore Supabase', error);
    const message =
      typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: unknown }).message ?? error)
        : String(error);
    return { data: null, error: new Error(message) };
  }

  return { data: data ?? null, error: null };
}

interface OrderRow {
  id: string;
  fornitore_id: string;
  data_creazione: string;
  data_consegna?: string | null;
  status: string;
  totale_righe?: number | null;
  note?: string | null;
  whatsapp_text?: string | null;
}

function mapOrderRow(row: OrderRow): Order {
  return {
    id: row.id,
    supplierId: row.fornitore_id,
    createdAt: row.data_creazione,
    expectedDeliveryAt: row.data_consegna ?? undefined,
    status: row.status as OrderStatus,
    totalLines: typeof row.totale_righe === 'number' ? row.totale_righe : 0,
    note: row.note ?? undefined,
    whatsappText: row.whatsapp_text ?? undefined,
  };
}

interface OrderLineRow {
  id: string;
  ordine_id: string;
  articolo_id: string;
  quantita: number;
  unita: string;
  note?: string | null;
}

function mapOrderLineRow(row: OrderLineRow): OrderLine {
  return {
    id: row.id,
    orderId: row.ordine_id,
    articleId: row.articolo_id,
    quantity: row.quantita,
    unit: row.unita as OrderUnit,
    note: row.note ?? undefined,
  };
}

export async function getActiveOrders(): Promise<RepositoryResult<Order[]>> {
  return wrapQuery(async () => {
    const { data, error } = await supabase
      .from('ordini')
      .select(
        'id, fornitore_id, data_creazione, data_consegna, status, note, totale_righe, whatsapp_text'
      )
      .neq('status', 'archiviato')
      .order('data_creazione', { ascending: false });

    const mapped = (data ?? []).map(mapOrderRow);
    return { data: mapped, error };
  });
}

export async function getArchivedOrders(): Promise<RepositoryResult<Order[]>> {
  return wrapQuery(async () => {
    const { data, error } = await supabase
      .from('ordini')
      .select(
        'id, fornitore_id, data_creazione, data_consegna, status, note, totale_righe, whatsapp_text'
      )
      .eq('status', 'archiviato')
      .order('data_creazione', { ascending: false });

    const mapped = (data ?? []).map(mapOrderRow);
    return { data: mapped, error };
  });
}

export async function getOrderById(id: string): Promise<RepositoryResult<OrderWithLines>> {
  return wrapQuery(async () => {
    const { data: orderRow, error: orderError } = await supabase
      .from('ordini')
      .select(
        'id, fornitore_id, data_creazione, data_consegna, status, note, totale_righe, whatsapp_text'
      )
      .eq('id', id)
      .single();

    if (orderError || !orderRow) {
      return { data: null, error: orderError };
    }

    const { data: lineRows, error: linesError } = await supabase
      .from('ordini_articoli')
      .select('id, ordine_id, articolo_id, quantita, unita, note')
      .eq('ordine_id', id)
      .order('id', { ascending: true });

    if (linesError) {
      return { data: null, error: linesError };
    }

    const order = mapOrderRow(orderRow);
    const lines = (lineRows ?? []).map(mapOrderLineRow);

    // Recupero nome fornitore e nomi articoli per il testo WhatsApp.
    const { data: supplierRow } = await supabase
      .from('fornitori')
      .select('id, nome')
      .eq('id', orderRow.fornitore_id)
      .single();

    const supplierName: string | undefined = supplierRow?.nome ?? undefined;

    const articleIds = Array.from(new Set(lines.map((line) => line.articleId)));
    const { data: articleRows } = await supabase
      .from('articoli')
      .select('id, nome')
      .in('id', articleIds);

    const articleNameById = new Map<string, string>();
    for (const row of articleRows ?? []) {
      articleNameById.set(row.id as string, row.nome as string);
    }

    const linesForText: WhatsappLine[] = lines.map((line) => ({
      quantity: line.quantity,
      unit: line.unit,
      articleName: articleNameById.get(line.articleId) ?? line.articleId,
      fromMissing: false,
    }));

    const whatsappText = buildWhatsappText({
      createdAt: order.createdAt,
      lines: linesForText,
      supplierName,
    });

    await supabase.from('ordini').update({ whatsapp_text: whatsappText }).eq('id', id);

    const orderWithLines: OrderWithLines = {
      ...order,
      whatsappText,
      lines,
    };

    return {
      data: orderWithLines,
      error: null,
    };
  });
}

export async function createOrderWithLines(
  payload: CreateOrderWithLinesInput
): Promise<RepositoryResult<OrderWithLines>> {
  return wrapQuery(async () => {
    const totalLinesForInsert = payload.lines.length;

    const { data: orderRow, error: orderError } = await supabase
      .from('ordini')
      .insert({
        fornitore_id: payload.supplierId,
        data_creazione: new Date().toISOString(),
        data_consegna: payload.expectedDeliveryAt ?? null,
        status: 'bozza',
        totale_righe: totalLinesForInsert,
        note: payload.note ?? null,
      })
      .select(
        'id, fornitore_id, data_creazione, data_consegna, status, note, totale_righe, whatsapp_text'
      )
      .single();

    if (orderError || !orderRow) {
      return { data: null, error: orderError };
    }

    const orderId = orderRow.id as string;

    const lineInserts = payload.lines.map((line) => ({
      ordine_id: orderId,
      articolo_id: line.articleId,
      quantita: line.quantity,
      unita: line.unit,
      note: line.note ?? null,
    }));

    const { data: lineRows, error: linesError } = await supabase
      .from('ordini_articoli')
      .insert(lineInserts)
      .select('id, ordine_id, articolo_id, quantita, unita, note');

    if (linesError) {
      return { data: null, error: linesError };
    }

    const order = mapOrderRow(orderRow);
    const lines = (lineRows ?? []).map(mapOrderLineRow);

    return {
      data: { ...order, lines },
      error: null,
    };
  });
}

export async function archiveOrder(id: string): Promise<RepositoryResult<Order>> {
  return wrapQuery(async () => {
    const { data, error } = await supabase
      .from('ordini')
      .update({ status: 'archiviato' })
      .eq('id', id)
      .select(
        'id, fornitore_id, data_creazione, data_consegna, status, note, totale_righe, whatsapp_text'
      )
      .single();

    const mapped = data ? mapOrderRow(data) : null;
    return { data: mapped, error };
  });
}

interface WhatsappLine {
  quantity: number;
  unit: string;
  articleName: string;
  fromMissing?: boolean;
}

interface WhatsappOrderLike {
  createdAt: string;
  lines: WhatsappLine[];
  supplierName?: string;
}

export function buildWhatsappText(order: WhatsappOrderLike): string {
  const parts: string[] = [];

  const supplierLabel = order.supplierName ? ` — ${order.supplierName}` : '';
  parts.push(`Ordine BARnode${supplierLabel}`);

  const createdDate = new Date(order.createdAt);
  if (!Number.isNaN(createdDate.getTime())) {
    parts.push(`Data: ${createdDate.toLocaleDateString()}`);
  }

  parts.push('');
  parts.push('Articoli:');

  for (const line of order.lines) {
    const unitLabel = line.unit === 'scatola' ? 'cartoni' : 'pezzi';
    const base = `• ${line.quantity} ${unitLabel} — ${line.articleName}`;
    const suffix = line.fromMissing ? ' (mancante)' : '';
    parts.push(base + suffix);
  }

  return parts.join('\n');
}

export async function deleteOrder(id: string): Promise<RepositoryResult<null>> {
  return wrapQuery(async () => {
    const { error: linesError } = await supabase
      .from('ordini_articoli')
      .delete()
      .eq('ordine_id', id);

    if (linesError) {
      return { data: null, error: linesError };
    }

    const { error } = await supabase.from('ordini').delete().eq('id', id);
    return { data: null, error };
  });
}

export async function updateOrder(
  id: string,
  payload: UpdateOrderInput
): Promise<RepositoryResult<Order>> {
  return wrapQuery(async () => {
    const update: Record<string, unknown> = {};

    if (payload.status !== undefined) {
      update.status = payload.status;
    }

    if (payload.expectedDeliveryAt !== undefined) {
      update.data_consegna = payload.expectedDeliveryAt;
    }

    if (payload.note !== undefined) {
      update.note = payload.note;
    }

    if (Array.isArray(payload.lines)) {
      // Le righe verranno riallineate più sotto; qui impostiamo solo totale_righe
      update.totale_righe = payload.lines.length;
    }

    // Aggiorno la testata ordine
    const { data: orderRow, error: orderError } = await supabase
      .from('ordini')
      .update(update)
      .eq('id', id)
      .select(
        'id, fornitore_id, data_creazione, data_consegna, status, note, totale_righe, whatsapp_text'
      )
      .single();

    if (orderError || !orderRow) {
      return { data: null, error: orderError };
    }

    // Se vengono fornite nuove righe, cancello e reinserisco in ordini_articoli
    if (Array.isArray(payload.lines)) {
      const { error: deleteError } = await supabase
        .from('ordini_articoli')
        .delete()
        .eq('ordine_id', id);

      if (deleteError) {
        return { data: null, error: deleteError };
      }

      if (payload.lines.length > 0) {
        const lineInserts = payload.lines.map((line) => ({
          ordine_id: id,
          articolo_id: line.articleId,
          quantita: line.quantity,
          unita: line.unit,
          note: line.note ?? null,
        }));

        const { error: insertError } = await supabase.from('ordini_articoli').insert(lineInserts);

        if (insertError) {
          return { data: null, error: insertError };
        }
      }
    }

    // Ricarico sempre le righe attuali per calcolare whatsapp_text e totale_righe
    const { data: lineRows, error: linesError } = await supabase
      .from('ordini_articoli')
      .select('id, ordine_id, articolo_id, quantita, unita, note')
      .eq('ordine_id', id)
      .order('id', { ascending: true });

    if (linesError) {
      return { data: null, error: linesError };
    }

    const order = mapOrderRow(orderRow);
    const lines = (lineRows ?? []).map(mapOrderLineRow);

    // Recupero nome fornitore e nomi articoli per il testo WhatsApp
    const { data: supplierRow } = await supabase
      .from('fornitori')
      .select('id, nome')
      .eq('id', orderRow.fornitore_id)
      .single();

    const supplierName: string | undefined = supplierRow?.nome ?? undefined;

    const articleIds = Array.from(new Set(lines.map((line) => line.articleId)));
    const { data: articleRows } = await supabase
      .from('articoli')
      .select('id, nome')
      .in('id', articleIds);

    const articleNameById = new Map<string, string>();
    for (const row of articleRows ?? []) {
      articleNameById.set(row.id as string, row.nome as string);
    }

    const linesForText = lines.map((line) => ({
      quantity: line.quantity,
      unit: line.unit,
      articleName: articleNameById.get(line.articleId) ?? line.articleId,
      fromMissing: false,
    }));

    const whatsappText = buildWhatsappText({
      createdAt: order.createdAt,
      lines: linesForText,
      supplierName,
    });

    await supabase
      .from('ordini')
      .update({
        whatsapp_text: whatsappText,
        totale_righe: lines.length,
      })
      .eq('id', id);

    const finalOrder: Order = {
      ...order,
      totalLines: lines.length,
      whatsappText,
    };

    return { data: finalOrder, error: null };
  });
}
