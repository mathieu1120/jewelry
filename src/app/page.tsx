import { adminDb } from "@/lib/firebase-admin";
import ProductCard from "@/components/shop/ProductCard";
import type { Product } from "@/types";

export const revalidate = 60;

export default async function HomePage() {
    const snap = await adminDb.collection("products").orderBy("createdAt", "desc").get();
    const products = snap.docs.map((d) => ({
        ...(d.data() as Omit<Product, "id" | "createdAt" | "updatedAt">),
        id: d.id,
        createdAt: d.data().createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
        updatedAt: d.data().updatedAt?.toDate?.().toISOString() ?? new Date().toISOString(),
    }));

    const available = products.filter((p) => !p.sold);
    const sold = products.filter((p) => p.sold);

    return (
        <main className="max-w-5xl mx-auto px-4 py-12">
            <header className="mb-12 text-center">
                <h1 className="text-3xl font-semibold tracking-tight mb-2">The Shop</h1>
                <p className="text-gray-500 text-sm">Handmade jewelry &amp; art — each piece one of a kind</p>
            </header>

            {available.length > 0 ? (
                <section className="mb-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {available.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            ) : (
                <p className="text-center text-gray-400 py-20">No pieces available right now — check back soon.</p>
            )}

            {sold.length > 0 && (
                <section>
                    <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Previously sold</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 opacity-50">
                        {sold.map((p) => (
                            <ProductCard key={p.id} product={p} small />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}