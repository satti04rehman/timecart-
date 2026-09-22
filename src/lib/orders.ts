export interface StoredOrder {
  orderNumber: string;
  trackingToken?: string;
  date: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  discount: number;
  deposit: number;
  total: number;
  status: string;
  items: { name: string; qty: number; price: number }[];
}

export function readStoredOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("tc-orders") ?? "[]");
  } catch {
    return [];
  }
}

export function saveStoredOrder(order: StoredOrder) {
  const all = readStoredOrders().filter(
    (o) => o.orderNumber !== order.orderNumber
  );
  all.push(order);
  localStorage.setItem("tc-orders", JSON.stringify(all));
  localStorage.setItem(`tc-order-${order.orderNumber}`, JSON.stringify(order));
}

export function readStoredOrder(number: string): StoredOrder | null {
  if (typeof window === "undefined") return null;
  const direct = localStorage.getItem(`tc-order-${number}`);
  if (direct) {
    try {
      return JSON.parse(direct);
    } catch {}
  }
  return (
    readStoredOrders().find(
      (o) => o.orderNumber.toLowerCase() === number.trim().toLowerCase()
    ) ?? null
  );
}