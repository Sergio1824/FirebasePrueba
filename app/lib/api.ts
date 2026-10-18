export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://backendupbtest-prueba.onrender.com").replace(/\/$/, "");
export const CART_KEY = "upb-store-cart-v1";
export const LAST_ORDER_KEY = "upb-store-last-order-v1";
export const CART_EVENT = "upb-store-cart-updated";

export type CartLine = { productoId: number; cantidad: number };
export type Producto = { id: number; nombre: string; precio: number | string; stock: number };
export type DetalleCompra = { productoId: number; nombre: string; cantidad: number; precioUnitario: number; subtotal: number };
export type ResumenCarrito = { items: DetalleCompra[]; totalUnidades: number; subtotal: number; total: number };
export type Compra = ResumenCarrito & { id: number; createdAt: string };

export async function requestApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `No se pudo completar la solicitud.`);
  }
  return data as T;
}

export function readCart(): CartLine[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((line): line is CartLine =>
      Number.isInteger(line?.productoId) && line.productoId > 0 &&
      Number.isInteger(line?.cantidad) && line.cantidad > 0,
    );
  } catch {
    return [];
  }
}

export function saveCart(items: CartLine[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function formatMoney(value: number | string) {
  return new Intl.NumberFormat("es-BO", { style: "currency", currency: "BOB" }).format(Number(value));
}