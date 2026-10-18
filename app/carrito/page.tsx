"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StoreHeader from "@/app/components/store-header";
import { CartLine, Compra, formatMoney, LAST_ORDER_KEY, Producto, ResumenCarrito, readCart, requestApi, saveCart } from "@/app/lib/api";

export default function CarritoPage() {
  const router = useRouter();
  const [lineas, setLineas] = useState<CartLine[]>([]);
  const [catalogo, setCatalogo] = useState<Producto[]>([]);
  const [resumen, setResumen] = useState<ResumenCarrito | null>(null);
  const [listo, setListo] = useState(false);
  const [calculando, setCalculando] = useState(false);
  const [comprando, setComprando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLineas(readCart());
    setListo(true);
    requestApi<Producto[]>("/api/productos").then(setCatalogo).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!listo) return;
    saveCart(lineas);
    if (lineas.length === 0) { setResumen(null); setError(""); return; }
    let cancelado = false;
    setCalculando(true);
    setError("");
    requestApi<ResumenCarrito>("/api/carrito/calcular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: lineas }),
    }).then((quote) => { if (!cancelado) setResumen(quote); })
      .catch((e: unknown) => { if (!cancelado) { setResumen(null); setError(e instanceof Error ? e.message : "No se pudo calcular el carrito."); } })
      .finally(() => { if (!cancelado) setCalculando(false); });
    return () => { cancelado = true; };
  }, [lineas, listo]);

  function cambiarCantidad(productoId: number, cantidad: number) {
    setLineas((current) => current.flatMap((line) => {
      if (line.productoId !== productoId) return [line];
      return cantidad <= 0 ? [] : [{ ...line, cantidad }];
    }));
  }

  async function confirmarCompra() {
    setComprando(true);
    setError("");
    try {
      const compra = await requestApi<Compra>("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lineas }),
      });
      window.localStorage.setItem(LAST_ORDER_KEY, String(compra.id));
      setLineas([]);
      saveCart([]);
      router.push("/compra-confirmada/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo confirmar la compra.");
      setComprando(false);
    }
  }

  return (
    <main className="app-shell"><StoreHeader />
      <section className="page-intro"><p className="eyebrow">TU PEDIDO</p><h1>Carrito de compras</h1><p>Revisa cantidades y el total calculado por el backend antes de confirmar.</p></section>
      {error && <p className="notice error" role="alert">{error}</p>}
      {!listo ? <p className="empty">Cargando carrito…</p> : lineas.length === 0 ? <section className="panel empty-state"><span className="empty-icon" aria-hidden="true">＋</span><h2>Tu carrito está vacío</h2><p>Vuelve al catálogo y añade productos para ver el cálculo de tu pedido.</p><Link className="primary-button button-link" href="/">Ir al catálogo</Link></section> : <section className="cart-layout"><div className="panel cart-panel"><div className="section-heading"><div><p className="eyebrow">PRODUCTOS SELECCIONADOS</p><h2>{lineas.length} {lineas.length === 1 ? "artículo" : "artículos"}</h2></div><button className="text-button" onClick={() => setLineas([])}>Vaciar carrito</button></div>
        {lineas.map((linea) => {
          const cotizado = resumen?.items.find((item) => item.productoId === linea.productoId);
          const producto = catalogo.find((item) => item.id === linea.productoId);
          const nombre = cotizado?.nombre || producto?.nombre || `Producto #${linea.productoId}`;
          const precio = cotizado?.precioUnitario ?? Number(producto?.precio || 0);
          const totalLinea = cotizado?.subtotal ?? precio * linea.cantidad;
          return <article className="cart-row" key={linea.productoId}><div className="cart-product-icon" aria-hidden="true">{nombre.slice(0, 1).toUpperCase()}</div><div className="cart-product-name"><strong>{nombre}</strong><small>{formatMoney(precio)} por unidad</small></div><div className="quantity-control" aria-label={`Cantidad de ${nombre}`}><button onClick={() => cambiarCantidad(linea.productoId, linea.cantidad - 1)} aria-label="Quitar una unidad">−</button><span>{linea.cantidad}</span><button onClick={() => cambiarCantidad(linea.productoId, linea.cantidad + 1)} aria-label="Añadir una unidad">+</button></div><strong className="line-total">{formatMoney(totalLinea)}</strong></article>;
        })}
        {calculando && <p className="calculation-note">Actualizando total…</p>}
        <Link className="back-link" href="/">← Seguir comprando</Link>
      </div><aside className="panel summary-panel"><p className="eyebrow">RESUMEN</p><h2>Total del pedido</h2>{resumen && <><div className="summary-line"><span>Unidades</span><strong>{resumen.totalUnidades}</strong></div><div className="summary-line"><span>Subtotal</span><strong>{formatMoney(resumen.subtotal)}</strong></div><div className="summary-line total-line"><span>Total</span><strong>{formatMoney(resumen.total)}</strong></div></>}<button className="primary-button" onClick={() => void confirmarCompra()} disabled={!resumen || calculando || comprando}>{comprando ? "Confirmando…" : "Confirmar compra"}</button><p className="form-hint">POST /api/carrito/calcular · POST /api/compras</p></aside></section>}
      <footer className="site-footer"><span>Mercado UPB</span><span>Pago de demostración · sin cobro</span></footer>
    </main>
  );
}
