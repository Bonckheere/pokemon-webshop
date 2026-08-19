import { useEffect, useState } from "react";
import { fetchProducts } from "../api";
import { ProductCard } from "../components/ProductCard";
import type { Product } from "../types";

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("Could not load products."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="status">Loading Pokémon...</p>;
  if (error) return <p className="status error">{error}</p>;

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
