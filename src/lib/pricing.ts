// Shared pricing function (spec §8/§9): implemented once, used by UI preview and server.

export interface PriceLine {
  price: number;
  quantity: number;
}

export function computeAddonLine(addon: PriceLine): number {
  return addon.price * addon.quantity;
}

export function computeTotal(packagePrice: number, addons: PriceLine[]): number {
  return packagePrice + addons.reduce((sum, a) => sum + computeAddonLine(a), 0);
}
