const API_BASE_URL = "/api";

export async function getCart(token) {

  const res = await fetch(`${API_BASE_URL}/cart`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load cart");
  }

  return data; // { items, subtotal }
}

export async function addToCart(productId, quantity, token) {

  const res = await fetch(`${API_BASE_URL}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ product_id: productId, quantity })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to add to cart");
  }

  return data;
}

export async function updateCartItem(itemId, quantity, token) {

  const res = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ quantity })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update cart item");
  }

  return data;
}

export async function removeCartItem(itemId, token) {

  const res = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to remove cart item");
  }

  return data;
}