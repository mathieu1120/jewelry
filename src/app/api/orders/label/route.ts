import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const orderSnap = await adminDb.collection("orders").doc(orderId).get();
    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orderSnap.data()!;
    const addr = order.shippingAddress;

    // Call Shippo REST API directly (avoids SDK version issues)
    const shippoRes = await fetch("https://api.goshippo.com/transactions/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shipment: {
          address_from: {
            name: process.env.SHOP_OWNER_NAME ?? "Shop Owner",
            street1: process.env.SHOP_ADDRESS_LINE1,
            city: process.env.SHOP_CITY,
            state: process.env.SHOP_STATE,
            zip: process.env.SHOP_ZIP,
            country: "US",
            email: process.env.SHOP_EMAIL,
          },
          address_to: {
            name: addr.name,
            street1: addr.line1,
            street2: addr.line2 ?? "",
            city: addr.city,
            state: addr.state,
            zip: addr.postalCode,
            country: addr.country,
            email: order.customerEmail,
          },
          parcels: [
            {
              length: "10",
              width: "8",
              height: "4",
              distance_unit: "in",
              weight: "1",
              mass_unit: "lb",
            },
          ],
        },
        carrier_account: process.env.SHIPPO_CARRIER_ACCOUNT,
        servicelevel_token: "usps_first",
        label_file_type: "PDF",
        async: false,
      }),
    });

    const label = await shippoRes.json();

    if (label.status !== "SUCCESS") {
      console.error("Shippo error:", label.messages);
      return NextResponse.json(
        { error: "Label creation failed", details: label.messages },
        { status: 500 }
      );
    }

    // Save label info to order
    await adminDb.collection("orders").doc(orderId).update({
      shippoLabelUrl: label.label_url,
      shippoTrackingNumber: label.tracking_number,
      shippoTransactionId: label.object_id,
      status: "shipped",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      labelUrl: label.label_url,
      trackingNumber: label.tracking_number,
    });
  } catch (err) {
    console.error("Label error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
