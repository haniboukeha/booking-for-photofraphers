"use client";

export interface CartAddon {
  addonId: string;
  name: string;
  price: number;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  allowQuantity: boolean;
}

export interface CartItem {
  id: string;
  serviceId: string;
  serviceName: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  durationMinutes?: number;
  addons: CartAddon[];
}

const KEY = "booking_cart_v1";
const listeners = new Set<() => void>();
let snapshot: CartItem[] = [];
let loaded = false;

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    // storage unavailable — cart stays in memory
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  try {
    snapshot = JSON.parse(localStorage.getItem(KEY) ?? "[]") as CartItem[];
  } catch {
    snapshot = [];
  }
  loaded = true;
}

export function subscribe(listener: () => void): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): CartItem[] {
  ensureLoaded();
  return snapshot;
}

export function addToCart(item: CartItem) {
  ensureLoaded();
  snapshot = [...snapshot, item];
  persist();
  emit();
}

export function removeFromCart(id: string) {
  ensureLoaded();
  snapshot = snapshot.filter((i) => i.id !== id);
  persist();
  emit();
}

export function setAddonQuantity(itemId: string, addonId: string, quantity: number) {
  ensureLoaded();
  snapshot = snapshot.map((item) =>
    item.id !== itemId
      ? item
      : { ...item, addons: item.addons.map((a) => (a.addonId === addonId ? { ...a, quantity } : a)) }
  );
  persist();
  emit();
}

export function clearCart() {
  ensureLoaded();
  snapshot = [];
  persist();
  emit();
}

export function itemTotal(item: CartItem): number {
  return item.packagePrice + item.addons.reduce((s, a) => s + a.price * a.quantity, 0);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((s, i) => s + itemTotal(i), 0);
}
