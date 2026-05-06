import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import type { CreateCheckoutPayload } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { productId }: CreateCheckoutPayload = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // Fetch product from Firestore (server-side)
    const productSnap = await adminDb.collection("products").doc(productId).get();
    if (!productSnap.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = productSnap.data()!;

    if (product.sold || product.stock < 1) {
      return NextResponse.json({ error: "Product is no longer available" }, { status: 409 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.title,
              ...(product.description && { description: product.description }),
              images: product.images?.slice(0, 1) ?? [],
            },
            unit_amount: product.price, // already in cents
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "FR", "DE", "AU"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "usd" },
            display_name: "Standard shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 10 },
            },
          },
        },
      ],
      metadata: {
        productId,
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/product/${productId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
