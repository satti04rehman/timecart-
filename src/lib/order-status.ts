export const ORDER_STATUS_LABELS: Record<string, string> = {
  PLACED: "Processing",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
  REFUNDED: "Refunded",
};

export const ORDER_LABEL_TO_STATUS: Record<string, string> = Object.fromEntries(
  Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => [label, status])
);

export const ORDER_STATUS_OPTIONS = Object.values(ORDER_STATUS_LABELS);

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: "Cash on Delivery",
  BANK_TRANSFER: "Bank Transfer",
  CARD: "Card",
  JAZZCASH: "JazzCash",
  EASYPAISA: "EasyPaisa",
};

export const PAYMENT_LABEL_TO_METHOD: Record<string, string> = {
  "Cash on Delivery": "CASH_ON_DELIVERY",
  "Bank Transfer": "BANK_TRANSFER",
  Card: "CARD",
  JazzCash: "JAZZCASH",
  EasyPaisa: "EASYPAISA",
};