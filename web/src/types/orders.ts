export enum OrderStatus {
  Draft = 'bozza',
  Sent = 'inviato',
  Received = 'ricevuto',
  Archived = 'archiviato',
}

export enum OrderUnit {
  Piece = 'pezzo',
  Box = 'scatola',
  Kg = 'kg',
  Liter = 'litro',
  Other = 'altro',
}

export interface OrderLine {
  id: string;
  orderId: string;
  articleId: string;
  quantity: number;
  unit: OrderUnit;
  note?: string;
}

export interface Order {
  id: string;
  supplierId: string;
  createdAt: string;
  expectedDeliveryAt?: string;
  status: OrderStatus;
  totalLines: number;
  note?: string;
  whatsappText?: string;
}

export interface OrderWithLines extends Order {
  lines: OrderLine[];
}

export interface CreateOrderLineInput {
  articleId: string;
  quantity: number;
  unit: OrderUnit;
  note?: string;
}

export interface CreateOrderWithLinesInput {
  supplierId: string;
  lines: CreateOrderLineInput[];
  expectedDeliveryAt?: string;
  note?: string;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  expectedDeliveryAt?: string | null;
  note?: string | null;
  lines?: CreateOrderLineInput[];
}
