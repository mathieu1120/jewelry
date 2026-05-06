"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { getProducts, deleteProduct } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import ProductForm from "@/components/admin/ProductForm";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  const { user, loading } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  async function load() {
    const data = await getProducts();
    setProducts(data);
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await deleteProduct(id);
    await load();
  }

  if (loading) return <div className="text-sm text-gray-400">Loading…</div>;
  if (!user) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Products</h1>
        <button className="btn-primary text-sm" onClick={() => { setEditProduct(null); setShowForm(true); }}>
          + Add product
        </button>
      </div>

      {(showForm || editProduct) && (
        <div className="mb-8">
          <ProductForm
            product={editProduct ?? undefined}
            onSave={async () => { setShowForm(false); setEditProduct(null); await load(); }}
            onCancel={() => { setShowForm(false); setEditProduct(null); }}
          />
        </div>
      )}

      <div className="space-y-3">
        {products.length === 0 && (
          <p className="text-gray-400 text-sm py-8 text-center">No products yet. Add your first piece!</p>
        )}
        {products.map((p) => (
          <div key={p.id} className="card flex items-center gap-4 p-4">
            {/* Thumbnail */}
            <div className="w-14 h-14 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
              {p.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{p.title}</p>
              <p className="text-gray-500 text-xs">{formatPrice(p.price)} · {p.category || "—"}</p>
            </div>

            {/* Status */}
            <span className={p.sold ? "badge-red" : "badge-green"}>
              {p.sold ? "Sold" : "Available"}
            </span>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="btn-secondary text-xs py-1 px-3" onClick={() => { setEditProduct(p); setShowForm(false); }}>
                Edit
              </button>
              <button className="btn-danger text-xs py-1 px-3" onClick={() => handleDelete(p.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
