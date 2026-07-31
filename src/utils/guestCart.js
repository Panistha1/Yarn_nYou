// Guest cart — lets someone add items to their cart before creating an
// account or logging in. Lives entirely in localStorage and gets merged
// into their real (database) cart the moment they log in.

const GUEST_CART_KEY = "guest_cart";

function readGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

// { items, subtotal } — same shape the real /api/cart endpoint returns,
// so the rest of the app doesn't need to know which one it's talking to.
export function getGuestCartSummary() {
  const items = readGuestCart();
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  return { items, subtotal };
}

export function addToGuestCart(product, quantity = 1) {
  const items = readGuestCart();
  const existing = items.find((i) => i.product_id === product.product_id);

  if (existing) {
    existing.quantity = Math.min(
      existing.quantity + quantity,
      product.stock ?? existing.quantity + quantity
    );
  } else {
    items.push({
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url || null,
      quantity: Math.min(quantity, product.stock ?? quantity)
    });
  }

  writeGuestCart(items);
  return items;
}

export function updateGuestCartItem(productId, quantity) {
  const items = readGuestCart().map((item) =>
    item.product_id === productId ? { ...item, quantity } : item
  );
  writeGuestCart(items);
  return items;
}

export function removeGuestCartItem(productId) {
  const items = readGuestCart().filter((item) => item.product_id !== productId);
  writeGuestCart(items);
  return items;
}

export function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY);
}

export function getGuestCartCount() {
  return readGuestCart().reduce((sum, item) => sum + item.quantity, 0);
}