import { notFound } from "next/navigation";
import Image from "next/image";
import { adminDb } from "@/lib/firebase-admin";
import type { Product } from "@/types";
import BuyButton from "@/components/shop/BuyButton";
import { formatPrice } from "@/lib/utils";

export const revalidate = 30;

interface Props {
  params: { id: string };
}

export default async function ProductPage({ params }: Props) {
    const snap = await adminDb.collection("products").doc(params.id).get();
    if (!snap.exists) notFound();
    const data = snap.data()!;
    const product: Product = {
        ...data as Omit<Product, "id" | "createdAt" | "updatedAt">,
        id: snap.id,
        createdAt: data.createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.().toISOString() ?? new Date().toISOString(),
    };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <a href="/" className="text-sm text-gray-400 hover:text-gray-700 mb-8 inline-block">
        ← Back to shop
      </a>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* ── Images ── */}
        <div className="space-y-3">
          {product.images.length > 0 ? (
            product.images.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image src={url} alt={product.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            ))
          ) : (
            <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
              No image
            </div>
          )}
        </div>

        {/* ── Details ── */}
        <div className="flex flex-col">
          {product.category && (
            <span className="text-xs text-gray-400 uppercase tracking-wider mb-2">{product.category}</span>
          )}
          <h1 className="text-2xl font-semibold mb-3">{product.title}</h1>
          <p className="text-2xl font-light mb-6">{formatPrice(product.price)}</p>

          <p className="text-gray-600 text-sm leading-relaxed mb-8 whitespace-pre-line">
            {product.description}
          </p>

          {product.sold ? (
            <div className="px-5 py-3 bg-gray-100 rounded-md text-center text-gray-500 text-sm">
              Sold — thank you!
            </div>
          ) : (
            <BuyButton productId={product.id} />
          )}
        </div>
      </div>
    </main>
  );
}
