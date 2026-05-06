import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("SESSION SHIPPING:", JSON.stringify(session.shipping_details));
  console.log("SESSION CUSTOMER:", JSON.stringify(session.customer_details));
  const productId = session.metadata?.productId;
  if (!productId) {
    console.error("No productId in session metadata");
    return;
  }

  const productSnap = await adminDb.collection("products").doc(productId).get();
  if (!productSnap.exists) {
    console.error("Product not found:", productId);
    return;
  }

  const product = productSnap.data()!;
  const address = session.shipping_details?.address;
  const customerName = session.shipping_details?.name ?? session.customer_details?.name ?? "";

  // Build the order
  const orderData = {
    productId,
    productTitle: product.title,
    productPrice: product.price,
    stripePaymentIntentId: session.payment_intent as string,
    stripeSessionId: session.id,
    customerEmail: session.customer_details?.email ?? "",
    shippingAddress: {
      name: customerName,
      line1: address?.line1 ?? "",
      line2: address?.line2 ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      postalCode: address?.postal_code ?? "",
      country: address?.country ?? "",
    },
    status: "paid",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  // Write order + mark product sold atomically
  const batch = adminDb.batch();

  const orderRef = adminDb.collection("orders").doc();
  batch.set(orderRef, orderData);

  const productRef = adminDb.collection("products").doc(productId);
  batch.update(productRef, {
    sold: true,
    stock: 0,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await batch.commit();
  console.log(`Order ${orderRef.id} created for product ${productId}`);
}
