import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface Props {
  product: Product;
  small?: boolean;
}

export default function ProductCard({ product, small }: Props) {
  return (
    <Link href={`/product/${product.id}`} className="card group block hover:shadow-md transition-shadow">
      {/* Image */}
      <div className={`relative bg-gray-100 ${small ? "aspect-square" : "aspect-[4/5]"}`}>
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
        )}
        {product.sold && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="badge-gray text-xs font-medium">Sold</span>
          </div>
        )}
      </div>

      {/* Info */}
      {!small && (
        <div className="p-4">
          <p className="font-medium text-sm truncate">{product.title}</p>
          <p className="text-gray-500 text-sm mt-0.5">{formatPrice(product.price)}</p>
        </div>
      )}
    </Link>
  );
}
