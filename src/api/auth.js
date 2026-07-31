const API_BASE_URL = "/api";

export async function loginUser({ email, password }) {

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data; // { message, token, user }
}

export async function registerUser({ name, email, password, phone }) {

  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, phone })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Signup failed");
  }

  return data; // { message, userId }
}