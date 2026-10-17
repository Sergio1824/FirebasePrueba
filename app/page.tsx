"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://backendupbtest.onrender.com").replace(/\/$/, "");

type Producto = { id: number; nombre: string; precio: number | string; stock: number };

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");

  const cargarProductos = useCallback(async () => {
    setError("");
    try {
      const respuesta = await fetch(`${API_URL}/api/productos`);
      if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}.`);
      setProductos(await respuesta.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo conectar con el backend.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { void cargarProductos(); }, [cargarProductos]);

  async function crearProducto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const respuesta = await fetch(`${API_URL}/api/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), precio: Number(precio), stock: Number(stock) }),
      });
      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(datos.error || `La API respondió ${respuesta.status}.`);
      setNombre(""); setPrecio(""); setStock("");
      await cargarProductos();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el producto.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar"><a className="brand" href="#inicio"><span className="brand-icon">P</span><span>Productos UPB</span></a><span className="connection"><i /> API conectada</span></header>
      <section className="intro" id="inicio"><p className="eyebrow">BACKEND + FIREBASE</p><h1>Inventario de productos</h1><p>Los datos se consultan y guardan en la API de productos desplegada en Render.</p></section>
      <section className="content-grid">
        <div className="panel inventory"><div className="panel-heading"><div><p className="eyebrow">CATÁLOGO</p><h2>Productos</h2></div><button className="secondary-button" onClick={() => void cargarProductos()} disabled={cargando}>Actualizar</button></div>
          {error && <p className="notice error" role="alert">{error} Comprueba que el backend esté activo.</p>}
          {cargando ? <p className="empty">Cargando productos…</p> : productos.length === 0 ? <p className="empty">Aún no hay productos. Puedes crear el primero.</p> : <div className="table-wrap"><table><thead><tr><th>Producto</th><th>Precio</th><th>Stock</th></tr></thead><tbody>{productos.map((p) => <tr key={p.id}><td><strong>{p.nombre}</strong><small>ID {p.id}</small></td><td>${Number(p.precio).toFixed(2)}</td><td><span className="stock">{p.stock}</span></td></tr>)}</tbody></table></div>}
        </div>
        <form className="panel form-panel" onSubmit={crearProducto}><p className="eyebrow">NUEVO REGISTRO</p><h2>Agregar producto</h2><label>Nombre<input required maxLength={100} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Cuaderno" /></label><div className="form-row"><label>Precio<input required type="number" min="0" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="0.00" /></label><label>Stock<input required type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" /></label></div><button className="primary-button" disabled={guardando}>{guardando ? "Guardando…" : "Guardar producto"}</button><p className="form-hint">La operación se realiza con POST /api/productos.</p></form>
      </section>
      <footer>Proyecto académico · Frontend Firebase Hosting · Backend Render</footer>
    </main>
  );
}