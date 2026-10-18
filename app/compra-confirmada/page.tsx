"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StoreHeader from "@/app/components/store-header";
import { Compra, formatMoney, LAST_ORDER_KEY, requestApi } from "@/app/lib/api";

export default function CompraConfirmadaPage() {
  const [compra, setCompra] = useState<Compra | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = window.localStorage.getItem(LAST_ORDER_KEY);
    if (!id) { setError("No hay una compra reciente para mostrar."); setCargando(false); return; }
    requestApi<Compra>(`/api/compras/${encodeURIComponent(id)}`)
      .then(setCompra)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "No se pudo cargar el recibo."))
      .finally(() => setCargando(false));
  }, []);

  return (
    <main className="app-shell"><StoreHeader />
      {cargando ? <p className="empty">Cargando comprobante…</p> : compra ? <section className="confirmation-wrap"><div className="confirmation-mark" aria-hidden="true">✓</div><p className="eyebrow">PEDIDO REGISTRADO</p><h1>¡Compra confirmada!</h1><p className="confirmation-copy">Tu pedido quedó guardado y el inventario se actualizó.</p><article className="panel receipt"><div className="receipt-heading"><div><p className="eyebrow">COMPROBANTE</p><h2>Pedido #{compra.id}</h2></div><span className="receipt-status">Confirmado</span></div><p className="receipt-date">{new Date(compra.createdAt).toLocaleString("es-BO")}</p>{compra.items.map((item) => <div className="receipt-row" key={`${item.productoId}-${item.nombre}`}><span>{item.cantidad} × {item.nombre}<small>{formatMoney(item.precioUnitario)} c/u</small></span><strong>{formatMoney(item.subtotal)}</strong></div>)}<div className="summary-line"><span>Unidades</span><strong>{compra.totalUnidades}</strong></div><div className="summary-line total-line"><span>Total pagado</span><strong>{formatMoney(compra.total)}</strong></div></article><Link className="primary-button button-link" href="/">Volver a la tienda</Link></section> : <section className="panel empty-state"><h2>No encontramos el comprobante</h2><p>{error}</p><Link className="primary-button button-link" href="/">Volver al catálogo</Link></section>}
      <footer className="site-footer"><span>Mercado UPB</span><span>Gracias por tu compra</span></footer>
    </main>
  );
}