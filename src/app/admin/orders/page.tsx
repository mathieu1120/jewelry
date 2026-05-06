"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { getOrders } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

const STATUS_BADGE: Record<string, string> = {
  pending: "badge-yellow",
  paid: "badge-blue",
  shipped: "badge-green",
  cancelled: "badge-red",
};

export default function AdminOrdersPage() {
  const { user, loading } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [labelLoading, setLabelLoading] = useState<string | null>(null);

  async function load() {
    const data = await getOrders();
    setOrders(data);
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function handleGenerateLabel(orderId: string) {
    if (!confirm("Generate shipping label and mark as shipped?")) return;
    setLabelLoading(orderId);
    try {
      const res = await fetch("/api/orders/label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok) {
        window.open(data.labelUrl, "_blank");
        await load();
      } else {
        alert("Label error: " + data.error);
      }
    } finally {
      setLabelLoading(null);
    }
  }

  if (loading) return <div className="text-sm text-gray-400">Loading…</div>;
  if (!user) return null;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Orders</h1>

      {orders.length === 0 && (
        <p className="text-gray-400 text-sm py-8 text-center">No orders yet.</p>
      )}

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="card p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-medium text-sm">{o.productTitle}</p>
                <p className="text-xs text-gray-500 mt-0.5">{o.customerEmail}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-medium">{formatPrice(o.productPrice)}</span>
                <span className={STATUS_BADGE[o.status] ?? "badge-gray"}>{o.status}</span>
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-gray-50 rounded p-3 text-xs text-gray-600 mb-3">
              <p className="font-medium text-gray-800">{o.shippingAddress.name}</p>
              <p>{o.shippingAddress.line1}{o.shippingAddress.line2 ? `, ${o.shippingAddress.line2}` : ""}</p>
              <p>{o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.postalCode}</p>
              <p>{o.shippingAddress.country}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {o.status === "paid" && (
                <button
                  className="btn-primary text-xs py-1.5 px-3"
                  disabled={labelLoading === o.id}
                  onClick={() => handleGenerateLabel(o.id)}
                >
                  {labelLoading === o.id ? "Generating…" : "Generate label & ship"}
                </button>
              )}
              {o.shippoLabelUrl && (
                <a href={o.shippoLabelUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-1.5 px-3">
                  Print label
                </a>
              )}
              {o.shippoTrackingNumber && (
                <span className="text-xs text-gray-500">
                  Tracking: <span className="font-mono">{o.shippoTrackingNumber}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-3">
              {new Date(o.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
