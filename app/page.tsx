"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import StoreHeader from "@/app/components/store-header";
import { CartLine, formatMoney, Producto, readCart, requestApi, saveCart } from "@/app/lib/api";

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");

  const cargarProductos = useCallback(async () => {
    setError("");
    try {
      setProductos(await requestApi<Producto[]>("/api/productos"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el catalogo. Intenta actualizar.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { void cargarProductos(); }, [cargarProductos]);

  function agregarAlCarrito(productoId: number) {
    const cart: CartLine[] = readCart();
    const existing = cart.find((line) => line.productoId === productoId);
    if (existing) existing.cantidad += 1;
    else cart.push({ productoId, cantidad: 1 });
    saveCart(cart);
    setMensaje("Añadido al carrito.");
    window.setTimeout(() => setMensaje(""), 2200);
  }

  async function crearProducto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      await requestApi<Producto>("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), precio: Number(precio), stock: Number(stock) }),
      });
      setNombre(""); setPrecio(""); setStock("");
      setMensaje("Producto agregado al catálogo.");
      await cargarProductos();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el producto.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="app-shell">
      <StoreHeader />
      <section className="hero intro">
        <div><p className="eyebrow">TIENDA DE DEMOSTRACIÓN · UPB</p><h1>Compra lo que necesitas para tu semestre.</h1><p>Explora el catálogo, arma tu carrito y confirma una compra. El inventario y los totales se actualizan al instante.</p></div>
        <div className="hero-card"><span className="hero-card-mark">U</span><strong>Mercado<br />Universitario</strong><small>Compra sencilla, inventario en tiempo real.</small></div>
      </section>
      {error && <p className="notice error" role="alert">{error}</p>}
      {mensaje && <p className="notice success" role="status">{mensaje}</p>}
      <section className="shop-layout">
        <div className="catalog-section">
          <div className="section-heading"><div><p className="eyebrow">CATÁLOGO</p><h2>Productos disponibles</h2></div><button className="secondary-button" onClick={() => void cargarProductos()} disabled={cargando}>Actualizar</button></div>
          {cargando ? <p className="empty">Cargando inventario…</p> : productos.length === 0 ? <p className="empty">Todavía no hay productos en el catálogo.</p> : <div className="product-grid">{productos.map((producto, index) => <article className="product-card" key={producto.id}><div className={`product-art art-${index % 4}`} aria-hidden="true"><span>{producto.nombre.slice(0, 1).toUpperCase()}</span></div><div className="product-info"><p className="product-category">PRODUCTO UPB · #{producto.id}</p><h3>{producto.nombre}</h3><div className="product-bottom"><div><strong>{formatMoney(producto.precio)}</strong><small>{producto.stock} disponibles</small></div><button className="add-button" onClick={() => agregarAlCarrito(producto.id)} disabled={producto.stock < 1} aria-label={`Añadir ${producto.nombre} al carrito`}>Añadir <span aria-hidden="true">+</span></button></div></div></article>)}</div>}
        </div>
        <form className="panel form-panel" onSubmit={crearProducto}><p className="eyebrow">AMPLÍA EL CATÁLOGO</p><h2>Agregar producto</h2><p className="panel-copy">Agrega un artículo nuevo al catálogo de Mercado UPB.</p><label>Nombre<input required maxLength={100} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Cuaderno universitario" /></label><div className="form-row"><label>Precio (Bs)<input required type="number" min="0" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="18.50" /></label><label>Stock inicial<input required type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="20" /></label></div><button className="primary-button" disabled={guardando}>{guardando ? "Guardando…" : "Guardar en el catálogo"}</button></form>
      </section>
      <footer className="site-footer"><span>Mercado UPB</span><span>Catálogo · carrito · compra</span></footer>
    </main>
  );
}