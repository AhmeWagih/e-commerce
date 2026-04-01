/** Normalized order for UI (GET /orders and POST responses). */
export interface OrderLineItem {
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
}

export type OrderStatus = string;

export interface Order {
  id: string;
  items: OrderLineItem[];
  total: number;
  status: OrderStatus;
  paymentStatus?: string;
  createdAt: string;
  raw?: unknown;
}

function pickString(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function pickNumber(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

/** Maps API line items to OrderLineItem. */
export function normalizeLineItems(raw: unknown): OrderLineItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    const r = row as Record<string, unknown>;
    const product = r['product'] as Record<string, unknown> | string | undefined;
    const nameFromProduct =
      typeof product === 'object' && product !== null
        ? pickString(product['title']) ?? pickString(product['name'])
        : undefined;
    const name =
      nameFromProduct ??
      pickString(r['name']) ??
      pickString(r['title']) ??
      'Product';
    const qty = pickNumber(r['quantity']) ?? 0;
    const unit =
      pickNumber(r['unitPrice']) ??
      pickNumber(r['price']) ??
      pickNumber(r['priceAfterDiscount']) ??
      0;
    const lineTotal = pickNumber(r['lineTotal']) ?? pickNumber(r['itemTotalPrice']) ?? unit * qty;
    const productId =
      typeof product === 'string'
        ? product
        : typeof product === 'object' && product !== null
          ? pickString(product['_id']) ?? pickString(product['id'])
          : pickString(r['productId']) ?? pickString(r['product']);

    return {
      productId,
      name,
      quantity: qty,
      unitPrice: unit,
      lineTotal,
    };
  });
}

export function normalizeOrder(raw: unknown): Order | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id =
    pickString(o['_id']) ?? pickString(o['id']) ?? pickString(o['orderId']) ?? pickString(o['orderNumber']);
  if (!id) return null;

  const items = normalizeLineItems(o['items'] ?? o['orderItems'] ?? o['lines']);
  const total =
    pickNumber(o['totalAmount']) ??
    pickNumber(o['total']) ??
    pickNumber(o['amount']) ??
    pickNumber(o['shippingCost']) ??
    items.reduce((s, it) => s + (it.lineTotal ?? it.unitPrice * it.quantity), 0);

  const createdAt =
    pickString(o['createdAt']) ?? pickString(o['created_at']) ?? new Date().toISOString();

  const status = pickString(o['status']) ?? 'pending';
  const paymentStatus = pickString(o['paymentStatus']) ?? pickString(o['payment_status']);

  return {
    id,
    items,
    total,
    status,
    paymentStatus,
    createdAt,
    raw: o,
  };
}

export function extractOrdersFromListResponse(body: unknown): unknown[] {
  if (!body || typeof body !== 'object') return [];
  const b = body as Record<string, unknown>;
  const data = b['data'];
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d['orders'])) return d['orders'];
    if (Array.isArray(d['data'])) return d['data'];
  }
  if (Array.isArray(b['orders'])) return b['orders'];
  return [];
}

export function extractSessionUrl(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const b = body as Record<string, unknown>;
  const top = pickString(b['sessionUrl']) ?? pickString(b['session_url']) ?? pickString(b['url']);
  if (top) return top;
  const data = b['data'];
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    const direct = pickString(d['sessionUrl']) ?? pickString(d['session_url']) ?? pickString(d['url']);
    if (direct) return direct;

    const stripeSession = d['stripeSession'];
    if (stripeSession && typeof stripeSession === 'object') {
      const s = stripeSession as Record<string, unknown>;
      return pickString(s['url']);
    }
  }
  return undefined;
}
