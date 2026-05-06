import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product, ProductFormData, Order } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toISO(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

// ─── Products ─────────────────────────────────────────────────────────────────

const productsCol = collection(db, "products");

export async function getProducts(): Promise<Product[]> {
  const q = query(productsCol, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...(d.data() as Omit<Product, "id" | "createdAt" | "updatedAt">),
    id: d.id,
    createdAt: toISO(d.data().createdAt),
    updatedAt: toISO(d.data().updatedAt),
  }));
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return null;
  return {
    ...(snap.data() as Omit<Product, "id" | "createdAt" | "updatedAt">),
    id: snap.id,
    createdAt: toISO(snap.data().createdAt),
    updatedAt: toISO(snap.data().updatedAt),
  };
}

export async function createProduct(data: ProductFormData): Promise<string> {
  const ref = await addDoc(productsCol, {
    ...data,
    sold: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(
  id: string,
  data: Partial<ProductFormData>
): Promise<void> {
  await updateDoc(doc(db, "products", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
}

export async function markProductSold(id: string): Promise<void> {
  await updateDoc(doc(db, "products", id), {
    sold: true,
    stock: 0,
    updatedAt: serverTimestamp(),
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

const ordersCol = collection(db, "orders");

export async function getOrders(): Promise<Order[]> {
  const q = query(ordersCol, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...(d.data() as Omit<Order, "id" | "createdAt" | "updatedAt">),
    id: d.id,
    createdAt: toISO(d.data().createdAt),
    updatedAt: toISO(d.data().updatedAt),
  }));
}
