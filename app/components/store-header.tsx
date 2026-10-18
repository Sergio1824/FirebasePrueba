"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CART_EVENT, readCart } from "@/app/lib/api";

export default function StoreHeader() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(readCart().reduce((sum, item) => sum + item.cantidad, 0));
    update();
    window.addEventListener(CART_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(CART_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return (
    <header className="topbar">
      <Link className="brand" href="/"><span className="brand-icon">U</span><span>Mercado UPB</span></Link>
      <nav className="main-nav" aria-label="Navegación principal">
        <Link href="/">Productos</Link>
        <Link className="cart-link" href="/carrito/">Carrito <span className="cart-count">{count}</span></Link>
      </nav>
    </header>
  );
}