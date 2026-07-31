// Single entry point the UI talks to for cart actions. Picks the guest
// (localStorage) cart or the real account cart depending on whether the
// person is logged in, so pages don't need their own if/else for it.

import { getCart, addToCart, updateCartItem, removeCartItem } from "../api/cart";
import {
  getGuestCartSummary,
  addToGuestCart,
  updateGuestCartItem,
  removeGuestCartItem,
  clearGuestCart
} from "./guestCart";

// Dispatch this after any cart mutation (add/update/remove) so the Navbar
// badge can refresh itself without prop drilling or a context provider.
export function notifyCartUpdated() {
  window.dispatchEvent(new Event("cart-updated"));
}

// Returns { items, subtotal }. Guest items don't have a cart_item_id, so
// callers should key off item.cart_item_id ?? item.product_id.
export async function fetchCart(token) {
  if (token) {
    return getCart(token);
  }
  return getGuestCartSummary();
}

// `product` needs: product_id, name, price, stock, image_url
export async function addItemToCart(product, quantity, token) {
  if (token) {
    return addToCart(product.product_id, quantity, token);
  }
  addToGuestCart(product, quantity);
  return { message: "Added to cart" };
}

export async function updateItemQuantity(itemId, quantity, token) {
  if (token) {
    return updateCartItem(itemId, quantity, token);
  }
  updateGuestCartItem(itemId, quantity);
  return { message: "Cart updated" };
}

export async function removeItemFromCart(itemId, token) {
  if (token) {
    return removeCartItem(itemId, token);
  }
  removeGuestCartItem(itemId);
  return { message: "Item removed from cart" };
}

// Call right after a successful login/registration. Pushes anything in
// the guest cart into the person's real account cart, skipping items
// that fail (e.g. gone out of stock) instead of blocking the whole
// merge, then clears the guest copy so it's never merged twice.
export async function mergeGuestCartIntoAccount(token) {
  const { items } = getGuestCartSummary();
  if (items.length === 0) return;

  await Promise.all(
    items.map((item) =>
      addToCart(item.product_id, item.quantity, token).catch((err) => {
        console.warn(`Could not merge "${item.name}" into cart:`, err.message);
      })
    )
  );

  clearGuestCart();
}