"use client";

import { useState } from "react";
import { createProduct, updateProduct } from "@/lib/db";
import { uploadProductImage } from "@/lib/storage";
import type { Product } from "@/types";

interface Props {
  product?: Product;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSave, onCancel }: Props) {
  const isEdit = !!product;

  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price / 100) : "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [stock, setStock] = useState(product ? String(product.stock) : "1");
  const [isSold, setIsSold] = useState(product?.sold ?? false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const priceInCents = Math.round(parseFloat(price) * 100);
      if (isNaN(priceInCents) || priceInCents <= 0) {
        setError("Enter a valid price");
        return;
      }

      // Determine product ID for storage path
      const productId = product?.id ?? `prod_${Date.now()}`;

      // Upload any new images
      const uploadedUrls = await Promise.all(
        imageFiles.map((f) => uploadProductImage(f, productId))
      );

      const allImages = [...images, ...uploadedUrls];

      const data = {
        title,
        description,
        price: priceInCents,
        category,
        stock: parseInt(stock, 10),
        images: allImages,
        sold: isSold,
      };

      if (isEdit) {
        await updateProduct(product.id, data);
      } else {
        await createProduct(data);
      }

      onSave();
    } catch (err) {
      console.error(err);
      setError("Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setImageFiles((prev) => [...prev, ...files]);
  }

  function removeNewImage(i: number) {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function removeExistingImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <h2 className="font-semibold">{isEdit ? "Edit product" : "New product"}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Title *</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="label">Category</label>
          <input className="input" placeholder="e.g. Ring, Necklace, Art" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Price (USD) *</label>
          <input className="input" type="number" min="0.01" step="0.01" placeholder="50.00" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div>
          <label className="label">Stock</label>
          <input className="input" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <input
              type="checkbox"
              id="sold"
              checked={isSold}
              onChange={(e) => setIsSold(e.target.checked)}
              className="w-4 h-4"
          />
          <label htmlFor="sold" className="text-sm text-gray-700">Mark as sold</label>
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea className="input min-h-[100px] resize-y" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      {/* Images */}
      <div>
        <label className="label">Images</label>
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((url) => (
            <div key={url} className="relative w-20 h-20 rounded overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeExistingImage(url)}
                className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                ×
              </button>
            </div>
          ))}
          {imageFiles.map((f, i) => (
            <div key={i} className="relative w-20 h-20 rounded overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeNewImage(i)}
                className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                ×
              </button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" multiple onChange={handleFileChange} className="text-sm text-gray-500" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
