const API_BASE_URL = "/api";

export async function createOrder(payload, token) {

  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to place order");
  }

  return data; // { message, orderId, totalAmount }
}

export async function getMyOrders(token) {

  const res = await fetch(`${API_BASE_URL}/orders/my`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load your orders");
  }

  return data;
}

export async function getMyOrderById(orderId, token) {

  const res = await fetch(`${API_BASE_URL}/orders/my/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load order");
  }

  return data; // { order, items }
}

export async function getAllOrders(token) {

  const res = await fetch(`${API_BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load orders");
  }

  return data; // { orders, stats }
}

export async function getOrderById(orderId, token) {

  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load order");
  }

  return data; // { order, items, history, notes }
}

export async function updateOrderStatus(orderId, payload, token) {

  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update order status");
  }

  return data;
}